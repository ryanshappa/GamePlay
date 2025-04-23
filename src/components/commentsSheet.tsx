import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useAuth } from '~/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import DeleteCommentButton from './deleteComment';
import { NestedComment, PostWithAuthor } from '~/types/types';
import { HeartIcon } from 'lucide-react';

interface CommentsDrawerProps {
  open: boolean;
  onClose: () => void;
  post: PostWithAuthor;
  /**
   * The parent only needs the comment content or ID,
   * because it already knows which post is selected.
   */
  onAddComment?: (content: string) => void;
  onDeleteComment?: (commentId: number) => void;
}

function NestedCommentItemDrawer({
  comment,
  postId,
  currentUserId,
  depth = 0,
  onNewReply,
  onDeleteComment,
}: {
  comment: NestedComment;
  postId: string;
  currentUserId?: string;
  depth?: number;
  onNewReply: () => void;
  onDeleteComment: (commentId: number) => void;
}) {
  const [showReplies, setShowReplies] = React.useState(false);
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replyText, setReplyText] = React.useState('');
  const [likeCount, setLikeCount] = React.useState(comment.likeCount ?? 0);
  const [liked, setLiked] = React.useState(comment.likedByCurrentUser ?? false);

  const hasChildren = comment.children && comment.children.length > 0;

  async function handleLike() {
    if (!currentUserId) {
      // Not signed in
      return;
    }
    // optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      const method = wasLiked ? 'DELETE' : 'POST';
      const res = await fetch(`/api/comments/${comment.id}/like`, { method });
      if (!res.ok) {
        // revert
        setLiked(wasLiked);
        setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
      }
    } catch {
      // revert
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  }

  async function handleReplySubmit() {
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
        throw new Error('Failed to submit reply');
      }
      setReplyText('');
      setReplyOpen(false);
      onNewReply(); // re-fetch or local update
    } catch (err) {
      console.error(err);
      alert('Failed to submit reply');
    }
  }

  return (
    <div style={{ marginLeft: depth * 16 }} className="mb-3">
      <div className="flex items-start space-x-2">
        <Link href={`/profile/${comment.user.id}`}>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={comment.user.avatarUrl || ''} alt="User Avatar" />
            <AvatarFallback>
              {comment.user.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{comment.user.username}</p>
            {currentUserId && (
              <DeleteCommentButton
                comment={{
                  id: comment.id,
                  user: { id: comment.user.id, username: comment.user.username || '' },
                }}
                postId={postId}
                postAuthorId="" // We'll set the actual postAuthorId if needed
                currentUser={{ id: currentUserId, username: '' }}
                onDelete={(commentId) => onDeleteComment(commentId)}
              />
            )}
          </div>

          <p>{comment.content}</p>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
            <span>
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </span>
            {currentUserId && (
              <button
                className="hover:text-gray-200"
                onClick={() => setReplyOpen(!replyOpen)}
              >
                Reply
              </button>
            )}
            <button className="ml-auto flex items-center" onClick={handleLike}>
              <HeartIcon
                className={`h-5 w-5 mr-1 ${
                  liked ? 'text-red-500' : 'text-gray-400'
                }`}
                fill={liked ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {replyOpen && currentUserId && (
            <div className="mt-2">
              <textarea
                rows={2}
                className="w-full bg-gray-700 text-white p-2 rounded mb-1"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <Button onClick={handleReplySubmit}>Post Reply</Button>
            </div>
          )}

          {hasChildren && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-sm text-gray-400 hover:text-gray-200 mt-1"
            >
              {showReplies
                ? `Hide replies`
                : `View replies (${comment.children?.length ?? 0})`}
            </button>
          )}
        </div>
      </div>

      {showReplies && hasChildren && (
        <div className="mt-2">
          {comment.children?.map((child) => (
            <NestedCommentItemDrawer
              key={child.id}
              comment={child}
              postId={postId}
              currentUserId={currentUserId}
              depth={depth + 1}
              onNewReply={onNewReply}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsDrawer({
  open,
  onClose,
  post,
  onAddComment,
  onDeleteComment,
}: CommentsDrawerProps) {
  const { user, loading } = useAuth();
  const [comments, setComments] = React.useState<NestedComment[]>([]);
  const [newComment, setNewComment] = React.useState('');

  React.useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, post.id]);

  async function fetchComments() {
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setComments(data);
      } else {
        console.error('Unexpected data format:', data);
        setComments([]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Local fetch approach if no parent callback is provided.
   * (Used if you want to function standalone.)
   */
  async function handleAddCommentLocal() {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to add comment:', errorData.message || response.statusText);
      } else {
        setNewComment('');
        await fetchComments(); // refresh local comments
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  /**
   * Final method that either calls parent or does local fetch
   */
  async function handleAddCommentFinal() {
    if (!newComment.trim()) {
      return;
    }
    if (onAddComment) {
      // Call parent's "optimistic" approach
      onAddComment(newComment);
      setNewComment('');
      // Re-fetch to keep local list in sync
      await fetchComments();
    } else {
      await handleAddCommentLocal();
    }
  }

  async function handleDeleteCommentLocal(commentId: number) {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete comment:', errorData.message || response.statusText);
        alert(`Failed to delete comment: ${errorData.message || response.statusText}`);
      } else {
        await fetchComments(); // re-fetch to see updated list
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('An unexpected error occurred while deleting the comment.');
    }
  }

  async function handleDeleteCommentFinal(commentId: number) {
    if (onDeleteComment) {
      onDeleteComment(commentId);
      // Then re-fetch to keep local comments in sync
      await fetchComments();
    } else {
      await handleDeleteCommentLocal(commentId);
    }
  }

  function handleNewReply() {
    fetchComments();
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="p-4 bg-gray-800 text-white w-[320px]"
        style={{ opacity: 0.95 }}
      >
        <SheetHeader>
          <SheetTitle className="text-xl font-bold mb-4 text-white">
            Comments
          </SheetTitle>
        </SheetHeader>

        <div>
          {comments.map((comment) => (
            <NestedCommentItemDrawer
              key={comment.id}
              comment={comment}
              postId={post.id}
              currentUserId={user?.id}
              onNewReply={handleNewReply}
              onDeleteComment={handleDeleteCommentFinal}
            />
          ))}
        </div>

        {user && (
          <div className="mt-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full mb-2 bg-gray-700 text-white"
            />
            <Button onClick={handleAddCommentFinal} disabled={!newComment.trim()}>
              Post Comment
            </Button>
          </div>
        )}

        {!user && !loading && (
          <div className="mt-4 text-center text-gray-400">
            <p>Sign in to comment</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
