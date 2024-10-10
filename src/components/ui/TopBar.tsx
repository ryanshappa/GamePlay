"use client";

import { useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '~/components/ui/dropdown-menu';
import Link from 'next/link';
import { Button } from '~/components/ui/button'; // Add this import

export default function TopBar() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-black text-white">
      <div className="text-xl font-bold">GamePlay</div>
      {/* Include search bar here if needed */}
      <div className="flex items-center">
        {isSignedIn && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <Avatar>
                <AvatarImage src={(user as any).avatarUrl} alt="User avatar" />
                  <AvatarFallback>{user.firstName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user.id}`}>
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => signOut()}>
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


function SignOutButton() {
  const { signOut } = useAuth();

  return <Button onClick={() => signOut()}>Sign Out</Button>;
}
