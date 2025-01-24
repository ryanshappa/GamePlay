import React, { useRef, useEffect, useState } from 'react';
import { PostWithAuthor } from '~/types/types';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { HeartIcon, MessageCircleIcon, ShareIcon } from 'lucide-react';
import Link from 'next/link';
import { LikeButton } from '~/components/likeButton';

interface PostItemProps {
  post: PostWithAuthor;
  onCommentClick: (post: PostWithAuthor) => void;
  onShare: (postId: string) => void;
  isCopySuccess: boolean;
  showSeparator?: boolean;
  layout?: 'feed' | 'post';
  isActive: boolean;
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  onCommentClick,
  onShare,
  isCopySuccess,
  showSeparator = true,
  layout = 'feed',
  isActive,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isFeedLayout = layout === 'feed';
  const [iframeSrc, setIframeSrc] = useState(post.fileUrl || '');

  useEffect(() => {
    if (isActive) {
      setIframeSrc((post.fileUrl || '') + '?t=' + new Date().getTime());
    } else {
      setIframeSrc('about:blank');
    }
  }, [isActive, post.fileUrl]);

  return (
    <div className="flex flex-col w-full">
      {/* Title flush left in feed layout */}
      {isFeedLayout && (
        <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
      )}

      <div className={`relative ${isFeedLayout ? 'flex items-start' : 'flex flex-col items-center'}`}>
        {/* The container that is offset from the left for the game itself */}
        <div
          className={`
            ${isFeedLayout
              ? 'ml-6 w-[880px] h-[490px]' // or your desired size
              : 'w-[120vh] h-[80vh] bg-black'
            } 
            rounded-md overflow-hidden
          `}
        >
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title={post.title}
            className="w-full h-full"
            frameBorder="0"
            allow="fullscreen; pointer-lock; autoplay; gamepad"
            allowFullScreen
          ></iframe>
        </div>

        {/* Interaction buttons in feed layout */}
        {isFeedLayout && (
          <div className="flex flex-col items-center space-y-4 ml-4 relative">
            <Link href={`/profile/${post.author.id}`}>
              <Avatar className="cursor-pointer">
                <AvatarImage src={post.author.avatarUrl || ''} alt="Author Avatar" />
                <AvatarFallback>
                  {post.author.username?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
            </Link>

            <LikeButton
              postId={post.id}
              initialLiked={post.likedByCurrentUser}
              initialCount={post.likesCount}
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-800 hover:bg-gray-700"
              onClick={() => onCommentClick(post)}
            >
              <MessageCircleIcon className="h-6 w-6" />
            </Button>
            <span>{post.commentsCount}</span>

            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-800 hover:bg-gray-700"
                onClick={() => onShare(post.id.toString())}
              >
                <ShareIcon className="h-6 w-6" />
              </Button>
              {isCopySuccess && (
                <span className="absolute text-sm text-white mt-1 left-full ml-2">
                  Link copied!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {isFeedLayout && <p className="mt-2">{post.content}</p>}
      {isFeedLayout && (
        <Link
          href={`/post/${post.id}`}
          className="text-blue-500 hover:underline mt-1"
        >
          View Post
        </Link>
      )}

      {/* If it's a single post, place the title inside "post" layout if you want to. */}
      {!isFeedLayout && (
        <h2 className="text-2xl font-bold mt-4 mb-2">{post.title}</h2>
      )}

      {showSeparator && <hr className="w-full border-t border-gray-300 mt-8 mb-6" />}
    </div>
  );
};

export default PostItem;
