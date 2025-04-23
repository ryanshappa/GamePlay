import React, { useEffect } from 'react';
import { HeartIcon } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';

export interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  /** "column" (default) or "row" for layout */
  orientation?: 'column' | 'row';
}

export function LikeButton({ postId, initialLiked, initialCount, orientation = 'column' }: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = React.useState(initialLiked);
  const [count, setCount] = React.useState(initialCount);
  const [loading, setLoading] = React.useState(false);

  // On mount, if signed in, fetch the actual like status
  useEffect(() => {
    if (user) {
      fetch(`/api/posts/${postId}/isLiked`)
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.liked === 'boolean') {
            setLiked(data.liked);
          }
        })
        .catch((err) => console.error("Error fetching like status:", err));
    }
  }, [user, postId]);

  const handleClick = async () => {
    if (!user || loading) return;
    setLoading(true);

    const oldLiked = liked;
    const oldCount = count;
    const newLiked = !oldLiked;
    const newCount = oldLiked ? oldCount - 1 : oldCount + 1;
    setLiked(newLiked);
    setCount(newCount);

    const method = oldLiked ? 'DELETE' : 'POST';

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method });
      if (!res.ok) {
        // Revert changes if the request fails
        setLiked(oldLiked);
        setCount(oldCount);
        console.error('Failed to update like status.');
      }
    } catch (err) {
      setLiked(oldLiked);
      setCount(oldCount);
      console.error('Error updating like status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Choose the container classes based on orientation.
  const containerClasses =
    orientation === 'row'
      ? 'flex items-center space-x-1'
      : 'flex flex-col items-center';

  return (
    <div className={containerClasses}>
      <button
        className="rounded-full bg-gray-800 hover:bg-gray-700 p-2"
        onClick={handleClick}
        disabled={loading}
      >
        <HeartIcon
          className={`h-6 w-6 ${liked ? 'text-red-500' : 'text-white'}`}
          fill={liked ? 'currentColor' : 'none'}
        />
      </button>
      {/* When in row mode, show the count right next to the icon */}
      {orientation === 'row' ? (
        <span className="text-white">{count}</span>
      ) : (
        // In column mode, the count appears below.
        <span className="text-white mt-1">{count}</span>
      )}
    </div>
  );
}
