// src/utils/s3Utils.js
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/aws.js"; // your initialized S3Client

export const deleteFromS3 = async (fileUrl) => {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME; // e.g. "doczoma"

    // Parse the URL to get pathname like "/uploads/pvtii.jpg"
    const url = new URL(fileUrl);

    // Remove the leading slash from pathname to get the key
    const Key = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;

    const deleteParams = {
      Bucket: bucketName,
      Key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);

    // console.log(`Deleted ${Key} from bucket ${bucketName} successfully.`);
  } catch (error) {
    console.error("Failed to delete from S3:", error);
  }
};
