// src/pages/create-post.tsx
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
    formData.append('file', file);

    const response = await fetch('/api/upload-file', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      router.push("/feed");
    } else {
      console.error("Error uploading file");
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
    </div>
  );
}
