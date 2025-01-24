import { GetServerSideProps } from 'next';
import { db } from '~/server/db';
import { PostWithAuthor } from '~/types/types';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import PostItem from '~/components/postItem';
import { getAuth } from '@clerk/nextjs/server';
import { SignInDialog } from '~/components/signInDialog';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { ScrollArea } from '~/components/ui/scroll-area';
import { HeartIcon, MessageCircleIcon, ShareIcon } from 'lucide-react';
import Link from 'next/link';
import DeleteCommentButton from '~/components/deleteComment';

interface PostPageProps {
  post: PostWithAuthor; 
  status: string;
}

export default function PostPage({ post, status }: PostPageProps) {
  const { user, isSignedIn } = useUser();
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(post.likedByCurrentUser);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isCopySuccess, setIsCopySuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<'signIn' | 'signUp' | null>(null);

  useEffect(() => {
    if (user) {
      setHasLiked(post.likedByCurrentUser);
    }
  }, [user, post.likedByCurrentUser]);

  const handleLike = async () => {
    if (!isSignedIn) {
      setDialogOpen('signIn');
      return;
    }

    const method = hasLiked ? 'DELETE' : 'POST';

    setLikesCount((prev) => (hasLiked ? prev - 1 : prev + 1));
    setHasLiked(!hasLiked);

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, { method });
      if (!response.ok) {
        // Revert on failure
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

    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
        headers: { 'Content-Type': 'application/json' },
      });
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

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        const errorData = await response.json();
        console.error('Failed to delete comment:', errorData.error || errorData.message);
        alert(`Failed to delete comment: ${errorData.error || errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('An unexpected error occurred while deleting the comment.');
    }
  };

  const handleCommentClick = () => {
    // Scroll to comments section
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If processing or invalid, just show a simple message
  if (status === 'processing' || status === 'invalid') {
    return (
      <div className="flex-1">
        <ScrollArea className="w-full h-full">
          <div className="flex flex-col w-full">
            {status === 'processing' && (
              <p>Your game is being processed. Please check back shortly.</p>
            )}
            {status === 'invalid' && (
              <p>There was an issue with your game upload. Please try again.</p>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    // The outer container is full width/height
    <div className="w-full min-h-screen">
      {/*
        We give it a small top margin so it's below the fixed header,
        plus left/right padding so it's flush-left but not hugging the edge.
      */}
      <div className="mt-4 ml-0 mr-16">
        {/* The embed itself (Godot/Unity game) using PostItem with layout="post" */}
        <PostItem
          post={post}
          isCopySuccess={isCopySuccess}
          onShare={handleShare}
          onCommentClick={handleCommentClick}
          showSeparator={false}
          layout="post"
          isActive={true}
        />

        {/* Post title, description, and interaction buttons below the post */}
        <p className="text-sm text-gray-200 mb-4">{post.content}</p>

        {/* Interaction Buttons and Author Info in the same row */}
        <div className="flex items-center justify-between mb-4">
          {/* Interaction Buttons on the left */}
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
              onClick={handleLike}
            >
              <HeartIcon
                className={`h-6 w-6 ${
                  hasLiked ? 'text-red-500' : 'text-white'
                }`}
                fill={hasLiked ? 'currentColor' : 'none'}
              />
            </Button>
            <span>{likesCount}</span>

            {/* Comment Button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
              onClick={handleCommentClick}
            >
              <MessageCircleIcon className="h-6 w-6 text-white" />
            </Button>
            <span>{comments.length}</span>

            {/* Author Info Button */}
            <Link href={`/profile/${post.author.id}`}>
              <div className="flex items-center space-x-2 cursor-pointer">
                <Avatar className="h-10 w-10">
                  {post.author.avatarUrl ? (
                    <AvatarImage
                      src={post.author.avatarUrl}
                      alt={`${post.author.username}'s Avatar`}
                    />
                  ) : (
                    <AvatarFallback>
                      {post.author.username?.charAt(0) || 'A'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-semibold">@{post.author.username}</span>
              </div>
            </Link>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
              onClick={handleShare}
            >
              <ShareIcon className="h-6 w-6 text-white" />
            </Button>
            {isCopySuccess && <span>Link copied!</span>}
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments-section" className="w-full my-6">
          <h2 className="text-2xl font-semibold mb-4">Comments</h2>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-4">
                <Link href={`/profile/${comment.user.id}`}>
                  <Avatar className="cursor-pointer">
                    {comment.user.avatarUrl ? (
                      <AvatarImage
                        src={comment.user.avatarUrl}
                        alt={`${comment.user.username}'s Avatar`}
                      />
                    ) : (
                      <AvatarFallback>
                        {comment.user.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{comment.user.username}</p>
                    <DeleteCommentButton
                      comment={comment}
                      postId={post.id}
                      postAuthorId={post.authorId}
                      currentUser={
                        user ? { id: user.id, username: user.username || '' } : null
                      }
                      onDelete={handleDeleteComment}
                    />
                  </div>
                  <p>{comment.content}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(comment.createdAt).toLocaleString()}
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
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full mb-2 bg-gray-800 text-white"
              />
              <Button onClick={handleAddComment}>Post Comment</Button>
            </div>
          )}

          {/* If not signed in */}
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
          onClick={() => window.history.back()}
          className="mt-2 text-blue-500 hover:underline"
        >
          &larr; Back to Home
        </Button>
      </div>

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userId } = getAuth(context.req);
  const { id } = context.params!;

  const post = await db.post.findUnique({
    where: { id: id as string },
    include: {
      author: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
      likes: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });

  if (!post) {
    return { notFound: true };
  }

  const status = post.status;

  const serializedPost: PostWithAuthor = {
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    fileUrl: post.fileUrl,
    status: post.status,
    authorId: post.authorId,
    author: {
      id: post.author.id,
      username: post.author.username || '',
      avatarUrl: post.author.avatarUrl || '',
    },
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    likedByCurrentUser: userId ? post.likes.length > 0 : false,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      user: {
        id: comment.user.id,
        username: comment.user.username || '',
        avatarUrl: comment.user.avatarUrl || '',
      },
    })),
  };

  return {
    props: {
      post: serializedPost,
      status,
    },
  };
};
