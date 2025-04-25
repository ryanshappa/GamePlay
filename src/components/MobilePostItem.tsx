import React from 'react';
import { PostWithAuthor } from '~/types/types';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

interface MobilePostItemProps {
  post: PostWithAuthor;
  onCommentClick: (postId: string) => void;
  onShare: (postId: string) => void;
}

export function MobilePostItem({ post, onCommentClick, onShare }: MobilePostItemProps) {
  // You can expand this with more functionality later
  const handleLike = () => {
    // Implement like functionality
    console.log('Like post:', post.id);
  };

  const handleSave = () => {
    // Implement save functionality
    console.log('Save post:', post.id);
  };

  return (
    <div className="relative w-full h-full">
      <iframe
        src={post.fileUrl || ''}
        title={post.title}
        className="w-full h-full"
        frameBorder="0"
        allow="fullscreen; autoplay; gamepad"
      />

      {/* Simplified info overlay: only username + title,
          raised by 16px so it sits just above the BottomNav */}
      <div className="absolute bottom-16 left-4 right-4 bg-gradient-to-t from-black/80 to-transparent p-4">
        <span className="block font-medium text-white">{post.author.username}</span>
        <span className="block text-sm mt-1 text-white">{post.title}</span>
      </div>

      {/* Action buttons on right side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-6">
        {/* — Avatar at top, links to profile */}
        <Link href={`/profile/${post.author.id}`} className="mb-4">
          <Avatar className="h-10 w-10 ring-2 ring-white">
            {post.author.avatarUrl ? (
              <AvatarImage src={post.author.avatarUrl} alt={post.author.username} />
            ) : (
              <AvatarFallback>
                {post.author.username?.charAt(0) || 'U'}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>

        {/* Like */}
        <button 
          className="flex flex-col items-center text-white"
          onClick={handleLike}
        >
          <Heart className="h-7 w-7 mb-1" />
          <span className="text-xs">{post.likesCount}</span>
        </button>
        
        {/* Comment */}
        <button 
          className="flex flex-col items-center text-white"
          onClick={() => onCommentClick(post.id)}
        >
          <MessageCircle className="h-7 w-7 mb-1" />
          <span className="text-xs">{post.commentsCount}</span>
        </button>
        
        {/* Save */}
        <button 
          className="flex flex-col items-center text-white"
          onClick={handleSave}
        >
          <Bookmark className="h-7 w-7 mb-1" />
        </button>
        
        {/* Share */}
        <button 
          className="flex flex-col items-center text-white"
          onClick={() => onShare(post.id)}
        >
          <Share2 className="h-7 w-7 mb-1" />
        </button>
      </div>
    </div>
  );
} 