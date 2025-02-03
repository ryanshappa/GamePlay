import { GetServerSideProps } from 'next';
import { db } from '~/server/db';
import { PostWithAuthor } from '~/types/types';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import PostItem from '~/components/postItem';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { ScrollArea } from '~/components/ui/scroll-area';
import { HeartIcon, MessageCircleIcon, ShareIcon, Bookmark } from 'lucide-react';
import Link from 'next/link';
import DeleteCommentButton from '~/components/deleteComment';
import { SignInModal } from '~/components/signInModal';
import { SaveButton } from '~/components/saveButton';
import CommentLikeButton from '~/components/CommentLikeButton';

// We define a separate NestedCommentItem at the bottom

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
  const [saved, setSaved] = useState(false);

  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setHasLiked(post.likedByCurrentUser);
    }
  }, [user, post.likedByCurrentUser]);

  const handleLike = async () => {
    if (!isSignedIn) {
      setSignInOpen(true);
      return;
    }
    const method = hasLiked ? 'DELETE' : 'POST';
    setLikesCount((prev) => (hasLiked ? prev - 1 : prev + 1));
    setHasLiked(!hasLiked);

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method });
      if (!res.ok) {
        // revert
        setLikesCount((prev) => (hasLiked ? prev + 1 : prev - 1));
        setHasLiked(hasLiked);
      }
    } catch {
      setLikesCount((prev) => (hasLiked ? prev + 1 : prev - 1));
      setHasLiked(hasLiked);
    }
  };

  const handleAddComment = async () => {
    if (!isSignedIn) {
      setSignInOpen(true);
      return;
    }
    if (!newComment.trim()) return;

    try {
      const resp = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      if (!resp.ok) {
        alert('Failed to add comment');
        return;
      }
      const comment = await resp.json();
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      alert('Unexpected error adding comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!isSignedIn) {
      setSignInOpen(true);
      return;
    }
    try {
      const resp = await fetch(`/api/posts/${post.id}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      if (!resp.ok) {
        alert('Failed to delete comment');
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      alert('Unexpected error deleting comment');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    setIsCopySuccess(true);
    setTimeout(() => setIsCopySuccess(false), 2000);
  };

  const handleCommentClick = () => {
    const commentsSec = document.getElementById('comments-section');
    if (commentsSec) commentsSec.scrollIntoView({ behavior: 'smooth' });
  };

  async function handleSaveToggle() {
    if (!isSignedIn) {
      setSignInOpen(true);
      return;
    }
    try {
      const method = saved ? 'DELETE' : 'POST';
      const resp = await fetch(`/api/posts/${post.id}/save`, { method });
      if (!resp.ok) throw new Error('Failed to toggle save');
      setSaved(!saved);
    } catch (error) {
      console.error(error);
    }
  }

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
    <div className="w-full min-h-screen">
      <div className="mt-4 ml-0 mr-16">
        <PostItem
          post={post}
          isCopySuccess={isCopySuccess}
          onShare={handleShare}
          onCommentClick={handleCommentClick}
          showSeparator={false}
          layout="post"
          isActive={true}
        />

        <p className="text-sm text-gray-200 mb-4">{post.content}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Author info */}
            <Link href={`/profile/${post.author.id}`}>
              <div className="flex items-center space-x-2 cursor-pointer">
                <Avatar className="h-10 w-10">
                  {post.author.avatarUrl ? (
                    <AvatarImage
                      src={post.author.avatarUrl}
                    />
                  ) : (
                    <AvatarFallback>{post.author.username?.charAt(0) || 'A'}</AvatarFallback>
                  )}
                </Avatar>
              </div>
            </Link>

            {/* Like button */}
            <Button
              variant="ghost"
              size="icon"
              className="bg-gray-800 rounded-full p-2 hover:bg-gray-700"
              onClick={handleCommentClick}
            >
              <HeartIcon className="h-6 w-6 text-white" />
            </Button>
            <span>{comments.length}</span>

            {/* Comment button */}
            <Button
              variant="ghost"
              size="icon"
              className="bg-gray-800 rounded-full p-2 hover:bg-gray-700"
              onClick={handleCommentClick}
            >
              <MessageCircleIcon className="h-6 w-6 text-white" />
            </Button>
            <span>{comments.length}</span>

            {/* Save (bookmark) button */}
            <SaveButton
              postId={post.id}
              initialSaved={post.savedByCurrentUser || false}
            />

            {/* Share */}
            <Button
              variant="ghost"
              size="icon"
              className="bg-gray-800 rounded-full p-2 hover:bg-gray-700"
              onClick={handleShare}
            >
              <ShareIcon className="h-6 w-6 text-white" />
            </Button>
            {isCopySuccess && <span>Link copied!</span>}
          </div>
        </div>

        {/* Comments */}
        <div id="comments-section" className="w-full my-6">
          <h2 className="text-2xl font-semibold mb-4">Comments</h2>
          <div className="space-y-4">
            {comments.map((comment) => (
              <NestedCommentItem
                key={comment.id}
                comment={comment}
                postId={post.id}
                postAuthorId={post.authorId}
                currentUser={isSignedIn ? { id: user?.id, username: user?.username || '' } : null}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>

          {/* Add comment box */}
          {isSignedIn ? (
            <div className="mt-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="bg-gray-800 text-white w-full mb-2"
              />
              <Button onClick={handleAddComment}>Post Comment</Button>
            </div>
          ) : (
            <div className="mt-6">
              <Button onClick={() => setSignInOpen(true)}>Sign in to add a comment</Button>
            </div>
          )}
        </div>

        {/* Back link */}
        <Button
          variant="link"
          onClick={() => window.history.back()}
          className="mt-2 text-blue-500 hover:underline"
        >
          &larr; Back to Home
        </Button>
      </div>

      {/* signIn modal */}
      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
    </div>
  );
}

// SSR
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
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
    likedByCurrentUser: false, // do a front-end check if needed
    comments: post.comments.map(serializeComment),
  };

  return {
    props: {
      post: serializedPost,
      status: post.status,
    },
  };
};

function serializeComment(comment: any) {
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
    likedByCurrentUser: false, // or do some logic
    children: comment.children?.map(serializeComment) || [],
  };
}

/**
 * NestedCommentItem: Allows "Reply" and "Hide replies" + "Like" if desired.
 * We remove timestamps. We also let user collapse children and open a reply box.
 */
function NestedCommentItem({
  comment,
  postId,
  postAuthorId,
  currentUser,
  onDelete,
}: {
  comment: any;
  postId: string;
  postAuthorId: string;
  currentUser: { id: string; username: string } | null;
  onDelete: (commentId: number) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [liked, setLiked] = useState(comment.likedByCurrentUser);
  const hasChildren = comment.children && comment.children.length > 0;

  // "Reply" handler
  async function handleReplySubmit() {
    if (!currentUser) return alert('Sign in first');
    if (!replyText.trim()) return;

    try {
      const resp = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyText,
          parentId: comment.id,
        }),
      });
      if (!resp.ok) {
        alert('Failed to reply');
        return;
      }
      // Optionally re-fetch or do local state update
      location.reload(); // or a better approach
    } catch (err) {
      alert('Error replying to comment');
    }
  }

  async function handleLike() {
    if (!currentUser) {
      alert('Please sign in');
      return;
    }
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c: number) => wasLiked ? c - 1 : c + 1);

    try {
      const method = wasLiked ? 'DELETE' : 'POST';
      const resp = await fetch(`/api/comments/${comment.id}/like`, { method });
      if (!resp.ok) {
        setLiked(wasLiked);
        setLikeCount((c: number) => wasLiked ? c + 1 : c - 1);
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((c: number) => wasLiked ? c + 1 : c - 1);
    }
  }

  return (
    <div className="flex items-start space-x-4 my-2">
      <Link href={`/profile/${comment.user.id}`}>
        <Avatar className="cursor-pointer">
          {comment.user.avatarUrl ? (
            <AvatarImage src={comment.user.avatarUrl} alt={comment.user.username} />
          ) : (
            <AvatarFallback>{comment.user.username?.charAt(0) || 'U'}</AvatarFallback>
          )}
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{comment.user.username}</p>
          {/* Delete only if user is author or post author */}
          <DeleteCommentButton
            comment={comment}
            postId={postId}
            postAuthorId={postAuthorId}
            currentUser={currentUser}
            onDelete={onDelete}
          />
        </div>
        <p>{comment.content}</p>
        {/* Like + reply row */}
        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-400">
          <CommentLikeButton 
            commentId={comment.id}
            initialLiked={comment.likedByCurrentUser}
            initialCount={comment.likeCount}
          />
          {currentUser && (
            <button onClick={() => setReplyOpen(!replyOpen)} className="hover:text-gray-200">
              Reply
            </button>
          )}
          {hasChildren && (
            <button onClick={() => setShowReplies(!showReplies)} className="text-sm hover:text-gray-200">
              {showReplies
                ? `Hide replies`
                : `View replies (${comment.children.length})`}
            </button>
          )}
        </div>

        {replyOpen && currentUser && (
          <div className="mt-2">
            <Textarea
              rows={2}
              className="w-full bg-gray-700 text-white p-2 rounded mb-1"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button onClick={handleReplySubmit}>Post Reply</Button>
          </div>
        )}

        {showReplies && hasChildren && (
          <div className="ml-6 mt-2">
            {comment.children.map((child: any) => (
              <NestedCommentItem
                key={child.id}
                comment={child}
                postId={postId}
                postAuthorId={postAuthorId}
                currentUser={currentUser}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
