// layout.tsx
import React, { useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { User as UserIcon, Settings, LogOut, Home, Plus } from 'lucide-react';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SearchBar } from '~/components/searchBar';
import { FaInstagram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';
import { SignInModal } from '~/components/signInModal';
import { SignUpModal } from '~/components/signUpModal';

interface LayoutProps {
  children: React.ReactNode;
  showSearchBar?: boolean;
}

export default function Layout({ children, showSearchBar = true }: LayoutProps) {
  const { user, isSignedIn } = useUser();

  // Two local states for controlling the modals
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  return (
    <div className="bg-black text-white w-screen min-h-screen">
      {/* --- FIXED TOP BAR --- */}
      <header className="
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-between
        h-16 px-4
        border-b border-gray-800
        bg-black
      ">
        <div className="text-2xl font-bold font-press-start">GamePlay</div>

        {showSearchBar && (
          <div className="flex-grow flex justify-center mr-12">
            <SearchBar />
          </div>
        )}

        <div className="flex items-center">
          {isSignedIn ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" className="p-0">
                  <Avatar>
                    <AvatarImage
                      src={user.imageUrl || undefined}
                      alt="User avatar"
                    />
                    <AvatarFallback>
                      {user.firstName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="bg-gray-800 text-white rounded shadow-md p-2">
                <DropdownMenu.Item className="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer">
                  <UserIcon className="h-5 w-5" />
                  <Link href={`/profile/${user.id}`}>Profile</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer">
                  <Settings className="h-5 w-5" />
                  <Link href="/settings">Settings</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer">
                  <LogOut className="h-5 w-5" />
                  <SignOutButton>Logout</SignOutButton>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setSignInOpen(true)}>
                Sign In
              </Button>
            </>
          )}
        </div>
      </header>

      {/* --- FIXED SIDEBAR --- */}
      <aside className="
        fixed top-16 bottom-0 left-0
        w-52 p-4
        bg-black
        flex flex-col
      ">
        <nav className="mt-6 space-y-8">
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer hover:text-gray-400">
              <Home className="h-8 w-8" />
              <span className="text-lg">Home</span>
            </div>
          </Link>

          <div
            className="flex items-center space-x-4 cursor-pointer hover:text-gray-400"
            onClick={() => {
              // If user is signed in, go to create-post
              if (isSignedIn) {
                window.location.href = '/create-post';
              } else {
                setSignInOpen(true);
              }
            }}
          >
            <Plus className="h-8 w-8" />
            <span className="text-lg">Create</span>
          </div>

          {user && (
            <div
              className="flex items-center space-x-4 cursor-pointer hover:text-gray-400"
              onClick={() => {
                if (isSignedIn) {
                  window.location.href = `/profile/${user.id}`;
                } else {
                  setSignInOpen(true);
                }
              }}
            >
              <UserIcon className="h-8 w-8" />
              <span className="text-lg">Profile</span>
            </div>
          )}
        </nav>

        {/* Social icons pinned at the bottom of the sidebar */}
        <div className="mt-auto flex space-x-4">
          <Link
            href="https://x.com/TryGamePlay_"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <FaXTwitter className="h-8 w-8 hover:text-blue-400" />
          </Link>
          <Link
            href="https://www.tiktok.com/@trygameplay?lang=en"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <SiTiktok className="h-8 w-8 hover:text-red-500" />
          </Link>
          <Link
            href="https://www.instagram.com/trygameplay/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram className="h-8 w-8 hover:text-pink-400" />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="ml-52 pt-16 h-screen overflow-y-auto">
        {children}
      </main>

      {/* Clerk's SignIn & SignUp modals */}
      <SignInModal
        open={signInOpen}
        onOpenChange={setSignInOpen}
      />
      <SignUpModal
        open={signUpOpen}
        onOpenChange={setSignUpOpen}
      />
    </div>
  );
}
