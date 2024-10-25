import { useState } from 'react';
import { useRouter } from 'next/router';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import Layout from '~/components/layout';
import { Label } from '~/components/ui/label';

const CreatePost = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [engine, setEngine] = useState("unity"); 
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileKey, setFileKey] = useState<string>(""); 
  const [gameId, setGameId] = useState<string>(""); // Add this state variable

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !fileKey) {
      alert("Please provide a title and upload a game.");
      return;
    }
    if (gameId) {
      router.push(`/post/${gameId}`);
    } else {
      alert("Game uploaded successfully and is being processed.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      try {
        // Request a presigned URL from the server
        const res = await fetch("/api/getPresignedUrl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: selectedFile.name,
            title,
            content,
            engine,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to get presigned URL");
        }

        const { presignedUrl, fileKey, gameId } = data; // Destructure gameId

        await fetch(presignedUrl, {
          method: "PUT",
          body: selectedFile,
        });

        setFileKey(fileKey); 
        setGameId(gameId); 
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file.");
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create a New Post</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-1">Title</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the title of your game"
            className="w-full bg-gray-800 text-white"
          />
        </div>

        <div className="mb-4">
          <Label className="block text-sm font-medium mb-1">Content</Label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter a description for your game (optional)"
            className="w-full h-32 p-2 border rounded bg-gray-800 text-white"
          />
        </div>

        <div className="mb-4">
          <Label className="block text-sm font-medium mb-1">Game Engine</Label>
          <select
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded w-auto"
          >
            <option value="unity">Unity</option>
            <option value="godot">Godot</option>
          </select>
        </div>

        <div className="mb-4">
          <Label htmlFor="file">Upload your game file</Label>
          <p className="text-sm text-gray-500">Please upload your game packaged as a .zip file.</p>
          <Input
            type="file"
            id="file"
            accept=".zip"
            onChange={handleFileChange}
            className="mt-2 bg-gray-700 text-white"
          />
        </div>

        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Create Post"}
        </Button>
      </form>
    </div>
  );
};

CreatePost.getLayout = (page: React.ReactNode) => <Layout showSearchBar={false}>{page}</Layout>;

export default CreatePost;
