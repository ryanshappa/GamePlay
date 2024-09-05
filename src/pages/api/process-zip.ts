import { NextApiRequest, NextApiResponse } from "next";
import * as fs from "fs";
import * as unzipper from "unzipper";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileUrl, userId } = req.body;

  if (!fileUrl || !userId) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    // Download the file and extract it
    const stream = fs.createReadStream(fileUrl).pipe(
      unzipper.Extract({ path: `/path/to/extract/${userId}` })
    );

    stream.on("close", () => {
      console.log("File extraction complete.");
      const htmlFilePath = `/path/to/extract/${userId}/index.html`;
      res.status(200).json({ htmlFilePath });
    });
  } catch (err) {
    console.error("Error during file extraction:", err);
    res.status(500).json({ error: "File extraction failed" });
  }
}
