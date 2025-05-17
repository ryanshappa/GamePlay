// src/components/PortraitFeed.tsx
import React, { useState, useEffect } from "react";
import { PostWithAuthor } from "~/types/types";
import { MobilePostItem } from "./MobilePostItem";
import {
  Home,
  User,
  Search,
  ChevronUp,
  ChevronDown,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
} from "lucide-react";
import { useAuth } from "~/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Link from "next/link";

interface PortraitFeedProps {
  posts: PostWithAuthor[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  onCommentClick: (post: PostWithAuthor) => void;
  onShare: (postId: string) => void;
}

export function PortraitFeed({
  posts,
  currentIndex,
  setCurrentIndex,
  onCommentClick,
  onShare,
}: PortraitFeedProps) {
  const { user } = useAuth();

  // Local like/save/comment state
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  const isEmpty = posts.length === 0;
  const post = !isEmpty ? posts[currentIndex] : null;

  useEffect(() => {
    if (!post) return;
    setLikesCount(post.likesCount);
    setHasLiked(post.likedByCurrentUser);
    setSaved(post.savedByCurrentUser ?? false);
    setCommentsCount(post.commentsCount);

    if (user) {
      Promise.all([
        fetch(`/api/posts/${post.id}/isLiked`).then((r) => r.json()),
        fetch(`/api/posts/${post.id}/isSaved`).then((r) => r.json()),
      ])
        .then(([{ liked }, { saved }]) => {
          setHasLiked(liked);
          setSaved(saved);
        })
        .catch(console.error);
    }
  }, [post?.id, user]);

  const handleLike = async () => {
    if (!user || !post) return;
    const method = hasLiked ? "DELETE" : "POST";
    setHasLiked(!hasLiked);
    setLikesCount((c) => (hasLiked ? c - 1 : c + 1));
    try {
      await fetch(`/api/posts/${post.id}/like`, { method });
    } catch {
      // revert
      setHasLiked(hasLiked);
      setLikesCount((c) => (hasLiked ? c + 1 : c - 1));
    }
  };

  const handleSave = async () => {
    if (!user || !post) return;
    const method = saved ? "DELETE" : "POST";
    setSaved(!saved);
    try {
      await fetch(`/api/posts/${post.id}/save`, { method });
    } catch {
      setSaved(saved);
    }
  };

  return (
    <div className="flex h-full w-full bg-black text-white">
      {/* ── Left Sidebar ── */}
      <aside className="flex flex-col items-center w-16 bg-black pt-4 pb-4">
        <div className="mt-4 flex flex-col items-center space-y-4">
          {/* Larger Logo */}
          <img
            src="/gp-logo-svg.svg"
            alt="GamePlay logo"
            className="w-14 h-14"
          />
          {/* Nav Buttons */}
          <Link href="/" className="p-1 hover:bg-gray-800 rounded">
            <Home className="w-6 h-6" />
          </Link>
          {user ? (
            <Link
              href={`/profile/${user.id}`}
              className="p-1 hover:bg-gray-800 rounded"
            >
              <User className="w-6 h-6" />
            </Link>
          ) : (
            <Link href="/sign-in" className="p-1 hover:bg-gray-800 rounded">
              <User className="w-6 h-6" />
            </Link>
          )}
          <Link href="/search" className="p-1 hover:bg-gray-800 rounded">
            <Search className="w-6 h-6" />
          </Link>
        </div>

        {/* Up/Down arrows stacked at bottom */}
        <div className="mt-auto mb-4 flex flex-col space-y-2">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="p-1 hover:bg-gray-800 rounded disabled:opacity-50"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(posts.length - 1, currentIndex + 1))}
            disabled={currentIndex === posts.length - 1}
            className="p-1 hover:bg-gray-800 rounded disabled:opacity-50"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* ── Center: Game ── */}
      <main className="flex-1 relative pb-[env(safe-area-inset-bottom,0px)]">
        {isEmpty ? (
          <div className="flex h-full w-full items-center justify-center">
            No posts available
          </div>
        ) : (
          <>
            <MobilePostItem
              post={post!}
              onCommentClick={() => onCommentClick(post!)}
              onShare={() => onShare(post!.id)}
            />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-sm">
              {post!.title}
            </div>
          </>
        )}
      </main>

      {/* ── Right Sidebar ── */}
      <aside className="flex flex-col items-center w-16 bg-black pt-10 space-y-6 pb-4">
        {post && (
          <>
            {/* Avatar */}
            <Link
              href={`/profile/${post.author.id}`}
              className="hover:opacity-80"
            >
              <Avatar className="h-8 w-8">
                {post.author.avatarUrl ? (
                  <AvatarImage
                    src={post.author.avatarUrl}
                    alt={post.author.username}
                  />
                ) : (
                  <AvatarFallback>
                    {post.author.username?.[0] ?? "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>

            {/* Like */}
            <button onClick={handleLike} className="flex flex-col items-center">
              <Heart
                className={`w-6 h-6 ${
                  hasLiked ? "text-red-500 fill-red-500" : "text-white"
                }`}
              />
              <span className="text-xs">{likesCount}</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => post && onCommentClick(post)}
              className="flex flex-col items-center"
            >
              <MessageCircle className="w-6 h-6 text-white" />
              <span className="text-xs">{commentsCount}</span>
            </button>

            {/* Save */}
            <button onClick={handleSave} className="flex flex-col items-center">
              <Bookmark
                className={`w-6 h-6 ${
                  saved ? "text-yellow-400 fill-yellow-400" : "text-white"
                }`}
              />
            </button>

            {/* Share */}
            <button
              onClick={() => post && onShare(post.id)}
              className="flex flex-col items-center"
            >
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
