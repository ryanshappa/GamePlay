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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !file) {
      alert("Please provide a title and upload a game.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("file", file);

      const response = await fetch("/api/savePost", {
        method: "POST",
        body: formData,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create a New Post</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the title of your game"
            className="w-full bg-gray-800 text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter a description for your game (optional)"
            className="w-full h-32 p-2 border rounded bg-gray-800 text-white"
          />
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