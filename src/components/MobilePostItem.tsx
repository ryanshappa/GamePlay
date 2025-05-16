import React from 'react';
import { PostWithAuthor } from '~/types/types';

interface MobilePostItemProps {
  post: PostWithAuthor | undefined;
  onCommentClick: (post: PostWithAuthor) => void;
  onShare: (postId: string) => void;
}

export function MobilePostItem({ post, onCommentClick, onShare }: MobilePostItemProps) {
  if (!post) return <div className="w-full h-full bg-black"></div>;

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
    </div>
  );
} 