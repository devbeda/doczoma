import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createFolder,
  deleteFolder,
  deleteFile,
  getFoldersById,
  updateFileById,
  updateFolderById,
  uploadFile,
  getFileById,
} from "../controllers/file.controllers.js";
import { docUpload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/createfolder", verifyJWT, createFolder); // WORKING:
router.post("/uploadfile", verifyJWT,docUpload.single("file"), uploadFile); // WORKING:
router.get("/getfoldersbyid/:id", getFoldersById); // WORKING:
router.get("/getFileById/:id", getFileById); // WORKING:
router.patch("/updatefolderbyid/:id", updateFolderById); // WORKING:
router.patch("/updatefilebyid/:id", updateFileById); // WORKING:
router.delete("/deletefolder/:id", verifyJWT, deleteFolder); // WORKING:
router.delete("/deletefile/:id", verifyJWT, deleteFile); // WORKING:



export default router;