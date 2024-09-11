// src/pages/create-post.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { Input } from "~/components/ui/input";
import { UploadButton } from "~/utils/uploadthing"; // Use Uploadthing button

export default function CreatePost() {
  const { isSignedIn } = useUser(); // Check if the user is signed in
  const router = useRouter(); // For redirecting after post creation
  const [title, setTitle] = useState<string>(""); // State for post title
  const [fileUrl, setFileUrl] = useState<string | null>(null); // State for uploaded file URL
  const [isUploaded, setIsUploaded] = useState<boolean>(false); // State to track if a file was uploaded

  // Handle post creation logic after successful file upload
  const handlePostCreation = async () => {
    if (!isSignedIn || !fileUrl) {
      alert("Please sign in and upload a file.");
      return;
    }

    try {
      const result = await fetch('/api/savePost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          fileUrl, // Use the uploaded file URL
          content: '', // Optionally handle post content if needed
        }),
      });

      const post = await result.json();

      if (result.ok) {
        console.log("Post saved:", post);
        router.push("/"); // Redirect to homepage after post creation
      } else {
        console.error("Failed to save post", post);
      }
    } catch (error) {
      console.error("Error during post creation:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl mb-4">Create a New Post</h1>

      {/* Input for post title */}
      <Input
        type="text"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4"
      />

      {/* Uploadthing button for handling file upload */}
      {!isUploaded && ( // Hide the upload button after a successful upload
        <UploadButton
          endpoint="gameUploader" // Ensure this matches your FileRouter endpoint
          onClientUploadComplete={(res) => {
            if (res && res[0]) {
              setFileUrl(res[0].url); // Save the uploaded file URL
              setIsUploaded(true); // Set file uploaded state to true
              alert("File uploaded successfully! Now you can create the post.");
            }
          }}
          onUploadError={(error: Error) => {
            console.error("Upload error:", error);
          }}
        />
      )}

      {/* Conditionally show the Create Post button only after a file is uploaded */}
      {isUploaded && (
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
          onClick={handlePostCreation}
        >
          Create Post
        </button>
      )}
    </div>
  );
}
