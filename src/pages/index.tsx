import { GetServerSideProps } from 'next';
import { db } from '~/server/db';
import { PostWithAuthor } from '~/types/types';
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { CommentsDrawer } from '~/components/commentsDrawer';
import { getAuth } from '@clerk/nextjs/server';
import PostItem from '~/components/postItem';
import { SignInDialog } from '~/components/signInDialog';

interface HomePageProps {
  posts: PostWithAuthor[];
}

const VIRTUALIZATION_BUFFER = 1;

export default function HomePage({ posts }: HomePageProps) {
  const { user, isSignedIn } = useUser();
  const [dialogOpen, setDialogOpen] = useState<'signIn' | 'signUp' | null>(null);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
  const [postList, setPostList] = useState<PostWithAuthor[]>(posts);
  const [isCopySuccess, setIsCopySuccess] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const postRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Add refs to postRefs.current array
  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    postRefs.current[index] = el;
  };

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

    postRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      postRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [postList]);

  // Function to handle comment deletion
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

  // Function to handle comment addition
  const handleAddComment = (postId: string) => {
    setPostList((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post
      )
    );

    // Update selectedPost if it's the same post
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prevPost) =>
        prevPost
          ? { ...prevPost, commentsCount: prevPost.commentsCount + 1 }
          : prevPost
      );
    }
  };

  const handleCommentClick = (post: PostWithAuthor) => {
    if (!isSignedIn) {
      setDialogOpen('signIn');
      return;
    }
    setSelectedPost(post);
    setCommentsDrawerOpen(true);
  };

  const handleShare = (postId: string) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    setIsCopySuccess(true);
    setTimeout(() => setIsCopySuccess(false), 2000);
  };

  return (
    <div className="w-full h-screen overflow-auto">
      <div>
        {postList.map((post, index) => {
          const safeActiveIndex = activeIndex ?? 0;
          if (
            index >= safeActiveIndex - VIRTUALIZATION_BUFFER &&
            index <= safeActiveIndex + VIRTUALIZATION_BUFFER
          ) {
            return (
              <div
                key={post.id}
                ref={(el) => addToRefs(el, index)}
                className="post-item"
                data-index={index}
                style={{ minHeight: '100vh', overflow: 'hidden' }}
              >
                <PostItem
                  post={post}
                  isActive={safeActiveIndex === index}
                  onCommentClick={handleCommentClick}
                  onShare={handleShare}
                  isCopySuccess={isCopySuccess}
                  showSeparator={false}
                  layout="feed"
                />
              </div>
            );
          } else {
            return (
              <div
                key={post.id}
                style={{ minHeight: '100vh' }}
              ></div>
            );
          }
        })}
      </div>

      {/* Comments Drawer */}
      {selectedPost && (
        <CommentsDrawer
          open={commentsDrawerOpen}
          onClose={() => setCommentsDrawerOpen(false)}
          post={selectedPost}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      )}

      {/* Sign-In Dialog */}
      {dialogOpen === 'signIn' && (
        <SignInDialog
          open={true}
          onOpenChange={() => setDialogOpen(null)}
          onSwitchToSignUp={() => setDialogOpen('signUp')}
        />
      )}

      {/* Copy Success Notification */}
      {isCopySuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userId } = getAuth(context.req);

  const posts = await db.post.findMany({
    include: {
      author: true,
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      likes: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
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
    likedByCurrentUser: userId ? post.likes.length > 0 : false,
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
