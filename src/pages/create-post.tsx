import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/uploadthing";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function CreatePost() {
  //const { user } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [fileKey, setFileKey] = useState(""); // State to store fileKey
  const [uploading, setUploading] = useState(false);

  const handleUploadComplete = (res: any) => {
    console.log("Upload complete callback triggered.");
    console.log("Upload response:", res);

    if (res && res.length > 0) {
      const uploadedFile = res[0];
      console.log("Uploaded file data:", uploadedFile);
      const key = uploadedFile.fileKey || uploadedFile.key || uploadedFile.id;
      if (key) {
        setFileKey(key);
        console.log("FileKey set to:", key);
      } else {
        console.error("File key not found in uploaded file data.");
      }
    } else {
      console.error("File upload failed or no files returned.");
    }
  };

  const handleSubmit = async () => {
    if (!title || !fileKey) {
      alert("Please provide a title and upload a game.");
      return;
    }

    try {
      setUploading(true);

      // Prepare data to send to savePost endpoint
      const postData = {
        title,
        content,
        fileKey,
      };

      // Send data to savePost endpoint
      const response = await fetch("/api/savePost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const post = await response.json();
        console.log("Post created successfully:", post);
        router.push(`/post/${post.id}`);
      } else {
        console.error("Failed to create post.");
      }
    } catch (error) {
      console.error("Error during post creation:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create a New Post</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter the title of your game"
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter a description for your game (optional)"
          className="w-full h-32 p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Upload Game</label>
        <UploadButton<OurFileRouter, "gameUploader">
          endpoint="gameUploader"
          onClientUploadComplete={handleUploadComplete}
          onUploadError={(error: Error) => {
            console.error("Error during upload:", error);
          }}
        />
      </div>

      <Button onClick={handleSubmit} disabled={uploading || !fileKey}>
        {uploading ? "Uploading..." : "Create Post"}
      </Button>
    </div>
  );
}
