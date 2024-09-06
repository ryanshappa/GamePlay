import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import * as fs from 'fs';
import * as unzipper from 'unzipper';
import { NextApiRequest, NextApiResponse } from "next";

const f = createUploadthing();

export const ourFileRouter = {
  gameUploader: f({ blob: { maxFileSize: "1GB" } }) // Allowing zip files
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
        const stream = fs.createReadStream(zipFilePath)
          .pipe(unzipper.Extract({ path: `/path/to/extract/${metadata.userId}` }));

        stream.on('close', () => {
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Adjust the size limit as needed
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Your file upload logic here

  return res.status(200).json({ message: "File uploaded successfully" });
}
