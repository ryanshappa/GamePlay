import { generateUploadButton } from "@uploadthing/react"; // Import the Uploadthing React helpers
import type { OurFileRouter } from "~/server/uploadthing"; // Import your FileRouter types

export const UploadButton = generateUploadButton<OurFileRouter>(); // Create the upload button

