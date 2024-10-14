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
import Link from 'next/link';
import { SignInDialog } from '~/components/signInDialog';
import DeleteCommentButton from '~/components/deleteComment'; 

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
  const { user, isSignedIn } = useUser();
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [newComment, setNewComment] = useState('');
  const [isCopySuccess, setIsCopySuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<'signIn' | 'signUp' | null>(null);

  useEffect(() => {
    if (user) {
      setHasLiked(
        post.likes.some((like) => like.userId === user.id)
      );
    }
  }, [user, post.likes]);

  const handleLike = async () => {
    if (!isSignedIn) {
      setDialogOpen('signIn');
      return;
    }

    const method = hasLiked ? 'DELETE' : 'POST';

    setLikesCount((prev) => (hasLiked ? prev - 1 : prev + 1));
    setHasLiked(!hasLiked);

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method,
      });

      if (!response.ok) {
        setLikesCount((prev) => (hasLiked ? prev + 1 : prev - 1));
        setHasLiked(hasLiked);
        console.error('Failed to update like status.');
      }
    } catch (error) {
      // Revert UI changes on error
      setLikesCount((prev) => (hasLiked ? prev + 1 : prev - 1));
      setHasLiked(hasLiked);
      console.error('Error updating like status:', error);
    }
  };

  const handleAddComment = async () => {
    if (!isSignedIn) {
      setDialogOpen('signIn');
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
        const errorData = await response.json();
        console.error('Failed to add comment:', errorData.error);
        alert(`Failed to add comment: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('An unexpected error occurred while adding the comment.');
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    setIsCopySuccess(true);
    setTimeout(() => setIsCopySuccess(false), 2000);
  };

  const handleDeleteComment = (commentId: number) => {
    const id = Number(commentId);
    setComments((prev) => prev.filter((comment) => comment.id !== id));
  };

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="flex-1 p-4">
      {/* Content Wrapper */}
      <ScrollArea className="w-full h-full">
        <div className="flex flex-col w-full p-4">
          {/* Post Content */}
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="mb-6">{post.content}</p>

          {/* Game Display */}
          <div className="relative w-full h-[80vh] bg-gray-800 rounded-md overflow-hidden mb-6">
            <iframe
              src={post.fileUrl || ''}
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
              className="rounded-full bg-gray-800 hover:bg-gray-700"
              onClick={handleLike}
            >
              <HeartIcon
                className={`h-6 w-6 ${hasLiked ? 'text-red-500' : 'text-white'}`}
                fill={hasLiked ? 'currentColor' : 'none'}
              />
            </Button>
            <span>{likesCount}</span>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
            >
              <MessageCircleIcon className="h-6 w-6 text-white" />
            </Button>
            <span>{comments.length}</span>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
              onClick={handleShare}
            >
              <ShareIcon className="h-6 w-6 text-white" />
            </Button>
            {isCopySuccess && <span>Link copied!</span>}

            {/* Author Avatar and Profile Link */}
            <Link href={`/profile/${post.author.id}`}>
              <div className="flex items-center space-x-2 cursor-pointer">
                <Avatar className="h-10 w-10">
                  {post.author.avatarUrl ? (
                    <AvatarImage src={post.author.avatarUrl} alt={`${post.author.username}'s Avatar`} />
                  ) : (
                    <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <span className="font-semibold">@{post.author.username}</span>
              </div>
            </Link>
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
                  <Link href={`/profile/${comment.user.id}`}>
                      <Avatar className="cursor-pointer">
                        <AvatarImage
                          src={comment.user.avatarUrl}
                          alt={`${comment.user.username}'s Avatar`}
                        />
                        <AvatarFallback>
                          {comment.user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        {comment.user.username}
                      </p>
                      <DeleteCommentButton
                        comment={{
                          id: Number(comment.id),
                          user: comment.user,
                          post: post,
                        }}
                        postAuthorId={post.authorId}
                        currentUser={user ? { id: user.id, username: user.username || '' } : null}
                        onDelete={handleDeleteComment}
                      />
                    </div>
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
            {isSignedIn && (
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

            {/* If not signed in, show prompt to sign in */}
            {!isSignedIn && (
              <div className="mt-6">
                <Button onClick={() => setDialogOpen('signIn')}>
                  Sign in to add a comment
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

      {/* Sign-In Dialog */}
      {dialogOpen === 'signIn' && (
        <SignInDialog
          open={true}
          onOpenChange={() => setDialogOpen(null)}
          onSwitchToSignUp={() => setDialogOpen('signUp')}
        />
      )}
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
      // If you need to serialize createdAt:
      // createdAt: like.createdAt.toISOString(),
    })),
  };

  return {
    props: {
      post: serializedPost,
    },
  };
};