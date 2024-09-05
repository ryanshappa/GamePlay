// src/api/uploadthing/core.ts

import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import * as fs from "fs";
import * as unzipper from "unzipper";

// Function to handle file uploads
const f = createUploadthing();

export const ourFileRouter = {
  gameUploader: f({ blob: { maxFileSize: "1GB" } })
    .middleware(async ({ req }) => {
      const user = auth();

      if (!user.userId) throw new UploadThingError("Unauthorized");

      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      const zipFilePath = file.url;

      try {
        const stream = fs.createReadStream(zipFilePath).pipe(
          unzipper.Extract({ path: `/path/to/extract/${metadata.userId}` })
        );

        stream.on("close", () => {
          console.log("File extraction complete.");
          const htmlFilePath = `/path/to/extract/${metadata.userId}/index.html`;
          console.log("Game ready at:", htmlFilePath);
        });
      } catch (err) {
        console.error("Error during file extraction:", err);
      }

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
