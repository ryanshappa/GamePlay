// src/components/UserMenuSheet.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { useClerk } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  Settings,
  LogOut,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';

interface UserMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignInClick: () => void;
}

interface DbUser {
  username: string;
  avatarUrl?: string;
}

export function UserMenuSheet({
  open,
  onOpenChange,
  onSignInClick,
}: UserMenuSheetProps) {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch database user profile to get actual username
  useEffect(() => {
    if (open && user?.id) {
      fetch(`/api/getUserProfile?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setDbUser({ username: data.username, avatarUrl: data.avatarUrl });
        })
        .catch((err) => console.error('Failed to fetch user profile:', err));
    }
  }, [open, user?.id]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onOpenChange(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleClose = () => onOpenChange(false);

  const handleSignIn = () => {
    onOpenChange(false);
    onSignInClick();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] p-6 bg-background">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">More</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {user ? (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-input mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={dbUser?.avatarUrl || user.imageUrl || undefined}
                    alt="User avatar"
                  />
                  <AvatarFallback>
                    {(dbUser?.username || user.username || user.firstName || 'U').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    @{dbUser?.username || user.username || user.firstName || 'User'}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="space-y-1">
                <Link href="/settings" onClick={handleClose}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </div>
                </Link>

                <Link href="/help" onClick={handleClose}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <HelpCircle className="h-5 w-5" />
                    <span>Help</span>
                  </div>
                </Link>

                <div
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={toggleTheme}
                >
                  {mounted && resolvedTheme === 'dark' ? (
                    <>
                      <Sun className="h-5 w-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </div>

                <div
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors text-red-500"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </div>
              </nav>
            </>
          ) : (
            <>
              {/* Logged out state */}
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Sign in to create posts, like, comment, and more.
                </p>

                <Button
                  className="w-full"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>

                <div
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={toggleTheme}
                >
                  {mounted && resolvedTheme === 'dark' ? (
                    <>
                      <Sun className="h-5 w-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </div>

                <Link href="/help" onClick={handleClose}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <HelpCircle className="h-5 w-5" />
                    <span>Help</span>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
