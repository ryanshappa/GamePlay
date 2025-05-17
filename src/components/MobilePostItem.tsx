import React from 'react';
import { PostWithAuthor } from '~/types/types';

interface MobilePostItemProps {
  post: PostWithAuthor | null | undefined;
  onCommentClick: () => void;
  onShare: () => void;
}

export function MobilePostItem({ post, onCommentClick, onShare }: MobilePostItemProps) {
  if (!post) return null;

  return (
    <div className="relative w-full h-full">
      {/* only the game iframe */}
      <iframe
        src={post.fileUrl || ""}
        title={post.title}
        className="w-full h-full"
        frameBorder="0"
        allow="fullscreen; autoplay; gamepad"
      />
      
      {/* Add this if you need action buttons in portrait mode */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-6">
        {/* Your action buttons would go here */}
      </div>
    </div>
  );
} 