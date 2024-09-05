import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export default function CreatePost() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !isSignedIn) {
      alert("Please sign in and upload a file.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file); // Ensure correct key name is used
  
    const response = await fetch("/api/upload-file", {
      method: "POST",
      body: formData,
    });
  
    if (response.ok) {
      const result = await response.json();
      setUploadUrl(result.fileUrl);
      savePostToProfile(result.fileUrl);
    } else {
      console.error("Upload failed");
    }
  };
  

  const savePostToProfile = async (fileUrl: string) => {
    try {
      const res = await fetch("/api/savePost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, fileUrl }),
      });

      if (res.ok) {
        router.push("/feed");
      } else {
        console.error("Failed to save the post.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl mb-4">Create a New Post</h1>
      <Input
        type="text"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />
      <input type="file" accept=".zip" onChange={handleFileChange} />
      <Button onClick={handleUpload} variant="secondary" className="mt-4">
        Upload
      </Button>

      {uploadUrl && <p>File uploaded to: <a href={uploadUrl}>{uploadUrl}</a></p>}
    </div>
  );
}
