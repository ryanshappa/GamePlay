import { useState } from 'react';
import { HeartIcon } from 'lucide-react';

interface CommentLikeButtonProps {
  commentId: number;
  initialLiked: boolean;
  initialCount: number;
}

export default function CommentLikeButton({ commentId, initialLiked, initialCount }: CommentLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);

  const handleLikeToggle = async () => {
    const method = liked ? 'DELETE' : 'POST';
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, { method });
      if (!response.ok) {
        // Revert changes if the request fails
        setLiked(liked);
        setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
      }
    } catch (error) {
      // Revert changes on error
      setLiked(liked);
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  return (
    <button onClick={handleLikeToggle} className="flex items-center space-x-1">
      <HeartIcon className={`h-5 w-5 ${liked ? 'text-red-500' : 'text-gray-500'}`} fill={liked ? 'currentColor' : 'none'} />
      <span>{likeCount}</span>
    </button>
  );
} 