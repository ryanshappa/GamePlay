import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth, useUser } from '@clerk/nextjs';
import { Post, User } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import Link from 'next/link';
import { EditProfileDialog } from '~/components/editProfileDialog';
import { MoreHorizontal } from 'lucide-react'; 
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';

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
  const [isDeleting, setIsDeleting] = useState(false); // **State for Deletion Loading**
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const handleDeleteClick = (postId: number) => {
    setSelectedPostId(postId);
    onOpen();
  };

  const handleDeletePost = async (postId: number | null) => {
    if (!postId) return;

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
        alert(`Failed to delete post: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post. Please try again.');
    } finally {
      onClose();
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      {/* Profile Info */}
      <section className="p-8">
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
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

      {/* Posts Section */}
      <section className="px-8">
        <h2 className="text-xl font-bold mb-4">Posts</h2>
        <hr className="border-gray-800 mb-6" />
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
                      <MenuButton className="p-1 rounded-full hover:bg-gray-700">
                        <MoreHorizontal className="h-6 w-6" />
                      </MenuButton>
                      <MenuList className="bg-gray-800 text-white">
                        <MenuItem
                          onClick={() => handleDeletePost(post.id)} 
                          className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete Post'}
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No posts yet.</p>
        )}
      </section>

      {/* Delete Post Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Post</ModalHeader>
          <ModalBody>
            Are you sure you want to delete this post? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleDeletePost.bind(null, selectedPostId)}>Delete</Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}