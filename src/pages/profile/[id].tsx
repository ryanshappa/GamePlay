import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useUser } from '@clerk/nextjs';
import { db } from '~/server/db';
import { Post, User } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Home, Plus, Search, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  username: string;
  bio: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  posts: Post[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { userId } = useAuth();
  const { user: currentUser } = useUser();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/getUserProfile?userId=${id}`)
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  useEffect(() => {
    if (userId && id && userId !== id) {
      // Check if current user is following this user
      fetch(`/api/isFollowing?userId=${id}`)
        .then((res) => res.json())
        .then((data) => setIsFollowing(data.isFollowing))
        .catch((err) => console.error(err));
    }
  }, [userId, id]);

  const handleFollowToggle = async () => {
    const endpoint = isFollowing ? '/api/unfollowUser' : '/api/followUser';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ followingId: id }),
    });

    if (response.ok) {
      setIsFollowing(!isFollowing);
    } else {
      console.error('Failed to update follow status');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      {/* Profile Info */}
      <section className="p-8">
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatarUrl || '/default-avatar.png'} alt="Profile" />
            <AvatarFallback>{user.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">@{user.username}</h1>
            <div className="mt-2 flex space-x-4">
              <span>
                <strong>{user.followersCount}</strong> Followers
              </span>
              <span>
                <strong>{user.followingCount}</strong> Following
              </span>
              <span>
                <strong>{user.likesCount}</strong> Likes
              </span>
            </div>
            <p className="mt-2">{user.bio}</p>
          </div>
        </div>
        <div className="mt-6">
          {userId !== id && (
            <Button
              className="bg-blue-600 text-white px-4 py-2 rounded-full"
              onClick={handleFollowToggle}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      </section>

      {/* Posts Section */}
      <section className="px-8">
        <h2 className="text-xl font-bold mb-4">Posts</h2>
        <hr className="border-gray-800 mb-6" />
        {user.posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative cursor-pointer">
                  <iframe
                    src={post.fileUrl || '/default-file-url'}
                    title={post.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                  <div className="absolute bottom-0 left-0 p-2 bg-black bg-opacity-50 w-full">
                    <p className="text-sm">{post.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No posts yet.</p>
        )}
      </section>
    </div>
  );
}
