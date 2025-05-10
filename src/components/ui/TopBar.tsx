"use client";

import { useState } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import Link from 'next/link';
import { Button } from '~/components/ui/button';

export default function TopBar() {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // First revoke the Clerk session
      await signOut();
      
      // Clear any local storage items related to auth
      localStorage.removeItem('auth-token'); // if you have any
      
      // Clear cookies (if needed)
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Then navigate
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-black text-white">
      <div className="text-xl font-bold">GamePlay</div>
      <div className="flex items-center">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Avatar>
                  <AvatarImage src={user.imageUrl} alt="User avatar" />
                  <AvatarFallback>
                    {user.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user.id}`}>View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              {/* this now revokes the session immediately */}
              <DropdownMenuItem onSelect={handleSignOut}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
