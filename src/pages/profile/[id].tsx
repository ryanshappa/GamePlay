import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '~/contexts/AuthContext';
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
import { FollowButton } from '~/components/followButton';

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
  const profileId = typeof id === 'string' ? id : '';

  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  // Fetch user profile once the router is ready and id is defined.
  useEffect(() => {
    if (router.isReady && profileId) {
      fetch(`/api/getUserProfile?userId=${profileId}`)
        .then((res) => res.json())
        .then((data) => setUserProfile(data))
        .catch((err) => console.error(err));
    }
  }, [router.isReady, profileId]);

  // Fetch isFollowing only if viewer is not the profile owner.
  useEffect(() => {
    if (router.isReady && user?.id && profileId && user.id !== profileId) {
      fetch(`/api/isFollowing?userId=${profileId}`)
        .then((res) => res.json())
        .then((data) => setIsFollowing(data.isFollowing))
        .catch((err) => console.error(err));
    }
  }, [router.isReady, user?.id, profileId]);

  // Fetch saved posts if the "saved" tab is active.
  useEffect(() => {
    if (activeTab === 'saved' && user?.id) {
      fetch(`/api/getUserSavedPosts`)
        .then((res) => res.json())
        .then((data) => setSavedPosts(data.map((item: any) => item.post)))
        .catch((err) => console.error(err));
    }
  }, [activeTab, user?.id]);

  const handleDeletePost = async (postId: string) => {
    if (!postId) return;

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUserProfile((prevUser) => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            posts: prevUser.posts.filter((post) => post.id !== postId),
          };
        });
        alert('Post deleted successfully.');
      } else {
        const data = await response.json();
        alert(`Failed to delete post: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // If router isn't ready or profileId is empty, show a loading indicator.
  if (!router.isReady || !profileId) {
    return <div>Loading...</div>;
  }

  // Render your profile page if userProfile is loaded.
  if (!userProfile) return <div>Loading profile...</div>;

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Profile Info */}
      <section className="p-8">
        <div className="flex items-center space-x-6">
          <Avatar className="h-32 w-32">
            <AvatarImage src={userProfile.avatarUrl} alt="Profile" />
            <AvatarFallback>{userProfile.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">@{userProfile.username}</h1>
            <div className="mt-2 flex space-x-4">
              <div>
                <span className="font-bold">{userProfile.posts.length}</span>{' '}
                <span className="text-gray-400">posts</span>
              </div>
              <div>
                <span className="font-bold">{userProfile.followersCount}</span>{' '}
                <span className="text-gray-400">followers</span>
              </div>
              <div>
                <span className="font-bold">{userProfile.followingCount}</span>{' '}
                <span className="text-gray-400">following</span>
              </div>
            </div>
            <p className="mt-2 text-gray-300">{userProfile.bio}</p>
          </div>
        </div>
        <div className="mt-6">
          {user?.id !== profileId && (
            <FollowButton
              profileId={profileId}
              initialIsFollowing={isFollowing}
              onFollowChange={(newState) => {
                setIsFollowing(newState);
                setUserProfile((prevUser) => {
                  if (!prevUser) return prevUser;
                  const newFollowersCount = newState
                    ? prevUser.followersCount + 1
                    : prevUser.followersCount - 1;
                  return { ...prevUser, followersCount: newFollowersCount };
                });
              }}
            />
          )}
          {user?.id === profileId && (
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
        {user?.id === profileId && (
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
        {activeTab === 'posts' ? (
          <>
            <h2 className="text-xl font-bold mb-4">Posts</h2>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {userProfile.posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProfile.posts.map((post) => (
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
                      {user?.id === profileId && (
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
        ) : (
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
