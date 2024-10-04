import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { db } from '~/server/db';
import { Post, User, Comment as CommentType, Like } from '@prisma/client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  HeartIcon,
  MessageCircleIcon,
  ShareIcon,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface PostWithAuthorAndComments extends Post {
  author: User;
  comments: (CommentType & { user: User })[];
  likes: Like[];
}

interface SerializedPost
  extends Omit<
    PostWithAuthorAndComments,
    'createdAt' | 'updatedAt' | 'author' | 'comments' | 'likes'
  > {
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  comments: {
    id: number;
    content: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
      avatarUrl?: string;
    };
  }[];
  likes: {
    id: number;
    createdAt: string; // Ensure this is a string
    userId: string;
    postId: number;
  }[];
}

interface PostPageProps {
  post: SerializedPost;
}

function PostPage({ post }: PostPageProps) {
  const router = useRouter();
  const { user } = useUser();
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [newComment, setNewComment] = useState('');
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setHasLiked(
        post.likes.some((like) => like.userId === user.id)
      );
    }
  }, [user, post.likes]);

  const handleLike = async () => {
    if (!user) {
      alert('You must be signed in to like posts.');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      });
      if (response.ok) {
        setLikesCount((prev) => prev + 1);
        setHasLiked(true);
      } else {
        console.error('Failed to like post.');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      alert('You must be signed in to comment.');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `/api/posts/${post.id}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ content: newComment }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        const comment = await response.json();
        setComments((prev) => [...prev, comment]);
        setNewComment('');
      } else {
        console.error('Failed to add comment.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    setIsCopySuccess(true);
    setTimeout(() => setIsCopySuccess(false), 2000);
  };

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="flex-1">
      {/* Content Wrapper */}
      <ScrollArea className="h-full">
        <div className="flex flex-col items-start p-4 pl-8">
          {/* Post Content */}
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="mb-6">{post.content}</p>

          {/* Game Display */}
          <div className="relative w-[800px] h-[450px] bg-gray-800 rounded-md overflow-hidden mb-6">
            <iframe
              src={post.fileUrl || '/default-file-url'}
              title={post.title}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>

          {/* Interaction buttons */}
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${
                hasLiked
                  ? 'bg-red-500'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              onClick={handleLike}
              disabled={hasLiked}
            >
              <HeartIcon className="h-6 w-6" />
            </Button>
            <span>{likesCount}</span>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
            >
              <MessageCircleIcon className="h-6 w-6" />
            </Button>
            <span>{comments.length}</span>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
              onClick={handleShare}
            >
              <ShareIcon className="h-6 w-6" />
            </Button>
            {isCopySuccess && <span>Link copied!</span>}
          </div>

          {/* Comments Section */}
          <div className="w-full mb-6">
            <h2 className="text-2xl font-semibold mb-4">Comments</h2>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start space-x-4"
                >
                  <Avatar>
                    <AvatarImage
                      src={
                        comment.user.avatarUrl ||
                        '/default-avatar.png'
                      }
                      alt="User Avatar"
                    />
                    <AvatarFallback>
                      {comment.user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {comment.user.username}
                    </p>
                    <p>{comment.content}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(
                        comment.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            {user && (
              <div className="mt-6">
                <Textarea
                  value={newComment}
                  onChange={(e) =>
                    setNewComment(e.target.value)
                  }
                  placeholder="Add a comment..."
                  className="w-full mb-2 bg-gray-800 text-white"
                />
                <Button onClick={handleAddComment}>
                  Post Comment
                </Button>
              </div>
            )}
          </div>

          {/* Back to Home Button */}
          <Button
            variant="link"
            onClick={() => router.back()}
            className="mt-4 text-blue-500 hover:underline"
          >
            &larr; Back to Home
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}

export default PostPage;

// Fetch post data from the database
export const getServerSideProps: GetServerSideProps = async (
  context
) => {
  const { id } = context.params!;
  const post = await db.post.findUnique({
    where: { id: parseInt(id as string) },
    include: {
      author: true,
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      likes: true,
    },
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  // Serialize dates
  const serializedPost = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: {
      id: post.author.id,
      username: post.author.username,
      avatarUrl: post.author.avatarUrl,
    },
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      user: {
        id: comment.user.id,
        username: comment.user.username,
        avatarUrl: comment.user.avatarUrl,
      },
    })),
    likes: post.likes.map((like) => ({
      id: like.id,
      userId: like.userId,
      postId: like.postId,
    })),
  };

  return {
    props: {
      post: serializedPost,
    },
  };
};