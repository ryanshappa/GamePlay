// src/server/uploadGame.ts

import { s3Client } from "~/utils/aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import * as unzipper from "unzipper";

export async function uploadGameToS3(fileBuffer: Buffer): Promise<string> {
  const gameId = uuidv4(); // Generate a unique ID for the game

  // Unzip the buffer
  const zip = await unzipper.Open.buffer(fileBuffer);

  // Upload each file to S3
  for (const entry of zip.files) {
    if (entry.type === "File") {
      const filePath = entry.path; // Relative path within the zip
      let content = await entry.buffer();

      // Determine the appropriate headers based on the file extension
      const { contentType, contentEncoding } = getFileHeaders(filePath);

      // Modify index.html if necessary (adjust paths)
      if (filePath.endsWith("index.html")) {
        let indexContent = content.toString("utf-8");

        // Adjust paths if needed (example: remove leading slashes)
        indexContent = indexContent.replace(
          /(src|href)="\/?(TemplateData|Build)\//g,
          '$1="$2/'
        );

        content = Buffer.from(indexContent, "utf-8");
      }

      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `${gameId}/${filePath}`,
        Body: content,
        ContentType: contentType,
        contentEncoding: contentEncoding || undefined,
        ACL: "public-read" as const,
        ...(contentEncoding && { ContentEncoding: contentEncoding }), // Add ContentEncoding if it's defined
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);
    }
  }

  // Return the URL to the game's index.html
  const gameUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${gameId}/index.html`;

  return gameUrl;
}

// Helper function to determine content type and encoding
function getFileHeaders(filePath: string): {
  contentType: string;
  contentEncoding: string | null;
} {
  let contentType = "application/octet-stream";
  let contentEncoding: string | null = null;

  if (filePath.endsWith(".html")) {
    contentType = "text/html; charset=utf-8";
  } else if (filePath.endsWith(".js")) {
    contentType = "application/javascript";
  } else if (filePath.endsWith(".css")) {
    contentType = "text/css";
  } else if (filePath.endsWith(".png")) {
    contentType = "image/png";
  } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
    contentType = "image/jpeg";
  } else if (filePath.endsWith(".gif")) {
    contentType = "image/gif";
  } else if (filePath.endsWith(".wasm")) {
    contentType = "application/wasm";
  }

  // Check for compressed files and set Content-Encoding
  if (filePath.endsWith(".gz")) {
    contentEncoding = "gzip";

    // Remove the .gz extension for correct Content-Type
    filePath = filePath.slice(0, -3);

    if (filePath.endsWith(".js")) {
      contentType = "application/javascript";
    } else if (filePath.endsWith(".data")) {
      contentType = "application/octet-stream";
    } else if (filePath.endsWith(".wasm")) {
      contentType = "application/wasm";
    }
  }

  return { contentType, contentEncoding };
}
