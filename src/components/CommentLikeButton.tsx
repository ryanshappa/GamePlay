import React, { useEffect } from 'react';
import { HeartIcon } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export interface CommentLikeButtonProps {
  commentId: number;
  initialLiked: boolean;
  initialCount: number;
}

export default function CommentLikeButton({ commentId, initialLiked, initialCount }: CommentLikeButtonProps) {
  const { isSignedIn } = useUser();
  const [liked, setLiked] = React.useState(initialLiked);
  const [likeCount, setLikeCount] = React.useState(initialCount);

  // When the component mounts (or the user changes), fetch the actual like status and count.
  useEffect(() => {
    if (isSignedIn) {
      fetch(`/api/comments/${commentId}/isLiked`)
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.liked === 'boolean' && typeof data.likeCount === 'number') {
            setLiked(data.liked);
            setLikeCount(data.likeCount);
          }
        })
        .catch((err) => console.error('Error fetching comment like status:', err));
    }
  }, [isSignedIn, commentId]);

  const handleLikeToggle = async () => {
    const oldLiked = liked;
    const oldCount = likeCount;
    const newLiked = !oldLiked;
    const newCount = oldLiked ? oldCount - 1 : oldCount + 1;
    // Optimistically update UI.
    setLiked(newLiked);
    setLikeCount(newCount);

    try {
      const method = oldLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/comments/${commentId}/like`, { method });
      if (!response.ok) {
        // If the API call fails, revert to the previous state.
        setLiked(oldLiked);
        setLikeCount(oldCount);
      }
    } catch (error) {
      setLiked(oldLiked);
      setLikeCount(oldCount);
    }
  };

  return (
    <button onClick={handleLikeToggle} className="flex items-center space-x-1">
      <HeartIcon
        className={`h-5 w-5 ${liked ? 'text-red-500' : 'text-gray-500'}`}
        fill={liked ? 'currentColor' : 'none'}
      />
      <span>{likeCount}</span>
    </button>
  );
}
