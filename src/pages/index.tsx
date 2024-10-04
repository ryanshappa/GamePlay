import { GetServerSideProps } from 'next';
import { db } from '~/server/db';
import { Post, User } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { ScrollArea } from '~/components/ui/scroll-area';
import { HeartIcon, MessageCircleIcon, ShareIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';

interface PostWithAuthor extends Post {
  author: User;
}

interface HomePageProps {
  posts: PostWithAuthor[];
}

export default function HomePage({ posts }: HomePageProps) {
  return (
    <div>
      {/* Main content of the home page */}
      <ScrollArea className="h-full">
        {posts.map((post) => (
          <div key={post.id} className="flex flex-col items-start p-4 pl-8">
            <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
            <div className="relative flex items-start">
              <div className="w-[800px] h-[450px] bg-gray-800 rounded-md overflow-hidden">
                <iframe
                  src={post.fileUrl || '/default-file-url'}
                  title={post.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
              {/* Interaction buttons and Creator Avatar */}
              <div className="flex flex-col items-center space-y-4 ml-4">
                <Link href={`/profile/${post.author.id}`}>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={post.author.avatarUrl || '/default-avatar.png'} alt="Author Avatar" />
                    <AvatarFallback>{post.author.username?.charAt(0) || 'A'}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-gray-700">
                  <HeartIcon className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-gray-700">
                  <MessageCircleIcon className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-gray-700">
                  <ShareIcon className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Post Content */}
            <p className="mt-4">{post.content}</p>

            {/* View Post Button */}
            <Link href={`/post/${post.id}`} className="text-blue-500 hover:underline mt-2">
              View Post
            </Link>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const posts = await db.post.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Serialize dates
  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: {
      ...post.author,
      createdAt: post.author.createdAt.toISOString(),
      updatedAt: post.author.updatedAt.toISOString(),
    },
  }));

  return {
    props: {
      posts: serializedPosts,
    },
  };
};

