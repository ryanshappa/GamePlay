import React from 'react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Home, Plus, Search, User as UserIcon, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface LayoutProps {
  children: React.ReactNode;
  showSearchBar?: boolean; 
}

export default function Layout({ children, showSearchBar = true }: LayoutProps) {
  const { user } = useUser();

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
          {user ? (
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
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
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
            <Link href="/create-post">
              <div className="flex items-center space-x-6 cursor-pointer hover:text-gray-400 transition-colors duration-200 mb-8">
                <Plus className="h-8 w-8" />
                <span className="text-lg">Create</span>
              </div>
            </Link>
            {user && (
              <Link href={`/profile/${user.id}`}>
                <div className="flex items-center space-x-6 cursor-pointer hover:text-gray-400 transition-colors duration-200 mb-8">
                  <UserIcon className="h-8 w-8" />
                  <span className="text-lg">Profile</span>
                </div>
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}