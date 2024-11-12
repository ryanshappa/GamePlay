import React from 'react';
import { MoreHorizontal } from 'lucide-react'; // Import the MoreHorizontal icon
import { Button } from './ui/button'; // Assuming you have a Button component

interface User {
  id: string;
  username: string;
}

interface Post {
  id: string;
  authorId: string;
}

interface Comment {
  id: number;
  user: User;
  post: Post;
}

interface DeleteCommentButtonProps {
  comment: Comment;
  postAuthorId: string; // New prop added
  currentUser: User | null;
  onDelete: (commentId: number) => void;
}

const DeleteCommentButton: React.FC<DeleteCommentButtonProps> = ({
  comment,
  postAuthorId,
  currentUser,
  onDelete,
}) => {
  const isAuthorized =
    currentUser &&
    (currentUser.id === comment.user.id || currentUser.id === postAuthorId);

  const handleDelete = async () => {
    if (!isAuthorized) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `/api/posts/${comment.post.id}/comments`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ commentId: comment.id }),
        }
      );

      if (response.ok) {
        onDelete(comment.id);
        alert('Comment deleted successfully.');
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

  return isAuthorized ? (
    <Button
      onClick={handleDelete}
      aria-label="Delete comment"
      variant="ghost"
      size="icon"
      className="text-white hover:bg-transparent hover:text-white p-1"
    >
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  ) : null;
};

export default DeleteCommentButton;