import * as React from 'react';
import * as Drawer from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import DeleteCommentButton from './deleteComment'; 

interface User {
  id: string;
  username?: string;
}

interface Post {
  id: string;
  authorId: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: string; 
    avatarUrl: string;
    username: string;
  };
  postId: string; 
}

interface PostWithAuthor extends Post {
  author: {
    username: string | null;
  };
  commentsCount: number; 
}

interface CommentsDrawerProps {
  open: boolean;
  onClose: () => void;
  post: PostWithAuthor;
  onAddComment?: (postId: string) => void;
  onDeleteComment?: (postId: string, commentId: number) => void;
}

export function CommentsDrawer({ open, onClose, post, onAddComment, onDeleteComment }: CommentsDrawerProps) {
  const { user } = useUser();
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState('');

  React.useEffect(() => {
    if (open) {
      fetch(`/api/posts/${post.id}/comments`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setComments(data);
          } else {
            console.error('Unexpected data format:', data);
            setComments([]);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [open, post.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const comment: Comment = await response.json();
        setComments((prev) => [...prev, comment]);
        setNewComment('');

        // Call onAddComment callback if provided
        if (onAddComment) {
          onAddComment(post.id);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to add comment:', errorData.message || response.statusText);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));

        // Call onDeleteComment callback if provided
        if (onDeleteComment) {
          onDeleteComment(post.id, commentId);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to delete comment:', errorData.message || response.statusText);
        alert(`Failed to delete comment: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('An unexpected error occurred while deleting the comment.');
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={onClose}>
      <Drawer.Portal>
        {/* Overlay */}
        <Drawer.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        {/* Drawer Content */}
        <Drawer.Content
          className="fixed right-0 bg-gray-800 p-4 text-white overflow-y-auto shadow-lg z-40"
          style={{
            top: '72px',
            height: 'calc(100vh - 72px)',
            width: '320px',
          }}
        >
          <Drawer.Title className="text-xl font-bold mb-4">
            Comments ({comments.length})
          </Drawer.Title>
          <Drawer.Close className="absolute top-2 right-2 text-white hover:text-gray-400">
            &times;
          </Drawer.Close>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-2">
                {/* Wrap Avatar with Link */}
                <Link href={`/profile/${comment.user.id}`}>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={comment.user.avatarUrl} alt="User Avatar" />
                    <AvatarFallback>{comment.user.username?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <p className="font-semibold">{comment.user.username}</p>
                  <p>{comment.content}</p>
                  {/* Flex Container for Timestamp and Delete Button */}
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-xs">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                    {/* Conditionally render the Delete button */}
                    {(user?.id === comment.user.id || user?.id === post.authorId) && (
                      <DeleteCommentButton
                        comment={comment}
                        postId={post.id}
                        postAuthorId={post.authorId}
                        currentUser={user ? { id: user.id, username: user.username || '' } : null}
                        onDelete={handleDeleteComment}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Add Comment */}
          {user && (
            <div className="mt-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full mb-2 bg-gray-700 text-white"
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}