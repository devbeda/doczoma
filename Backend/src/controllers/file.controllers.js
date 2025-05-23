import { Folder } from "../models/folder.model.js";
import { File } from "../models/file.model.js";
import { User } from "../models/user.model.js";
import fs from "fs";
import path from "path";
import cloudinary from "../utils/cloudinary.js";
import bytes from "bytes";

import crypto from "crypto";
import { uploadToS3 } from "../middlewares/multer.middleware.js";

import { deleteFromS3 } from "../utils/s3Utils.js";

export const createFolder = async (req, res) => {
  try {
    const { name, parentFolder } = req.body;
    const userId = req.user?._id;

    if (!name) {
      return res.status(400).json({ message: "Folder name is required." });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user ID missing." });
    }

    // Automatically determine if it's a root folder
    const isRoot = !parentFolder;

    let parent = null;
    if (!isRoot && parentFolder) {
      parent = await Folder.findById(parentFolder);
      if (!parent) {
        return res.status(404).json({ message: "Parent folder not found." });
      }
    }

    const newFolder = await Folder.create({
      name,
      isRoot,
      owner: userId,
      parentFolder: isRoot ? null : parentFolder,
    });

    // If it's not a root folder, update the parent
    if (!isRoot && parent) {
      parent.childFolders.push(newFolder._id);
      await parent.save();
    }

    // If it's a root folder, update the user
    if (isRoot) {
      await User.findByIdAndUpdate(userId, {
        $push: { rootFolders: newFolder._id },
      });
    }

    res.status(201).json({
      message: "Folder created successfully.",
      folder: newFolder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const { name, isRoot, parentFolder, schedule } = req.body;
    const userId = req.user?._id;

    if (!name || !req.file) {
      return res.status(400).json({ message: "File and name are required." });
    }

    const user = await User.findById(userId).populate("choosedPlan");
    if (!user || !user.choosedPlan) {
      return res.status(400).json({ message: "User or plan not found." });
    }

    const currentStorage = user.storageOccupide || 0;
    const planStorageLimitBytes = bytes(user.choosedPlan.storageLimit);
    const fileSize = req.file.size;

    if (currentStorage + fileSize > planStorageLimitBytes) {
      return res
        .status(400)
        .json({ message: "Storage limit exceeded. Upgrade your plan." });
    }

    const extension = path.extname(req.file.originalname);
    const fileNameInS3 = `${name}${extension}`;
    const fileUrl = await uploadToS3(req.file, fileNameInS3);

    const isRootBool = isRoot === true || isRoot === "true";

    const newFile = await File.create({
      name: fileNameInS3,
      isRoot: isRootBool,
      owner: userId,
      parentfolder: isRootBool ? null : parentFolder || null,
      size: fileSize,
      fileUrl: fileUrl,
      schedule: schedule ? new Date(schedule) : undefined,
      fileType: extension.replace(".", "").toLowerCase(),
    });

    if (!isRootBool && parentFolder) {
      const folder = await Folder.findById(parentFolder);
      if (folder) {
        folder.childFiles.push(newFile._id);
        await folder.save();
      }
    }

    await User.findByIdAndUpdate(userId, {
      $push: isRootBool ? { rootFiles: newFile._id } : {},
      $inc: { storageOccupide: fileSize },
    });

    return res.status(201).json({
      message: "File uploaded successfully.",
      file: newFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFoldersById = async (req, res) => {
  try {
    const folderId = req.params.id;
    if (!folderId) {
      return res.status(400).json({ message: "folder is required" });
    }

    const folder = await Folder.findById(folderId)
      .populate("childFolders")
      .populate("childFiles");
    if (!folder) {
      return res.status(400).json({ message: "can't find your folder" });
    }

    return res
      .status(200)
      .json({ message: "Folder fetched succcessfully.", folder });
  } catch (error) {
    console.error("Geting error while fetching your folder");
    return res.status(500).json({ message: "Server Error", error });
  }
};

export const getFileById = async (req, res) => {
  try {
    const fileId = req.params.id;
    if (!fileId) {
      return res.status(400).json({ message: "file is required" });
    }

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(400).json({ message: "can't find your file" });
    }

    return res
      .status(200)
      .json({ message: "Folder fetched succcessfully.", file });
  } catch (error) {
    console.error("Geting error while fetching your folder");
    return res.status(500).json({ message: "Server Error", error });
  }
};

export const updateFolderById = async (req, res) => {
  try {
    const { name } = req.body;
    const folderId = req.params.id;

    const updatedFolder = await Folder.findByIdAndUpdate(
      folderId,
      { name },
      { new: true }
    );

    if (!updatedFolder) {
      return res.status(500).json({ message: "can't find your folder" });
    }

    res
      .status(200)
      .json({ message: "Folder updated successfully", folder: updatedFolder });
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateFileById = async (req, res) => {
  try {
    const fileId = req.params.id;
    const { name, schedule } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (schedule !== undefined) updateData.schedule = schedule;

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided to update." });
    }

    const updatedFile = await File.findByIdAndUpdate(fileId, updateData, {
      new: true,
    });

    if (!updatedFile) {
      return res.status(404).json({ message: "File not found." });
    }

    res
      .status(200)
      .json({ message: "File updated successfully.", file: updatedFile });
  } catch (error) {
    console.error("Error updating file:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Recursive folder deletion (S3 only)
const deleteFolderRecursive = async (folderId) => {
  let totalDeletedBytes = 0;

  const folder = await Folder.findById(folderId).populate(
    "childFolders childFiles"
  );
  if (!folder) return totalDeletedBytes;

  for (const file of folder.childFiles) {
    const url = file.fileUrl;

    // 🗑️ Delete from S3
    if (url && url.includes("amazonaws.com")) {
      await deleteFromS3(url);
    }

    totalDeletedBytes += file.size || 0;

    await File.findByIdAndDelete(file._id);
  }

  // Recursive delete of subfolders
  for (const child of folder.childFolders) {
    totalDeletedBytes += await deleteFolderRecursive(child._id);
  }

  await Folder.findByIdAndDelete(folder._id);
  return totalDeletedBytes;
};

export const deleteFolder = async (req, res) => {
  try {
    const folderId = req.params.id;
    const userId = req.user?._id;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found." });
    }

    if (String(folder.owner) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this folder." });
    }

    // Remove reference from user or parent
    if (folder.isRoot) {
      await User.findByIdAndUpdate(userId, {
        $pull: { rootFolders: folderId },
      });
    } else if (folder.parentFolder) {
      await Folder.findByIdAndUpdate(folder.parentFolder, {
        $pull: { childFolders: folderId },
      });
    }

    // Recursively delete and get total size of deleted files
    const deletedBytes = await deleteFolderRecursive(folderId);

    // Subtract from user's storage
    await User.findByIdAndUpdate(userId, {
      $inc: { storageOccupide: -deletedBytes },
    });

    res
      .status(200)
      .json({ message: "Folder and its contents deleted successfully." });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user._id;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    if (String(file.owner) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this file." });
    }

    const url = file.fileUrl;

    if (url && url.includes("amazonaws.com")) {
      await deleteFromS3(url);
    }

    if (!file.isRoot && file.parentfolder) {
      await Folder.findByIdAndUpdate(file.parentfolder, {
        $pull: { childFiles: file._id },
      });
    }

    if (file.isRoot) {
      await User.findByIdAndUpdate(userId, {
        $pull: { rootFiles: file._id },
      });
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { storageOccupide: -file.size },
    });

    await File.findByIdAndDelete(fileId);

    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTodayScheduledFiles = async (req, res) => {
  try {
    const userId = req.user._id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const scheduledFiles = await File.find({
      owner: userId,
      schedule: { $gte: todayStart, $lte: todayEnd },
    });

    return res.status(200).json({
      message: "Scheduled files for today fetched.",
      files: scheduledFiles,
    });
  } catch (error) {
    console.error("Error fetching scheduled files:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
