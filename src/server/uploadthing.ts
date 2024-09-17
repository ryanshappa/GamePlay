import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  gameUploader: f({ blob: { maxFileSize: "1GB" } })
    .middleware(async () => {
      const { userId } = auth();
      console.log("Auth check:", userId);

      if (!userId) {
        console.error("Unauthorized access - No userId found.");
        throw new UploadThingError("Unauthorized");
      }

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Logic that runs after a successful upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

