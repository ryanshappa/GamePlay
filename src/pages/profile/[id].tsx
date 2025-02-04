import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useUser } from '@clerk/nextjs';
import { Post } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button, Portal } from '@chakra-ui/react';
import Link from 'next/link';
import { EditProfileDialog } from '~/components/editProfileDialog';
import { MoreHorizontal } from 'lucide-react'; 
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import UserProfile from '../../components/UserProfile';

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
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

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
      fetch(`/api/isFollowing?userId=${id}`)
        .then((res) => res.json())
        .then((data) => setIsFollowing(data.isFollowing))
        .catch((err) => console.error(err));
    }
  }, [userId, id]);

  useEffect(() => {
    if (activeTab === 'saved' && userId) {
      fetch(`/api/getUserSavedPosts`)
        .then((res) => res.json())
        .then((data) => setSavedPosts(data.map((item: any) => item.post)))
        .catch((err) => console.error(err));
    }
  }, [activeTab, userId]);

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
      setUser((prevUser) => {
        if (!prevUser) return prevUser;
        return {
          ...prevUser,
          followersCount: isFollowing
            ? prevUser.followersCount - 1
            : prevUser.followersCount + 1,
        };
      });
    } else {
      console.error('Failed to update follow status');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!postId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUser((prevUser) => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            posts: prevUser.posts.filter((post) => post.id !== postId),
          };
        });
        alert('Post deleted successfully.');
      } else {
        const data = await response.json();
        alert(`Failed to delete post: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/getUserProfile?id=${user?.id}`);
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      {/* Profile Info */}
      <section className="p-8">
        <div className="flex items-center space-x-6">
          <Avatar className="h-32 w-32">
            <AvatarImage src={user.avatarUrl} alt="Profile" />
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
          {userId === id && (
            <Button
              className="bg-green-600 text-white px-4 py-2 rounded-full"
              onClick={() => setEditProfileOpen(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </section>

      {/* Edit Profile Dialog */}
      <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />

      {/* Tab Row */}
      <div className="flex justify-center space-x-8 border-b border-gray-700 mb-2">
        <button
          className={`py-2 ${activeTab === 'posts'
            ? 'font-bold border-b-2 border-white'
            : 'text-gray-500'}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        {userId === id && (
          <button
            className={`py-2 ${activeTab === 'saved'
              ? 'font-bold border-b-2 border-white'
              : 'text-gray-500'}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved
          </button>
        )}
      </div>

      {/* Posts or Saved Section */}
      <section className="px-8">
        {activeTab === 'posts' && (
          <>
            <h2 className="text-xl font-bold mb-4">Posts</h2>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {user.posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.posts.map((post) => (
                    <div key={post.id} className="relative">
                      <Link href={`/post/${post.id}`}>
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
                      {userId === id && (
                        <div className="absolute top-2 right-2">
                          <Menu>
                            <MenuButton
                              as={Button}
                              variant="ghost"
                              size="sm"
                              className="p-1 rounded-full hover:bg-gray-700"
                            >
                              <MoreHorizontal className="h-6 w-6" />
                            </MenuButton>
                            <Portal>
                              <MenuList className="bg-gray-800 text-white z-50">
                                <MenuItem
                                  onClick={() => handleDeletePost(post.id)}
                                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                                </MenuItem>
                              </MenuList>
                            </Portal>
                          </Menu>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No posts yet.</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'saved' && (
          <>
            <h2 className="text-xl font-bold mb-4">Saved Posts</h2>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {savedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedPosts.map((post) => (
                    <div key={post.id} className="relative">
                      <Link href={`/post/${post.id}`}>
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No saved posts yet.</p>
              )}
            </div>
          </>
        )}
      </section>

    </div>
  );
}
