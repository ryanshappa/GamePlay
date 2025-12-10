// layout.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  User as UserIcon,
  Settings,
  LogOut,
  Home,
  Plus,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { SearchBar } from "~/components/searchBar";
import { SignInModal } from "~/components/signInModal";
import { SignUpModal } from "~/components/signUpModal";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";

interface LayoutProps {
  children: React.ReactNode;
  showSearchBar?: boolean;
}

export default function Layout({
  children,
  showSearchBar = true,
}: LayoutProps) {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  
  // Track if component is mounted to avoid hydration mismatch with theme
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Two local states for controlling the modals
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-background text-foreground">
      {/* --- FIXED TOP BAR --- */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center border-b border-input bg-background px-4">
        {/* Logo - left side */}
        <div className="flex-shrink-0">
          <Link href="/">
            <img
              src="/gp-logo-no-bg.png"
              alt="GamePlay"
              className="h-16 w-16 object-contain transform translate-y-[2px]"
            />
          </Link>
        </div>

        {/* Search bar - absolutely centered */}
        {showSearchBar && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <SearchBar />
          </div>
        )}

        {/* Right side - user menu */}
        <div className="ml-auto flex items-center">
          {user ? (
            <>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" className="p-0">
                    <Avatar>
                      <AvatarImage
                        src={user.imageUrl || undefined}
                        alt="User avatar"
                      />
                      <AvatarFallback>
                        {user.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="rounded bg-muted p-2 text-foreground shadow-md">
                  <DropdownMenu.Item className="flex cursor-pointer items-center space-x-3 p-3 hover:bg-muted">
                    <UserIcon className="h-5 w-5" />
                    <Link href={`/profile/${user.id}`}>Profile</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex cursor-pointer items-center space-x-3 p-3 hover:bg-muted">
                    <Settings className="h-5 w-5" />
                    <Link href="/settings">Settings</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center space-x-3 p-3 hover:bg-muted"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex cursor-pointer items-center space-x-3 p-3 hover:bg-muted">
                    <HelpCircle className="h-5 w-5" />
                    <Link href="/help">Help</Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center space-x-3 p-3 hover:bg-muted"
                    onClick={toggleTheme}
                  >
                    {mounted && resolvedTheme === "dark" ? (
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
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="mr-2"
              >
                {mounted && resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button variant="ghost" onClick={() => setSignInOpen(true)}>
                Sign In
              </Button>
            </>
          )}
        </div>
      </header>

      {/* --- FIXED SIDEBAR --- */}
      {showSearchBar ? (
        <aside className="fixed bottom-0 left-0 top-16 flex w-16 xl:w-52 flex-col bg-background p-4">
          <nav className="mt-6 flex flex-col items-center xl:items-start">
            <Link href="/">
              <div className="mb-6 flex cursor-pointer items-center space-x-4 hover:text-gray-400">
                <Home className="h-8 w-8 flex-shrink-0" />
                <span className="hidden xl:inline text-lg">Home</span>
              </div>
            </Link>

            <div
              className="mb-6 flex cursor-pointer items-center space-x-4 hover:text-gray-400"
              onClick={() => {
                // Use Next.js router for navigation
                if (user) {
                  router.push("/create-post");
                } else {
                  setSignInOpen(true);
                }
              }}
            >
              <Plus className="h-8 w-8 flex-shrink-0" />
              <span className="hidden xl:inline text-lg">Create</span>
            </div>

            {user ? (
              <Link href={`/profile/${user.id}`}>
                <div className="mb-6 flex cursor-pointer items-center space-x-4 hover:text-gray-400">
                  <UserIcon className="h-8 w-8 flex-shrink-0" />
                  <span className="hidden xl:inline text-lg">Profile</span>
                </div>
              </Link>
            ) : null}
          </nav>
        </aside>
      ) : null}

      {/* MAIN CONTENT AREA */}
      <main
        className={`${showSearchBar ? "ml-16 xl:ml-52" : "ml-4"} h-screen overflow-y-auto pt-16`}
      >
        {children}
      </main>

      {/* Sign In & Sign Up modals */}
      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
      <SignUpModal open={signUpOpen} onOpenChange={setSignUpOpen} />
    </div>
  );
}
