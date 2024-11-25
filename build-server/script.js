import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { s3Service } from "./lib/awsClient";
import mime from "mime-types";

const projectId = process.env.PROJECT_ID || "";

async function init() {
  try {
    console.log("Executing Scripts");
    const outputDirPath = path.join(__dirname, "output");

    const process = exec(`cd ${outputDirPath} && npm install && npm run build`);

    if (!process) {
      throw new Error("Error in executing the script");
    }

    process.stdout?.on("data", (data) => {
      console.log(data.toString());
    });

    process.stdout?.on("error", (data) => {
      console.log("Error", data.toString());
    });

    process.on("close", async () => {
      console.log("Build Successful");
      const distFolderPath = path.join(__dirname, "dist");
      const distFolderContent = fs.readdirSync(distFolderPath, {
        recursive: true,
      });

      for (const filePath of distFolderContent) {
        if (fs.lstatSync(filePath).isDirectory()) continue;

        console.log("Uploading File");

        const fileType = mime.lookup("js");

        if (!fileType) {
          throw new Error("Error in getting file type");
        }

        const isUploaded = await s3Service.uploadDataToS3(
          projectId,
          filePath,
          fileType
        );

        if (!isUploaded.success) {
          throw new Error("Error in uploading file to S3");
        }

        console.log("File Uploaded Successfully");
      }
    });
  } catch (error) {
    console.log("Error", error);
  }
}
