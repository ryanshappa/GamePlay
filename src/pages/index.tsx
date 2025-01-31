import { GetServerSideProps } from 'next';
import { db } from '~/server/db';
import { PostWithAuthor } from '~/types/types';
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { CommentsDrawer } from '~/components/commentsDrawer';
import PostItem from '~/components/postItem';
import { SignInModal } from '~/components/signInModal';


interface HomePageProps {
  posts: PostWithAuthor[];
}

const VIRTUALIZATION_BUFFER = 1;

export default function HomePage({ posts }: HomePageProps) {
  const { user, isSignedIn } = useUser();
  const [signInOpen, setSignInOpen] = useState(false);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
  const [postList, setPostList] = useState<PostWithAuthor[]>(posts);
  const [isCopySuccess, setIsCopySuccess] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const postRefs = useRef<(HTMLDivElement | null)[]>([]);

  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    postRefs.current[index] = el;
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.75, // Post considered "active" when 75% visible
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

    postRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      postRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const handleDeleteComment = (postId: string, commentId: number) => {
    setPostList((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: post.commentsCount - 1 }
          : post
      )
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prevPost) =>
        prevPost
          ? { ...prevPost, commentsCount: prevPost.commentsCount - 1 }
          : prevPost
      );
    }
  };

  const handleAddComment = (postId: string) => {
    setPostList((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post
      )
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prevPost) =>
        prevPost
          ? { ...prevPost, commentsCount: prevPost.commentsCount + 1 }
          : prevPost
      );
    }
  };

  const handleCommentClick = (post: PostWithAuthor) => {
    setSelectedPost(post);
    setCommentsDrawerOpen(true);
  };

  const handleShare = (postId: string) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    setIsCopySuccess(true);
    setTimeout(() => setIsCopySuccess(false), 2000);
  };

  const currentActiveIndex = activeIndex || 0;

  return (
    <div className="w-full h-screen overflow-auto">
      <div>
        {postList.map((post, index) => {
          const inRange = index >= currentActiveIndex - VIRTUALIZATION_BUFFER &&
                          index <= currentActiveIndex + VIRTUALIZATION_BUFFER;

          return (
            <div
              key={post.id}
              ref={(el) => addToRefs(el, index)}
              className="post-item"
              data-index={index}
              style={{
                minHeight: '100vh',
                overflow: 'hidden',
                // Add a smooth fade or placeholder background for out-of-range posts
                background: inRange ? 'transparent' : '#000', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
                // Minimal placeholder to ensure DOM element is present for IntersectionObserver
                <div style={{ color: '#fff', textAlign: 'center' }}>
                  Loading...
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedPost && (
        <CommentsDrawer
          open={commentsDrawerOpen}
          onClose={() => setCommentsDrawerOpen(false)}
          post={selectedPost}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      )}

      {signInOpen && (
        <SignInModal
          open={signInOpen}
          onOpenChange={setSignInOpen}
        />
      )}

      {isCopySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const posts = await db.post.findMany({
    include: {
      author: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serializedPosts: PostWithAuthor[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    fileUrl: post.fileUrl || null,
    status: post.status,
    authorId: post.authorId,
    author: {
      id: post.author.id,
      username: post.author.username || 'Unknown',
      avatarUrl: post.author.avatarUrl || null,
    },
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    likedByCurrentUser: false,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      user: {
        id: comment.user.id,
        username: comment.user.username || 'Unknown',
        avatarUrl: comment.user.avatarUrl || null,
      },
    })),
  }));

  return {
    props: {
      posts: serializedPosts,
    },
  };
};
