import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";

const s3ClientConfig = {
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};

// S3 Service class
export class S3Service {
  s3Client;
  static instance;

  static getInstance(config) {
    if (!this.instance) {
      this.instance = new S3Service(config);
    }
    return this.instance;
  }

  constructor(config) {
    this.s3Client = new S3Client(config);
    // logs keys
    console.log("AWS_ACCESS_KEY_ID", process.env.AWS_ACCESS_KEY_ID);
    console.log("AWS_SECRET_ACCESS_KEY", process.env.AWS_SECRET_ACCESS_KEY);
  }

  async uploadDataToS3(projectId, filePath, contentType) {
    try {
      const bucket = "easy-deploy";
      const fileName = `__output/${projectId}/${filePath}`;

      // Prepare the upload parameters
      const uploadParams = {
        Bucket: bucket,
        Key: fileName,
        Body: fs.createReadStream(filePath),
        ContentType: contentType,
      };

      // Upload to S3
      const command = new PutObjectCommand(uploadParams);
      const response = await this.s3Client.send(command);

      console.log(`Successfully uploaded data to ${bucket}/${fileName}`);
      return { success: true, data: response };
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  }

  async fetchJson() {
    try {
      const bucketName = "snapshot-probo";
      const fileName = "snapshot.json";
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error("Empty response body");
      }

      const data = await response?.Body?.transformToString();
      // console.log("Data fetched from S3:", data);
      let mutableRes = structuredClone(data);

      return {
        success: true,
        data: mutableRes,
      };
    } catch (error) {
      console.error("Error fetching from S3:", error);
      return {
        success: false,
        error: error?.message,
      };
    }
  }
}

export const s3Service = S3Service.getInstance(s3ClientConfig);
