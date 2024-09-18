import { getAuth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { UploadThingError } from "uploadthing/server";
import { promises as fs } from "fs";
import * as path from "path";
import * as unzipper from "unzipper";
import { Buffer } from "buffer"; 
import { Readable } from "stream";

const f = createUploadthing();

export const ourFileRouter = {
  gameUploader: f({ blob: { maxFileSize: "1GB" } })
    .middleware(async ({ req }) => {
      const { userId } = getAuth(req);
      console.log("Auth check:", userId);

      if (!userId) {
        console.error("Unauthorized access - No userId found.");
        throw new UploadThingError("Unauthorized");
      }

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      try {
        // Fetch the uploaded zip file
        const response = await fetch(file.url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer

        // Define the path to save the extracted files
        const fileKey = file.key ?? ''; // Unique identifier for the uploaded file
        let extractPath = path.join(process.cwd(), "public", "games", fileKey);

        // Ensure the directory exists
        await fs.mkdir(extractPath, { recursive: true });

        // Unzip the buffer to the extract path
        await new Promise((resolve, reject) => {
          const stream = unzipper.Extract({ path: extractPath });
          stream.on("close", resolve);
          stream.on("error", reject);

          // Create a readable stream from the buffer
          const bufferStream = new Readable({
            read() {
              this.push(buffer);
              this.push(null);
            },
          });
          
          bufferStream.pipe(stream);
        });

        console.log("File extraction complete.");

        // List files and directories in extractPath
        const extractedItems = await fs.readdir(extractPath);
        console.log("Extracted items:", extractedItems);

        // Check if there's a single directory
        if (extractedItems.length === 1) {
          const firstItem = extractedItems[0];
          if (!firstItem) {
            throw new Error("No items found in the extracted directory.");
          }
          const firstItemPath = path.join(extractPath, firstItem);
          const stat = await fs.lstat(firstItemPath);

          if (stat.isDirectory()) {
            // Adjust extractPath to point to the inner directory
            extractPath = firstItemPath;
            console.log("Adjusted extractPath to:", extractPath);
          }
        }

        // Now proceed to find index.html within the adjusted extractPath
        const indexPath = path.join(extractPath, "index.html");
        const indexExists = await fileExists(indexPath);

        if (!indexExists) {
          console.error("index.html not found in extracted files.");
          throw new Error("index.html not found in extracted files.");
        }

        // Modify paths in index.html if necessary
        let indexContent = await fs.readFile(indexPath, "utf-8");

        // Adjust paths in index.html to be relative
        indexContent = indexContent.replace(/(src|href)="\/?(TemplateData|Build)\//g, '$1="$2/');

        await fs.writeFile(indexPath, indexContent, "utf-8");

        console.log("index.html paths updated.");
      } catch (error) {
        console.error("Error during file extraction:", error);
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Helper function to check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
