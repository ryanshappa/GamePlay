import React, { useState } from "react";
import { PostWithAuthor } from "~/types/types";
import { MobilePostItem } from "./MobilePostItem";
import { Home, User, Search, ChevronUp, ChevronDown, MessageCircle, Share2 } from "lucide-react";
import { useAuth } from "~/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { SignInModal } from "~/components/signInModal";
import { CommentsDrawer } from "~/components/commentsSheet";
import Link from "next/link";
import { LikeButton } from "~/components/likeButton";
import { SaveButton } from "~/components/saveButton";

interface LandscapeFeedProps {
  posts: PostWithAuthor[];
  onCommentClick: (post: PostWithAuthor) => void;
  onShare: (postId: string) => void;
}

export function LandscapeFeed({ posts, onCommentClick, onShare }: LandscapeFeedProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSignIn, setShowSignIn] = useState(false);
  
  // Add a guard clause at the beginning to handle empty posts array
  if (posts.length === 0) {
    return <div className="flex h-full w-full justify-center items-center text-white">No posts available</div>;
  }
  
  const post = posts[currentIndex];
  const savePost = post ?? posts[0]; 

  // Auth-gate helper
  const requireAuth = (fn: () => void) => {
    if (!user) {
      setShowSignIn(true);
    } else {
      fn();
    }
  };

  return (
    <>
      <div className="flex h-full w-full">
        {/* Left Sidebar */}
        <aside 
          className="flex flex-col justify-between items-center w-16 bg-black py-4"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Logo placeholder - replace with your actual logo */}
          <img src="/gp-logo-svg.svg" alt="GamePlay logo" className="w-14 h-14 mb-6" />

          <Link href="/" className="p-2 mb-4 hover:bg-black rounded">
            <Home className="w-6 h-6 text-white" />
          </Link>

          {user && (
            <Link href={`/profile/${user.id}`} className="p-2 mb-4 hover:bg-black rounded">
              <User className="w-6 h-6 text-white" />
            </Link>
          )}

          {!user && (
            <button 
              onClick={() => setShowSignIn(true)} 
              className="p-2 mb-4 hover:bg-black rounded"
            >
              <User className="w-6 h-6 text-white" />
            </button>
          )}

          <Link href="/search" className="p-2 mb-4 hover:bg-black rounded">
            <Search className="w-6 h-6 text-white" />
          </Link>

          <div className="mt-auto mb-2 flex flex-col space-y-2">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="p-2 hover:bg-black rounded disabled:opacity-50"
            >
              <ChevronUp className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setCurrentIndex(i => Math.min(posts.length - 1, i + 1))}
              disabled={currentIndex === posts.length - 1}
              className="p-2 hover:bg-black rounded disabled:opacity-50"
            >
              <ChevronDown className="w-6 h-6 text-white" />
            </button>
          </div>
        </aside>

        {/* Center: Game iframe */}
        <main className="flex-1 relative bg-black"> 
          <MobilePostItem 
            post={savePost} 
            onCommentClick={() => {
              if (savePost) {
                onCommentClick(savePost);
              } else if (posts.length > 0) {
                onCommentClick(posts[0] as PostWithAuthor);
              }
            }} 
            onShare={() => {
              if (savePost?.id) {
                onShare(savePost.id);
              } else if (posts.length > 0) {
                onShare(posts[0]?.id ?? "");
              }
            }} 
          />

          {/* Game title overlay */}
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-sm text-white">
            {savePost?.title}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside 
          className="flex flex-col items-center w-16 bg-black py-4"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Author avatar */}
          <Link href={`/profile/${savePost?.author.id}`} className="p-1 hover:bg-black rounded-full mb-8">
            <Avatar className="h-8 w-8">
              {savePost?.author.avatarUrl ? (
                <AvatarImage src={savePost?.author.avatarUrl} alt={savePost?.author.username} />
              ) : (
                <AvatarFallback>{savePost?.author.username?.[0] ?? "U"}</AvatarFallback>
              )}
            </Avatar>
          </Link>

          {/* Like - Replace with LikeButton component */}
          <LikeButton
            postId={savePost?.id || ""}
            initialLiked={savePost?.likedByCurrentUser || false}
            initialCount={savePost?.likesCount || 0}
          />

          {/* Comment */}
          <button
            onClick={() => {
              if (savePost) {
                onCommentClick(savePost);
              } else if (posts.length > 0) {
                onCommentClick(posts[0] as PostWithAuthor);
              }
            }}
            className="flex flex-col items-center space-y-1 hover:bg-black p-1 rounded mb-8"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="text-xs text-white">{savePost?.commentsCount}</span>
          </button>

          {/* Save - Replace with SaveButton component */}
          <SaveButton
            postId={savePost?.id || ""}
            initialSaved={savePost?.savedByCurrentUser || false}
          />

          {/* Share */}
          <button
            onClick={() => {
              if (savePost?.id) {
                onShare(savePost.id);
              } else if (posts.length > 0) {
                onShare(posts[0]?.id ?? "");
              }
            }}
            className="p-1 hover:bg-black rounded"
          >
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </aside>
      </div>

      {/* Modals */}
      {showSignIn && <SignInModal open={showSignIn} onOpenChange={setShowSignIn} />}
    </>
  );
}