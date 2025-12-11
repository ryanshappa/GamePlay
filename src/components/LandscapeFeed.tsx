import React, { useState, useEffect } from "react";
import { PostWithAuthor } from "~/types/types";
import { MobilePostItem } from "./MobilePostItem";
import { Home, User, Search, ChevronUp, ChevronDown, Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useAuth } from "~/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { SignInModal } from "~/components/signInModal";
import { CommentsDrawer } from "~/components/commentsSheet";
import Link from "next/link";

interface LandscapeFeedProps {
  posts: PostWithAuthor[];
  onCommentClick: (post: PostWithAuthor) => void;
  onShare: (postId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function LandscapeFeed({ posts, onCommentClick, onShare, onLoadMore, hasMore = false }: LandscapeFeedProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  
  const isEmpty = posts.length === 0;
  
  const post = !isEmpty ? posts[currentIndex] : null;
  const savePost = post;

  useEffect(() => {
    if (!savePost) return;
    
    setLikesCount(savePost?.likesCount ?? 0);
    setHasLiked(savePost?.likedByCurrentUser ?? false);
    setSaved(savePost?.savedByCurrentUser ?? false);
    setCommentsCount(savePost?.commentsCount ?? 0);

    if (user) {
      Promise.all([
        fetch(`/api/posts/${savePost?.id}/isLiked`),
        fetch(`/api/posts/${savePost?.id}/isSaved`),
      ])
        .then(([likeRes, saveRes]) => Promise.all([likeRes.json(), saveRes.json()]))
        .then(([{ liked }, { saved }]) => {
          setHasLiked(liked);
          setSaved(saved);
        })
        .catch(console.error);
    }
  }, [savePost?.id, user]);

  // Trigger load more when approaching the end of the list
  useEffect(() => {
    if (posts.length > 0 && currentIndex >= posts.length - 2 && hasMore && onLoadMore) {
      onLoadMore();
    }
  }, [currentIndex, posts.length, hasMore, onLoadMore]);

  const requireAuth = (fn: () => void) => {
    if (!user) {
      setShowSignIn(true);
    } else {
      fn();
    }
  };

  const handleLike = () => {
    requireAuth(async () => {
      const method = hasLiked ? "DELETE" : "POST";
      setHasLiked(!hasLiked);
      setLikesCount((c) => (hasLiked ? c - 1 : c + 1));
      try {
        await fetch(`/api/posts/${savePost?.id}/like`, { method });
      } catch {
        setHasLiked(hasLiked);
        setLikesCount((c) => (hasLiked ? c + 1 : c - 1));
      }
    });
  };

  const handleSave = () => {
    requireAuth(async () => {
      const method = saved ? "DELETE" : "POST";
      setSaved(!saved);
      try {
        await fetch(`/api/posts/${savePost?.id}/save`, { method });
      } catch {
        setSaved(saved);
      }
    });
  };

  const handleAddComment = async (content: string) => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    if (!content.trim()) return;

    try {
      const resp = await fetch(`/api/posts/${savePost?.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (resp.ok) {
        setCommentsCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Add comment failed", err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const resp = await fetch(
        `/api/posts/${savePost?.id}/comments?commentId=${commentId}`,
        { method: "DELETE" }
      );
      if (resp.ok) {
        setCommentsCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Delete comment failed", err);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 overflow-hidden bg-background h-dvh"
        style={{
          paddingTop: 'env(safe-area-inset-top, 16px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)'
        }}
      >
        <div
          className="h-full w-full grid"
          style={{ gridTemplateColumns: '12vw 1fr 12vw' }}
        >
          <aside
            className="col-start-1 flex flex-col justify-between items-center bg-background pt-2 pb-1"
            style={{ 
              paddingLeft: 'env(safe-area-inset-left, 0)',
              paddingRight: '4px',
              paddingTop: 'env(safe-area-inset-top, 0)',
              paddingBottom: 'env(safe-area-inset-bottom, 8px)'
            }} 
          >
            <div className="flex flex-col items-center">
              <img src="/gp-logo-no-bg.png" alt="GamePlay logo" className="w-12 h-12 mb-2 object-contain" />

              <div className="flex flex-col items-center gap-1">
                <Link href="/" className="p-1.5 hover:bg-muted rounded">
                  <Home className="w-5 h-5 text-foreground" />
                </Link>

                {user ? (
                  <Link href={`/profile/${user.id}`} className="p-1.5 hover:bg-muted rounded">
                    <User className="w-5 h-5 text-foreground" />
                  </Link>
                ) : (
                  <button 
                    onClick={() => setShowSignIn(true)} 
                    className="p-1.5 hover:bg-muted rounded"
                  >
                    <User className="w-5 h-5 text-foreground" />
                  </button>
                )}

                <Link href="/search" className="p-1.5 hover:bg-muted rounded">
                  <Search className="w-5 h-5 text-foreground" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 mb-1">
              <button
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="p-1.5 hover:bg-muted rounded disabled:opacity-50"
              >
                <ChevronUp className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={() => setCurrentIndex(i => Math.min(posts.length - 1, i + 1))}
                disabled={currentIndex === posts.length - 1}
                className="p-1.5 hover:bg-muted rounded disabled:opacity-50"
              >
                <ChevronDown className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </aside>

          <main className="col-start-2 flex items-center justify-center relative">
            {isEmpty ? (
              <div className="flex h-full w-full justify-center items-center text-foreground">
                No posts available
              </div>
            ) : (
              <>
                <div className="h-full w-full flex items-center justify-center">
                  <MobilePostItem 
                    post={savePost ?? posts[0]} 
                    onCommentClick={() => {
                      setShowComments(true);
                    }} 
                    onShare={() => {
                      if (savePost?.id) {
                        onShare(savePost.id);
                      } else if (posts.length > 0) {
                        onShare(posts[0]?.id ?? "");
                      }
                    }} 
                  />
                </div>

                <div className="absolute bottom-4 left-4 bg-background/60 px-3 py-1.5 rounded text-sm text-foreground">
                  {savePost?.title}
                </div>
              </>
            )}
          </main>

          <aside 
            className="col-start-3 flex flex-col justify-center items-center bg-background pt-2 pb-1"
            style={{ 
              paddingRight: 'env(safe-area-inset-right, 0)',
              paddingLeft: '4px',
              paddingTop: 'env(safe-area-inset-top, 0)',
              paddingBottom: 'env(safe-area-inset-bottom, 8px)'
            }}
          >
            <div className="flex flex-col items-center gap-1">
              {savePost && (
                <Link href={`/profile/${savePost?.author.id}`} className="p-1 hover:bg-muted rounded-full">
                  <Avatar className="h-7 w-7">
                    {savePost?.author.avatarUrl ? (
                      <AvatarImage src={savePost?.author.avatarUrl} alt={savePost?.author.username} />
                    ) : (
                      <AvatarFallback>{savePost?.author.username?.[0] ?? "U"}</AvatarFallback>
                    )}
                  </Avatar>
                </Link>
              )}

              <button
                onClick={handleLike}
                className="flex flex-col items-center hover:bg-muted p-1.5 rounded"
              >
                <Heart className={`w-5 h-5 ${hasLiked ? 'text-red-500 fill-red-500' : 'text-foreground'}`} />
                <span className="text-[10px] text-foreground">{likesCount}</span>
              </button>

              <button
                onClick={() => setShowComments(true)}
                className="flex flex-col items-center hover:bg-muted p-1.5 rounded"
              >
                <MessageCircle className="w-5 h-5 text-foreground" />
                <span className="text-[10px] text-foreground">{commentsCount}</span>
              </button>

              <button
                onClick={handleSave}
                className="p-1.5 hover:bg-muted rounded"
              >
                <Bookmark className={`w-5 h-5 ${saved ? 'text-yellow-400 fill-yellow-400' : 'text-foreground'}`} />
              </button>

              <button
                onClick={() => {
                  if (savePost?.id) {
                    onShare(savePost.id);
                  } else if (posts.length > 0) {
                    onShare(posts[0]?.id ?? "");
                  }
                }}
                className="p-1.5 hover:bg-muted rounded"
              >
                <Share2 className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </aside>
        </div>
      </div>

      {showSignIn && <SignInModal open={showSignIn} onOpenChange={setShowSignIn} />}
      {showComments && savePost && (
        <CommentsDrawer
          open={showComments}
          onClose={() => setShowComments(false)}
          post={savePost}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </>
  );
} 