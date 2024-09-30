import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "~/server/db";
import type { Post } from "@prisma/client";

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/getPost?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          setPost(data);
        })
        .catch((error) => {
          console.error("Error fetching post:", error);
        });
    }
  }, [id]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="mb-6">{post.content}</p>
      {post.fileUrl && (
        <iframe
          src={post.fileUrl}
          width="100%"
          height="800px"
          title={post.title}
          className="border rounded-md"
        ></iframe>
      )}
    </div>
  );
}
