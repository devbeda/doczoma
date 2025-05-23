// middlewares/upload.js
import multer from "multer";
import { Upload } from "@aws-sdk/lib-storage";
import { s3 } from "../config/aws.js";
import { Readable } from "stream";

const storage = multer.memoryStorage();

export const docUpload = multer({ storage });

export const uploadToS3 = async (file, fileNameInS3) => {
  try {
    const stream = Readable.from(file.buffer);

    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${fileNameInS3}`,  // folder is 'uploads'
        Body: stream,
        ContentType: file.mimetype,
        // Do NOT use ACL here if your bucket blocks ACLs (recommended)
        // ACL: 'public-read',
      },
    });

    await upload.done();

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileNameInS3}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file");
  }
};
