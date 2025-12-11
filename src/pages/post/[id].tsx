import { GetServerSideProps } from 'next';
import { db } from '~/server/db';
import { PostWithAuthor } from '~/types/types';
import React, { useState, useCallback } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { MessageCircleIcon, ShareIcon } from 'lucide-react';
import Link from 'next/link';
import { NestedComment } from '~/types/types';
import { SignInModal } from '~/components/signInModal';
import { CommentsDrawer } from '~/components/commentsSheet';
import { LikeButton } from '~/components/likeButton';
import { SaveButton } from '~/components/saveButton';
import { getAuth } from '@clerk/nextjs/server';

interface PostPageProps {
  post: PostWithAuthor;
  status: string;
}

export default function PostPage({ post, status }: PostPageProps) {
  const { user } = useAuth();
  const [isCopySuccess, setIsCopySuccess] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Check if content is long enough to need truncation (roughly 2 lines worth)
  const needsTruncation = post.content && post.content.length > 100;

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    setIsCopySuccess(true);
    setTimeout(() => setIsCopySuccess(false), 2000);
  }, [post.id]);

  const handleCommentClick = useCallback(() => {
    setCommentsDrawerOpen(true);
  }, []);

  const handleAddComment = useCallback(async (content: string) => {
    if (!user) {
      setSignInOpen(true);
      return;
    }
    if (!content.trim()) return;

    try {
      const resp = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!resp.ok) {
        alert('Failed to add comment');
        return;
      }
    } catch (error) {
      alert('Unexpected error adding comment');
    }
  }, [user, post.id]);

  const handleDeleteComment = useCallback(async (commentId: number) => {
    try {
      const resp = await fetch(`/api/posts/${post.id}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      if (!resp.ok) {
        alert('Failed to delete comment');
        return;
      }
    } catch (error) {
      alert('Unexpected error deleting comment');
    }
  }, [post.id]);

  if (status === 'processing' || status === 'invalid') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          {status === 'processing' && (
            <p className="text-foreground">Your game is being processed. Please check back shortly.</p>
          )}
          {status === 'invalid' && (
            <p className="text-foreground">There was an issue with your game upload. Please try again.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-8">
      <div className="flex flex-col items-start w-full max-w-[1200px] mx-auto">
        {/* Back button - top left */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            &larr; Back
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-4" style={{ width: 'min(60vw, calc(100vw - 300px))' }}>
          {post.title}
        </h1>

        {/* Main content area - iframe + interaction buttons */}
        <div className="flex items-center">
          {/* Iframe container - responsive with viewport-based sizing */}
          <div 
            className="rounded-lg overflow-hidden bg-muted"
            style={{ width: 'min(60vw, calc(100vw - 300px))', aspectRatio: '16/9' }}
          >
            {post.fileUrl ? (
              <iframe
                src={post.fileUrl}
                title={post.title}
                className="w-full h-full"
                frameBorder="0"
                allow="fullscreen; cross-origin-isolated"
                allowFullScreen
                // @ts-expect-error - credentialless is a valid attribute but not in React types yet
                credentialless="true"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No game available</span>
              </div>
            )}
          </div>

          {/* Interaction buttons - larger and more prominent */}
          <div className="flex flex-col items-center space-y-5 ml-6">
            {/* Author Avatar - larger */}
            <Link href={`/profile/${post.author.id}`}>
              <Avatar className="cursor-pointer h-14 w-14 border-2 border-primary">
                <AvatarImage src={post.author.avatarUrl || ''} alt="Author Avatar" />
                <AvatarFallback className="text-lg">
                  {post.author.username?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
            </Link>

            {/* Like Button - larger */}
            <LikeButton
              postId={post.id}
              initialLiked={post.likedByCurrentUser}
              initialCount={post.likesCount}
              size="large"
            />

            {/* Comment Button - larger */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-muted hover:bg-foreground/20 h-14 w-14"
                onClick={handleCommentClick}
              >
                <MessageCircleIcon className="h-8 w-8" />
              </Button>
              <span className="text-sm mt-1">{post.commentsCount}</span>
            </div>

            {/* Save Button - larger */}
            <SaveButton
              postId={post.id}
              initialSaved={post.savedByCurrentUser || false}
              size="large"
            />

            {/* Share Button - larger */}
            <div className="flex flex-col items-center relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-muted hover:bg-foreground/20 h-14 w-14"
                onClick={handleShare}
              >
                <ShareIcon className="h-8 w-8" />
              </Button>
              {isCopySuccess && (
                <span className="absolute text-sm text-foreground mt-1 left-full ml-2 whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Post content / description */}
        <div className="mt-4 pb-8" style={{ width: 'min(60vw, calc(100vw - 300px))' }}>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/profile/${post.author.id}`} className="text-foreground hover:underline">
              @{post.author.username}
            </Link>
          </div>
          {post.content && (
            <div>
              <p className={`text-muted-foreground whitespace-pre-wrap ${!isDescriptionExpanded && needsTruncation ? 'line-clamp-2' : ''}`}>
                {post.content}
              </p>
              {needsTruncation && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-foreground text-sm mt-1 hover:underline"
                >
                  {isDescriptionExpanded ? 'less' : 'more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comments Sheet */}
      <CommentsDrawer
        open={commentsDrawerOpen}
        onClose={() => setCommentsDrawerOpen(false)}
        post={post}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />

      {/* Sign In Modal */}
      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />

      {/* Copy success notification */}
      {isCopySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-foreground px-4 py-2 rounded z-50">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}

// SSR
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const { userId } = getAuth(context.req);
  
  const post = await db.post.findUnique({
    where: { id: id as string },
    include: {
      author: true,
      comments: {
        where: { parentId: null },
        include: {
          user: true,
          children: {
            include: {
              user: true,
              children: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { likes: true, comments: true } },
      // Check if current user has liked this post
      likes: userId ? {
        where: { userId }
      } : undefined,
    },
  });

  if (!post) {
    return { notFound: true };
  }

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
    likedByCurrentUser: userId ? post.likes && post.likes.length > 0 : false,
    comments: post.comments.map(serializeComment),
  };

  return {
    props: {
      post: serializedPost,
      status: post.status,
    },
  };
};

// Convert a raw comment from Prisma into a NestedComment for client
type RawComment = {
  id: number;
  content: string;
  createdAt: Date;
  user: { id: string; username?: string | null; avatarUrl?: string | null };
  likeCount?: number;
  likedByCurrentUser?: boolean;
  children?: RawComment[];
};

function serializeComment(comment: RawComment): NestedComment {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    user: {
      id: comment.user.id,
      username: comment.user.username || '',
      avatarUrl: comment.user.avatarUrl || '',
    },
    likeCount: comment.likeCount || 0, 
    likedByCurrentUser: false,
    children: comment.children?.map(serializeComment) || [],
  };
}
