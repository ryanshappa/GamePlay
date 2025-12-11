// src/components/postItem.tsx
import React, { useState } from 'react';
import { PostWithAuthor } from '~/types/types';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { MessageCircleIcon, ShareIcon } from 'lucide-react';
import Link from 'next/link';
import { LikeButton } from '~/components/likeButton';
import { SaveButton } from '~/components/saveButton';

interface PostItemProps {
  post: PostWithAuthor;
  onCommentClick: (post: PostWithAuthor) => void;
  onShare: (postId: string) => void;
  isCopySuccess: boolean;
  showSeparator?: boolean;
  layout?: 'feed' | 'post';
  isActive: boolean;
}

const PostItem: React.FC<PostItemProps> = React.memo(({
  post,
  onCommentClick,
  onShare,
  isCopySuccess,
  showSeparator = true,
  layout = 'feed',
  isActive,
}) => {
  const isFeedLayout = layout === 'feed';
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Check if content is long enough to need truncation (roughly 3 lines worth)
  const needsTruncation = post.content && post.content.length > 150;

  return (
    <div className="flex flex-col w-full items-center px-4">
      {isFeedLayout && (
        <h2 className="text-2xl font-bold mb-2 w-full" style={{ maxWidth: 'calc(100vw - 300px)', width: '60vw' }}>
            {post.title}
        </h2>
      )}

      <div className={`relative ${isFeedLayout ? 'flex items-center' : 'flex flex-col items-center'}`}>
        {/* Iframe container - responsive with viewport-based sizing */}
        <div
          className="rounded-lg overflow-hidden bg-muted"
          style={{
            width: isFeedLayout ? 'min(60vw, calc(100vw - 300px))' : 'min(70vw, calc(100vw - 200px))',
            aspectRatio: '16/9'
          }}
        >
          {/* Iframe only renders when active - fully unmounts when inactive to stop audio/video */}
          {isActive && post.fileUrl ? (
            <iframe
              key={`iframe-${post.id}`}
              src={post.fileUrl}
              title={post.title}
              className="w-full h-full"
              loading="lazy"
              frameBorder="0"
              allow="fullscreen; cross-origin-isolated"
              allowFullScreen
              // @ts-expect-error - credentialless is a valid attribute but not in React types yet
              credentialless="true"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Loading...</span>
            </div>
          )}
        </div>

        {/* Interaction buttons - larger and more prominent */}
        {isFeedLayout && (
          <div className="flex flex-col items-center space-y-5 ml-6 relative">
            {/* Author Avatar - larger */}
            <Link href={`/profile/${post.author.id}`}>
              <Avatar className="cursor-pointer h-14 w-14 border-2 border-primary">
                <AvatarImage src={post.author.avatarUrl || ''} alt="Author Avatar" />
                <AvatarFallback className="text-lg">
                  {post.author.username?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
            </Link>

            {/* Like Button - larger */}
            <LikeButton
              postId={post.id}
              initialLiked={post.likedByCurrentUser}
              initialCount={post.likesCount}
              size="large"
            />

            {/* Comment Button - larger */}
            <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
                className="rounded-full bg-muted hover:bg-foreground/20 h-14 w-14"
              onClick={() => onCommentClick(post)}
            >
                <MessageCircleIcon className="h-8 w-8" />
            </Button>
              <span className="text-sm mt-1">{post.commentsCount}</span>
            </div>

            {/* Save Button - larger */}
            <SaveButton
              postId={post.id}
              initialSaved={post.savedByCurrentUser || false}
              size="large"
            />

            {/* Share Button - larger */}
            <div className="flex flex-col items-center relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-muted hover:bg-foreground/20 h-14 w-14"
                onClick={() => onShare(post.id.toString())}
              >
                <ShareIcon className="h-8 w-8" />
              </Button>
              {isCopySuccess && (
                <span className="absolute text-sm text-foreground mt-1 left-full ml-2 whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Post content - expandable */}
      {isFeedLayout && post.content && (
        <div className="mt-3 w-full" style={{ maxWidth: 'calc(100vw - 300px)', width: '60vw' }}>
          <p className={`whitespace-pre-wrap text-muted-foreground ${!isDescriptionExpanded && needsTruncation ? 'line-clamp-3' : ''}`}>
          {post.content}
        </p>
          {needsTruncation && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-foreground text-sm mt-1 hover:underline"
            >
              {isDescriptionExpanded ? 'less' : 'more'}
            </button>
          )}
        </div>
      )}

      {!isFeedLayout && (
        <h2 className="text-2xl font-bold mt-4 mb-2">{post.title}</h2>
      )}

      {showSeparator && <hr className="w-full border-t border-input mt-8 mb-6" style={{ maxWidth: 'calc(100vw - 300px)', width: '60vw' }} />}
    </div>
  );
});

PostItem.displayName = 'PostItem';

export default PostItem;
