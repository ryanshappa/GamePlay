import { GetServerSideProps } from 'next';
import { db } from '~/server/db';
import { PostWithAuthor, NestedComment } from '~/types/types';
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

interface ReplyState {
  showReply: boolean;
  replyText: string;
  showReplies: boolean;
}

interface PostPageProps {
  post: PostWithAuthor;
  status: string;
}

export default function PostPage({ post, status }: PostPageProps) {
  const { user, isSignedIn } = useUser();
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(post.likedByCurrentUser);

  const [nestedComments, setNestedComments] = useState<NestedComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyStates, setReplyStates] = useState<{ [key: number]: ReplyState }>({});

  // Prevent spam-click on post like
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    fetchNestedComments();
  }, []);

  async function fetchNestedComments() {
    try {
      const resp = await fetch(`/api/posts/${post.id}/comments`);
      if (!resp.ok) throw new Error('Failed to fetch nested comments');
      const data: NestedComment[] = await resp.json();
      setNestedComments(data);
    } catch (error) {
      console.error(error);
    }
  }

  // ------------------------
  // HELPER: IMMUTABLE COMMENT UPDATE
  // ------------------------
  /**
   * Recursively copy the nestedComments array, find the comment with `commentId`,
   * and toggle its `likedByCurrentUser` plus increment/decrement `likeCount`.
   */
  function toggleCommentLikeInState(
    comments: NestedComment[],
    commentId: number,
    wasLiked: boolean
  ): NestedComment[] {
    return comments.map((c) => {
      if (c.id === commentId) {
        // Found the target comment
        const newLikedByCurrentUser = !wasLiked;
        const newLikeCount = (c.likeCount || 0) + (wasLiked ? -1 : 1);
        return {
          ...c,
          likedByCurrentUser: newLikedByCurrentUser,
          likeCount: newLikeCount,
        };
      } else if (c.children && c.children.length > 0) {
        // Recursively update children
        return {
          ...c,
          children: toggleCommentLikeInState(c.children, commentId, wasLiked),
        };
      }
      return c; // no change
    });
  }

  // ------------------------
  //  1) POST-LIKE HANDLERS
  // ------------------------
  const handlePostLike = async () => {
    if (!isSignedIn) {
      return;
    }
    if (likeLoading) return;
    setLikeLoading(true);

    const method = hasLiked ? 'DELETE' : 'POST';
    // Optimistic update
    setHasLiked(!hasLiked);
    setLikesCount((prev) => (hasLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, { method });
      if (!response.ok) {
        // revert
        setHasLiked(hasLiked);
        setLikesCount((prev) => (hasLiked ? prev + 1 : prev - 1));
        console.error('Failed to update post like status.');
      }
    } catch (error) {
      // revert
      setHasLiked(hasLiked);
      setLikesCount((prev) => (hasLiked ? prev + 1 : prev - 1));
      console.error('Error updating like status:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  // ------------------------
  //  2) COMMENT-LIKE HANDLER
  // ------------------------
  async function handleCommentLike(commentId: number, wasLiked: boolean) {
    if (!isSignedIn) {
      return;
    }

    // 1) Immediately update nestedComments immutably to reflect new like state
    setNestedComments((prev) => toggleCommentLikeInState(prev, commentId, wasLiked));

    // 2) Send request to server
    const method = wasLiked ? 'DELETE' : 'POST';
    try {
      const resp = await fetch(`/api/comments/${commentId}/like`, { method });
      if (!resp.ok) {
        // If server fails, revert the local update
        setNestedComments((prev) => toggleCommentLikeInState(prev, commentId, !wasLiked));
        throw new Error('Failed to like/unlike comment');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ------------------------
  //  3) COMMENT DELETE
  // ------------------------
  async function deleteComment(commentId: number) {
    if (!isSignedIn) {
      return;
    }
    try {
      const resp = await fetch(`/api/posts/${post.id}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      if (!resp.ok) {
        throw new Error('Failed to delete comment');
      }
      await fetchNestedComments();
    } catch (err) {
      console.error(err);
      alert('Error deleting comment');
    }
  }

  // ------------------------
  //  4) REPLIES
  // ------------------------
  async function handleAddTopLevelComment() {
    if (!isSignedIn) {
      return;
    }
    if (!newCommentText.trim()) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newCommentText, parentId: null }),
      });
      if (!response.ok) {
        throw new Error('Failed to add top-level comment');
      }
      setNewCommentText('');
      fetchNestedComments();
    } catch (error) {
      alert('Error adding top-level comment');
    }
  }

  // Toggle the reply box
  function handleReplyToggle(commentId: number) {
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: {
        showReply: !prev[commentId]?.showReply,
        replyText: prev[commentId]?.replyText || '',
        showReplies: prev[commentId]?.showReplies || false,
      },
    }));
  }

  // Toggle child replies
  function handleShowRepliesToggle(commentId: number) {
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: {
        showReply: prev[commentId]?.showReply || false,
        replyText: prev[commentId]?.replyText || '',
        showReplies: !prev[commentId]?.showReplies,
      },
    }));
  }

  // Update the reply text
  function handleReplyTextChange(commentId: number, text: string) {
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: {
        showReply: prev[commentId]?.showReply || false,
        showReplies: prev[commentId]?.showReplies || false,
        replyText: text,
      },
    }));
  }

  async function handleReplySubmit(commentId: number) {
    const replyText = replyStates[commentId]?.replyText || '';
    if (!replyText.trim()) return;
    try {
      const resp = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText, parentId: commentId }),
      });
      if (!resp.ok) throw new Error('Failed to submit reply');
      // Reset the reply box
      setReplyStates((prev) => ({
        ...prev,
        [commentId]: {
          showReply: false,
          replyText: '',
          showReplies: prev[commentId]?.showReplies || false,
        },
      }));
      fetchNestedComments();
    } catch (err) {
      alert('Error submitting reply');
    }
  }

  // ---------------
  // Render nested
  // ---------------
  function renderComments(comments: NestedComment[], depth = 0) {
    return comments.map((comment) => {
      const state = replyStates[comment.id] || {
        showReply: false,
        replyText: '',
        showReplies: false,
      };
      const isCurrentlyLiked = !!comment.likedByCurrentUser; // ensure boolean

      return (
        <div key={comment.id} style={{ marginLeft: depth * 16 }} className="mb-3">
          <div className="flex items-start space-x-2">
            <Link href={`/profile/${comment.user.id}`}>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={comment.user.avatarUrl || ''} alt="User Avatar" />
                <AvatarFallback>{comment.user.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{comment.user.username || 'Unknown'}</p>
                <DeleteCommentButton
                  comment={{
                    id: comment.id,
                    user: { id: comment.user.id, username: comment.user.username || '' },
                  }}
                  postId={post.id}
                  postAuthorId={post.authorId}
                  currentUser={
                    user
                      ? { id: user.id, username: user.username || '' }
                      : null
                  }
                  onDelete={(cid) => deleteComment(cid)}
                />
              </div>
              <p>{comment.content}</p>
              {/* Like count, reply button, heart */}
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                <span>
                  {comment.likeCount || 0} {comment.likeCount === 1 ? 'like' : 'likes'}
                </span>
                <button
                  onClick={() => handleReplyToggle(comment.id)}
                  className="hover:text-gray-200"
                >
                  Reply
                </button>
                <button
                  className="ml-auto flex items-center"
                  onClick={() => {
                    // We do an IMMUTABLE update in state so React re-renders
                    handleCommentLike(comment.id, isCurrentlyLiked);
                  }}
                >
                  <HeartIcon
                    className={`h-5 w-5 mr-1 ${
                      isCurrentlyLiked ? 'text-red-500' : 'text-gray-400'
                    }`}
                    fill={isCurrentlyLiked ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {/* If "Reply" box is open */}
              {state.showReply && (
                <div className="mt-2">
                  <Textarea
                    rows={2}
                    className="w-full bg-gray-700 text-white p-2 rounded mb-1"
                    value={state.replyText}
                    onChange={(e) => handleReplyTextChange(comment.id, e.target.value)}
                  />
                  <Button onClick={() => handleReplySubmit(comment.id)}>Post Reply</Button>
                </div>
              )}

              {/* If the comment has children */}
              {comment.children && comment.children.length > 0 && (
                <button
                  onClick={() => handleShowRepliesToggle(comment.id)}
                  className="text-sm text-gray-400 hover:text-gray-200 mt-1"
                >
                  {state.showReplies
                    ? `Hide replies`
                    : `View replies (${comment.children.length})`}
                </button>
              )}
            </div>
          </div>

          {/* sub-comments */}
          {state.showReplies && comment.children && (
            <div className="mt-2">
              {renderComments(comment.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  }

  // ---------------
  // Share / etc
  // ---------------
  const [isCopySuccess, setIsCopySuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<'signIn' | 'signUp' | null>(null);

  function handleShare() {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    setIsCopySuccess(true);
    setTimeout(() => setIsCopySuccess(false), 2000);
  }

  function handleCommentClick() {
    const el = document.getElementById('comments-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  if (status === 'processing' || status === 'invalid') {
    return (
      <div className="flex-1">
        <ScrollArea className="w-full h-full">
          <div className="flex flex-col w-full">
            {status === 'processing' && <p>Your game is being processed. Please check back shortly.</p>}
            {status === 'invalid' && <p>There was an issue with your game upload. Please try again.</p>}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // ---------------
  // MAIN RENDER
  // ---------------
  return (
    <div className="w-full min-h-screen">
      <div className="mt-4 ml-0 mr-16">
        {/* The embed */}
        <PostItem
          post={post}
          isCopySuccess={isCopySuccess}
          onShare={handleShare}
          onCommentClick={handleCommentClick}
          showSeparator={false}
          layout="post"
          isActive={true}
        />

        <p className="text-sm text-gray-200 mb-2 whitespace-pre-wrap max-w-[75%]">
          {post.content}
        </p>

        {/* Post Interaction */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {/* Post Like */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
              onClick={handlePostLike}
              disabled={likeLoading}
            >
              <HeartIcon
                className={`h-6 w-6 ${hasLiked ? 'text-red-500' : 'text-white'}`}
                fill={hasLiked ? 'currentColor' : 'none'}
              />
            </Button>
            <span>{likesCount}</span>

            {/* Comments */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
              onClick={handleCommentClick}
            >
              <MessageCircleIcon className="h-6 w-6 text-white" />
            </Button>
            <span>{post.commentsCount}</span>

            {/* Author */}
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

            {/* Share */}
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

        {/* Nested Comments Section */}
        <div id="comments-section" className="w-full my-6">
          <h2 className="text-2xl font-semibold mb-4">Comments</h2>
          <div className="space-y-2">
            {renderComments(nestedComments)}
          </div>

          {/* Add Top-Level Comment */}
          {isSignedIn ? (
            <div className="mt-6">
              <Textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full mb-2 bg-gray-800 text-white"
              />
              <Button onClick={handleAddTopLevelComment}>Post Comment</Button>
            </div>
          ) : (
            <div className="mt-6">
              <Button onClick={() => setDialogOpen('signIn')}>
                Sign in to add a comment
              </Button>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <Button
          variant="link"
          onClick={() => window.history.back()}
          className="mt-2 text-blue-500 hover:underline"
        >
          &larr; Back to Home
        </Button>
      </div>

      {/* Sign-In */}
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
      likes: userId ? { where: { userId } } : false,
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!post) {
    return { notFound: true };
  }

  const serializedPost = {
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
      username: post.author.username ?? '',
      avatarUrl: post.author.avatarUrl ?? '',
    },
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    likedByCurrentUser: userId ? post.likes?.length > 0 : false,
  };

  return {
    props: {
      post: serializedPost,
      status: post.status,
    },
  };
};
