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
}

interface DeleteCommentButtonProps {
  comment: Comment;
  postId: string;
  postAuthorId: string; 
  currentUser: User | null;
  onDelete: (commentId: number) => void;
}

const DeleteCommentButton: React.FC<DeleteCommentButtonProps> = ({
  comment,
  postId,
  postAuthorId,
  currentUser,
  onDelete,
}) => {
  const isAuthorized =
    currentUser &&
    (currentUser.id === comment.user.id || currentUser.id === postAuthorId);

    const handleDelete = () => {
      if (!isAuthorized) return;
    
      const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
      if (!confirmDelete) return;
    
      // Delegate deletion to parent component
      onDelete(comment.id);
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