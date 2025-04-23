import { GetServerSideProps } from 'next';
import { db } from '~/server/db';
import { PostWithAuthor } from '~/types/types';
import React, { useState, useEffect } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import PostItem from '~/components/postItem';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { ScrollArea } from '~/components/ui/scroll-area';
import { HeartIcon, MessageCircleIcon, ShareIcon, Bookmark } from 'lucide-react';
import Link from 'next/link';
import DeleteCommentButton from '~/components/deleteComment';
import { SignInModal } from '~/components/signInModal';

// We define a separate NestedCommentItem at the bottom

interface PostPageProps {
  post: PostWithAuthor;
  status: string;
}

export default function PostPage({ post, status }: PostPageProps) {
  const { user } = useAuth();
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
    if (!user) {
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
    if (!user) {
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
    if (!user) {
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
    if (!user) {
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
    <div className="flex-1 p-4">
      <ScrollArea className="w-full h-full">
        <div className="flex flex-col w-full max-w-4xl mx-auto">
          {/* Game iframe */}
          <div className="aspect-video w-full bg-gray-900 rounded-lg overflow-hidden mb-4">
            <iframe
              src={post.fileUrl || ''}
              title={post.title}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>

          {/* Post title and author info */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold">{post.title}</h1>
              <div className="flex items-center mt-2">
                <Link href={`/profile/${post.author.id}`}>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={post.author.avatarUrl || undefined} />
                      <AvatarFallback>
                        {post.author.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-300">@{post.author.username}</span>
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className="rounded-full"
              >
                <HeartIcon
                  className={`h-6 w-6 ${hasLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCommentClick}
                className="rounded-full"
              >
                <MessageCircleIcon className="h-6 w-6 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-full"
              >
                <ShareIcon className="h-6 w-6 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveToggle}
                className="rounded-full"
              >
                <Bookmark
                  className={`h-6 w-6 ${saved ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
                />
              </Button>
            </div>
          </div>

          {/* Post content */}
          <div className="mb-6">
            <p className="text-gray-300">{post.content}</p>
          </div>

          {/* Comments section */}
          <div id="comments-section" className="mt-8">
            <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>
            {comments.map((comment) => (
              <NestedCommentItem
                key={comment.id}
                comment={comment}
                postId={post.id}
                postAuthorId={post.authorId}
                currentUser={user ? { id: user.id, username: user.username || '' } : null}
                onDelete={handleDeleteComment}
              />
            ))}

            {/* Add comment box */}
            {user ? (
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
      </ScrollArea>
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
          <button className="flex items-center space-x-1" onClick={handleLike}>
            <HeartIcon
              className={`h-5 w-5 ${liked ? 'text-red-500' : 'text-gray-400'}`}
              fill={liked ? 'currentColor' : 'none'}
            />
            <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          </button>
          {currentUser && (
            <button onClick={() => setReplyOpen(!replyOpen)}>
              Reply
            </button>
          )}
          {hasChildren && (
            <button onClick={() => setShowReplies(!showReplies)}>
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
