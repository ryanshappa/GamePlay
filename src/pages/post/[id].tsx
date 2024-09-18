import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "~/server/db";
import { GetServerSidePropsContext } from "next";
import { Post } from "@prisma/client";

type PostPageProps = {
  post: Post | null;
};

export default function PostPage({ post }: PostPageProps) {
  const router = useRouter();

  if (!post) {
    return <div>Post not found.</div>;
  }

  const { title, content, fileUrl } = post;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      {content && <p className="mb-4">{content}</p>}

      <div className="game-container">
        <iframe
          src={fileUrl || ""}
          width="960"
          height="600"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params as { id: string };

  const post = await db.post.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (post) {
    // Convert Date objects to strings
    const serializedPost = {
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };

    return {
      props: {
        post: serializedPost,
      },
    };
  } else {
    return {
      props: {
        post: null,
      },
    };
  }
}
