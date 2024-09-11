import { auth } from "@clerk/nextjs/server"; 
import { createUploadthing, type FileRouter } from "uploadthing/next-legacy"; // Using next-legacy
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Define your FileRouter for handling uploads
export const ourFileRouter = {
  gameUploader: f({ blob: { maxFileSize: "1GB" } }) // Allow large files (e.g., game zips)
  .middleware(async () => {
    const user = auth();
    
    console.log("Auth check:", user); // Log the user object for debugging

    // Add a check to see if user is null or undefined
    if (!user || !user.userId) {
      console.error("Unauthorized access - No userId found.");
      throw new UploadThingError("Unauthorized");
    }
  
    return { userId: user.userId };
  })
  
    .onUploadComplete(async ({ metadata, file }) => {
      // Logic that runs after a successful upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      // Optionally, handle file post-processing or DB interactions here
      return { uploadedBy: metadata.userId }; // Pass metadata back to client
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
