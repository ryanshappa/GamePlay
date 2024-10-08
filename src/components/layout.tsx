import React, { useState } from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Home, Plus, Search, User as UserIcon, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SignInDialog } from './signInDialog';
import { SignUpDialog } from './signUpDialog';

interface LayoutProps {
  children: React.ReactNode;
  showSearchBar?: boolean; 
}

export default function Layout({ children, showSearchBar = true }: LayoutProps) {
  const { user, isSignedIn } = useUser();
  const [dialogOpen, setDialogOpen] = useState<'signIn' | 'signUp' | null>(null);

  const openSignInDialog = () => setDialogOpen('signIn');
  const openSignUpDialog = () => setDialogOpen('signUp');
  const closeDialog = () => setDialogOpen(null);

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Top Bar */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 w-full">
        <div className="text-2xl font-bold">GamePlay</div>
        {showSearchBar && (
          <div className="flex-1 flex justify-center">
            <div className="relative w-1/2">
              <Input
                type="search"
                placeholder="Search"
                className="w-full bg-gray-800 px-4 py-2 rounded-full pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        )}
        <div className="flex items-center">
          {isSignedIn ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" className="p-0">
                  <Avatar>
                    <AvatarImage
                      src={
                        typeof user.publicMetadata?.avatarUrl === 'string'
                          ? (user.publicMetadata.avatarUrl as string)
                          : '/default-avatar.png'
                      }
                      alt="User avatar"
                    />
                    <AvatarFallback>{user.firstName?.charAt(0) || 'U'}</AvatarFallback>
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
            <Button variant="ghost" onClick={openSignInDialog}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 p-4 flex flex-col">
          <nav className="mt-6">
            <Link href="/">
              <div className="flex items-center space-x-6 cursor-pointer hover:text-gray-400 transition-colors duration-200 mb-8">
                <Home className="h-8 w-8" />
                <span className="text-lg">Home</span>
              </div>
            </Link>
            <div
              className="flex items-center space-x-6 cursor-pointer hover:text-gray-400 transition-colors duration-200 mb-8"
              onClick={() => {
                if (isSignedIn) {
                  window.location.href = '/create-post';
                } else {
                  openSignInDialog();
                }
              }}
            >
              <Plus className="h-8 w-8" />
              <span className="text-lg">Create</span>
            </div>
            {user && (
              <div
                className="flex items-center space-x-6 cursor-pointer hover:text-gray-400 transition-colors duration-200 mb-8"
                onClick={() => {
                  if (isSignedIn) {
                    window.location.href = `/profile/${user.id}`;
                  } else {
                    openSignInDialog();
                  }
                }}
              >
                <UserIcon className="h-8 w-8" />
                <span className="text-lg">Profile</span>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Sign-In and Sign-Up Dialogs */}
      {dialogOpen === 'signIn' && (
        <SignInDialog
          open={true}
          onOpenChange={closeDialog}
          onSwitchToSignUp={openSignUpDialog}
        />
      )}
      {dialogOpen === 'signUp' && (
        <SignUpDialog
          open={true}
          onOpenChange={closeDialog}
          onSwitchToSignIn={openSignInDialog}
        />
      )}
    </div>
  );
}