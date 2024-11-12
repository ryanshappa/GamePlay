import { GetServerSideProps } from 'next';
import { db } from '~/server/db';
import { Post, User } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { ScrollArea } from '~/components/ui/scroll-area';
import { HeartIcon, MessageCircleIcon, ShareIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { CommentsDrawer } from '~/components/commentsDrawer';
import { getAuth } from '@clerk/nextjs/server';
import { LikeButton } from '~/components/likeButton';
import DeleteCommentButton from '~/components/deleteComment';

interface PostWithAuthor extends Post {
  author: User;
  likesCount: number; 
  commentsCount: number;
  likedByCurrentUser: boolean; 
}

interface HomePageProps {
  posts: PostWithAuthor[];
}

export default function HomePage({ posts }: HomePageProps) {
  const { user, isSignedIn } = useUser();
  const [dialogOpen, setDialogOpen] = useState<'signIn' | 'signUp' | null>(null);
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
  const [postList, setPostList] = useState(posts);
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  // Function to handle comment deletion
  const handleDeleteComment = (postId: string, commentId: number) => {
    setPostList((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: post.commentsCount - 1 }
          : post
      )
    );
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
  };

  const handleLike = async (postId: string) => {
    if (!isSignedIn) {
      setDialogOpen('signIn');
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });
      if (response.ok) {
        // Optionally update the UI or state here
      } else {
        console.error('Failed to like post.');
      }
    } catch (error) {
      console.error('Error liking post:', error);
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
    <div>
      {/* Main content of the home page */}
      <ScrollArea className="h-full">
        {postList.map((post) => (
          <div key={post.id} className="flex flex-col items-start p-4 pl-8">
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            <div className="relative flex items-start">
              {/* Increased iframe size */}
              <div className="w-[880px] h-[490px] bg-gray-800 rounded-md overflow-hidden">
                <iframe
                  src={post.fileUrl || ''}
                  title={post.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
              {/* Interaction buttons and Creator Avatar */}
              <div className="flex flex-col items-center space-y-4 ml-4 relative">
                <Link href={`/profile/${post.author.id}`}>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={post.author.avatarUrl || ''} alt="Author Avatar" />
                    <AvatarFallback>{post.author.username?.charAt(0) || 'A'}</AvatarFallback>
                  </Avatar>
                </Link>

                {/* Replace the existing like button with LikeButton component */}
                <LikeButton
                  postId={post.id}
                  initialLiked={post.likedByCurrentUser}
                  initialCount={post.likesCount}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-gray-800 hover:bg-gray-700"
                  onClick={() => handleCommentClick(post)}
                >
                  <MessageCircleIcon className="h-6 w-6" />
                </Button>
                <span>{post.commentsCount}</span>

                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-gray-800 hover:bg-gray-700"
                    onClick={() => handleShare(post.id.toString())}
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
            </div>

            {/* Post Content */}
            <p className="mt-4">{post.content}</p>

            {/* View Post Button */}
            <Link href={`/post/${post.id}`} className="text-blue-500 hover:underline mt-2">
              View Post
            </Link>

            {/* Adjusted Separator Line/Bar */}
            <hr className="w-[950px] border-t border-gray-300 mt-12 mb-6" />
          </div>
        ))}
      </ScrollArea>

      {/* Comments Drawer */}
      {selectedPost && (
        <CommentsDrawer
          open={commentsDrawerOpen}
          onClose={() => setCommentsDrawerOpen(false)}
          post={selectedPost}
          onAddComment={handleAddComment} // Pass handler for adding comments
          onDeleteComment={handleDeleteComment} // Pass handler for deleting comments
        />
      )}

      {/* Sign-In and Sign-Up Dialogs */}
      {/* ... existing dialog code ... */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userId } = getAuth(context.req);

  const posts = await db.post.findMany({
    include: {
      author: true,
      likes: userId
        ? {
            where: { userId },
            select: { id: true }, // Select only the necessary fields
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

  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: {
      id: post.author.id,
      username: post.author.username,
      avatarUrl: post.author.avatarUrl,
    },
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    likedByCurrentUser: userId ? post.likes.length > 0 : false,
  }));

  return {
    props: {
      posts: serializedPosts,
    },
  };
};