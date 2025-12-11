import { PostWithAuthor } from '~/types/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { CommentsDrawer } from '~/components/commentsSheet';
import PostItem from '~/components/postItem';
import { SignInModal } from '~/components/signInModal';
import { LandscapeFeed } from '~/components/LandscapeFeed';
import { PortraitFeed } from '~/components/PortraitFeed';
import { api } from '~/utils/api';

const VIRTUALIZATION_BUFFER = 1;

export default function HomePage() {
  const { user } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
  const [isCopySuccess, setIsCopySuccess] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  // detect mobile/tablet by UA
  const [isMobile, setIsMobile] = useState(false);
  //  detect orientation
  const [isLandscape, setIsLandscape] = useState(false);

  // Infinite query for posts - filter to mobile-friendly only on mobile devices
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = api.post.getInfinitePosts.useInfiniteQuery(
    { limit: 5, mobileOnly: isMobile || undefined },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Flatten posts from all pages
  const postList: PostWithAuthor[] = data?.pages.flatMap((page) => page.posts) ?? [];

  useEffect(() => {
    const checkLayout = () => {
      const ua = navigator.userAgent;
      const isIOS =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isIOS || isTouchDevice);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', checkLayout);
    window.addEventListener('orientationchange', checkLayout);
    checkLayout();

    return () => {
      window.removeEventListener('resize', checkLayout);
      window.removeEventListener('orientationchange', checkLayout);
    };
  }, []);

  const postRefs = useRef<(HTMLDivElement | null)[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    postRefs.current[index] = el;
  };

  // Intersection Observer to figure out which post is "active"
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.75,
    };
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      let maxIntersectionRatio = 0;
      let visibleIndex: number | null = null;
      entries.forEach((entry) => {
        const index = Number(entry.target.getAttribute('data-index'));
        if (entry.intersectionRatio > maxIntersectionRatio) {
          maxIntersectionRatio = entry.intersectionRatio;
          visibleIndex = index;
        }
      });
      if (visibleIndex !== null) {
        setActiveIndex(visibleIndex);
      }
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const currentPostRefs = postRefs.current;
    
    currentPostRefs.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => {
      currentPostRefs.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [postList.length]); // Re-run when posts are loaded

  // Intersection Observer for infinite scroll loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleAddCommentOptimistic = useCallback(async (postId: string, content: string) => {
    if (!user) {
      setSignInOpen(true);
      return;
    }
    if (!content.trim()) return;

    try {
      const resp = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!resp.ok) {
        alert('Failed to add comment');
        return;
      }
      // Note: With infinite query, we'd need to invalidate or update the cache
      // For now, the count will update on next fetch
    } catch (error) {
      alert('Unexpected error adding comment');
    }
  }, [user]);


  const handleDeleteCommentOptimistic = useCallback(async (postId: string, commentId: number) => {
    try {
      const resp = await fetch(`/api/posts/${postId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      if (!resp.ok) {
        alert('Failed to delete comment');
        return;
      }
      // Note: With infinite query, we'd need to invalidate or update the cache
    } catch (error) {
      alert('Unexpected error deleting comment');
    }
  }, []);

  const handleCommentClick = useCallback((post: PostWithAuthor) => {
    setSelectedPost(post);
    setCommentsDrawerOpen(true);
  }, []);

  const handleShare = useCallback((postId: string) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    setIsCopySuccess(true);
    setTimeout(() => setIsCopySuccess(false), 2000);
  }, []);

  // Callback for PortraitFeed to load more posts
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-foreground">Loading posts...</div>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        // mobile always: portrait vs landscape
        isLandscape ? (
          <LandscapeFeed
            posts={postList}
            onCommentClick={handleCommentClick}
            onShare={handleShare}
            onLoadMore={handleLoadMore}
            hasMore={hasNextPage ?? false}
          />
        ) : (
          <PortraitFeed
            posts={postList}
            currentIndex={activeIndex}
            setCurrentIndex={setActiveIndex}
            onCommentClick={handleCommentClick}
            onShare={handleShare}
            onLoadMore={handleLoadMore}
            hasMore={hasNextPage ?? false}
          />
        )
      ) : (
        <div className="w-full h-screen overflow-auto">
          <div className="px-4">
            {postList.map((post, index) => {
              const inRange =
                index >= activeIndex - VIRTUALIZATION_BUFFER &&
                index <= activeIndex + VIRTUALIZATION_BUFFER;

              return (
                <div
                  key={post.id}
                  ref={(el) => addToRefs(el, index)}
                  className="post-item"
                  data-index={index}
                  style={{
                    minHeight: 'calc(100vh - 32px)',
                    paddingTop: '32px',
                    overflow: 'hidden',
                    background: inRange ? 'transparent' : 'var(--background)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {inRange ? (
                    <PostItem
                      post={post}
                      isActive={activeIndex === index}
                      onCommentClick={handleCommentClick}
                      onShare={handleShare}
                      isCopySuccess={isCopySuccess}
                      showSeparator={false}
                      layout="feed"
                    />
                  ) : (
                    <div style={{ color: '#fff', textAlign: 'center' }}>
                      Loading...
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Sentinel element for infinite scroll */}
            <div
              ref={loadMoreRef}
              className="flex items-center justify-center py-8"
              style={{ minHeight: '100px' }}
            >
              {isFetchingNextPage ? (
                <div className="text-foreground">Loading more posts...</div>
              ) : hasNextPage ? (
                <div className="text-muted-foreground">Scroll for more</div>
              ) : postList.length > 0 ? (
                <div className="text-muted-foreground">No more posts</div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      
      {/* Modals and notifications - keep these for both layouts */}
      {selectedPost && (
        <CommentsDrawer
          open={commentsDrawerOpen}
          onClose={() => setCommentsDrawerOpen(false)}
          post={selectedPost}
          onAddComment={(content) => handleAddCommentOptimistic(selectedPost.id, content)}
          onDeleteComment={(commentId) =>
            handleDeleteCommentOptimistic(selectedPost.id, commentId)
          }
        />
      )}

      {signInOpen && (
        <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
      )}

      {isCopySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-foreground px-4 py-2 rounded z-50">
          Link copied to clipboard!
        </div>
      )}
    </>
  );
}
