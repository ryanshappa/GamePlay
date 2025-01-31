import React, { useState } from 'react';
import axios from 'axios';

const UserProfile = ({ initialUser, onUserUpdate }: { initialUser: any, onUserUpdate: (user: any) => void }) => {
  const [user, setUser] = useState(initialUser);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [newUsername, setNewUsername] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.post('/api/updateUserProfile', {
        username,
        bio,
        avatarUrl,
      });

      // Update the local state with the new user data
      setUser(response.data.user);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  async function handleProfileUpdate() {
    try {
      const response = await fetch('/api/updateUserProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername, 
          bio: newBio,
          avatarUrl: newAvatarUrl
        }),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
      }
      const data = await response.json(); 

      // Update local state
      setUser((prev: any) => ({
        ...prev,
        username: data.user.username,
        bio: data.user.bio,
        avatarUrl: data.user.avatarUrl,
      }));

      // Call the parent update function
      onUserUpdate(data.user);

      alert('Profile updated!');
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  }

  return (
    <div>
      <h1>User Profile</h1>
      <input
        type="text"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        placeholder="New Username"
      />
      <input
        type="text"
        value={newBio}
        onChange={(e) => setNewBio(e.target.value)}
        placeholder="New Bio"
      />
      <input
        type="text"
        value={newAvatarUrl}
        onChange={(e) => setNewAvatarUrl(e.target.value)}
        placeholder="New Avatar URL"
      />
      <button onClick={handleProfileUpdate}>Update Profile</button>
    </div>
  );
};

export default UserProfile; 