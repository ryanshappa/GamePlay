// layout.tsx
import React, { useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import {
  User as UserIcon,
  Home,
  Plus,
  Search,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { SignInModal } from "~/components/signInModal";
import { SignUpModal } from "~/components/signUpModal";
import { SearchSheet } from "~/components/SearchSheet";
import { UserMenuSheet } from "~/components/UserMenuSheet";
import { useRouter } from "next/router";

interface LayoutProps {
  children: React.ReactNode;
  showSideBar?: boolean;
}

export default function Layout({
  children,
  showSideBar = true,
}: LayoutProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Modal states
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  
  // Sheet states
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [userMenuSheetOpen, setUserMenuSheetOpen] = useState(false);

  // Handle home/logo click - refresh if already on feed, otherwise navigate
  const handleHomeClick = () => {
    if (router.pathname === "/") {
      router.reload();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-background text-foreground">
      {/* --- FIXED SIDEBAR --- */}
      {showSideBar && (
        <aside className="fixed bottom-0 left-0 top-0 z-40 flex w-16 xl:w-52 flex-col bg-background border-r border-input">
          {/* Logo at the top */}
          <div
            className="flex items-center justify-center xl:justify-start p-4 cursor-pointer"
            onClick={handleHomeClick}
          >
            <img
              src="/gp-logo-no-bg.png"
              alt="GamePlay"
              className="h-12 w-12 object-contain"
            />
            <span className="hidden xl:inline ml-2 text-xl font-bold">GamePlay</span>
          </div>

          {/* Search Bar - TikTok style, aligned with other nav items */}
          <div className="hidden xl:block px-4 mb-6">
            <div
              className="flex items-center gap-3 px-3 py-2 bg-muted rounded-full cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => setSearchSheetOpen(true)}
            >
              <Search className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">Search</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-2 xl:mt-0 flex flex-col items-center xl:items-start px-2 xl:px-4">
            {/* Search - icon only on small screens */}
            <div
              className="mb-3 flex xl:hidden w-full cursor-pointer items-center justify-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSearchSheetOpen(true)}
            >
              <Search className="h-6 w-6 flex-shrink-0" />
            </div>

            {/* Home */}
            <div
              className="mb-3 flex w-full cursor-pointer items-center justify-center xl:justify-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={handleHomeClick}
            >
              <Home className="h-6 w-6 flex-shrink-0" />
              <span className="hidden xl:inline text-base">Home</span>
            </div>

            {/* Create */}
            <div
              className="mb-3 flex w-full cursor-pointer items-center justify-center xl:justify-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => {
                if (user) {
                  router.push("/create-post");
                } else {
                  setSignInOpen(true);
                }
              }}
            >
              <Plus className="h-6 w-6 flex-shrink-0" />
              <span className="hidden xl:inline text-base">Create</span>
            </div>

            {/* Profile (only if logged in) */}
            {user && (
              <Link href={`/profile/${user.id}`} className="w-full">
                <div className="mb-3 flex w-full cursor-pointer items-center justify-center xl:justify-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <UserIcon className="h-6 w-6 flex-shrink-0" />
                  <span className="hidden xl:inline text-base">Profile</span>
                </div>
              </Link>
            )}

            {/* Sign In (only if logged out) */}
            {!user && (
              <div
                className="mb-3 flex w-full cursor-pointer items-center justify-center xl:justify-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setSignInOpen(true)}
              >
                <UserIcon className="h-6 w-6 flex-shrink-0" />
                <span className="hidden xl:inline text-base">Sign In</span>
              </div>
            )}
          </nav>

          {/* More button at the bottom */}
          <div className="mt-auto px-2 xl:px-4 pb-6">
            <div
              className="flex w-full cursor-pointer items-center justify-center xl:justify-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setUserMenuSheetOpen(true)}
            >
              <MoreHorizontal className="h-6 w-6 flex-shrink-0" />
              <span className="hidden xl:inline text-base">More</span>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main
        className={`${showSideBar ? "ml-16 xl:ml-52" : ""} min-h-screen`}
      >
        {children}
      </main>

      {/* Sheets */}
      <SearchSheet
        open={searchSheetOpen}
        onOpenChange={setSearchSheetOpen}
      />
      <UserMenuSheet
        open={userMenuSheetOpen}
        onOpenChange={setUserMenuSheetOpen}
        onSignInClick={() => setSignInOpen(true)}
      />

      {/* Sign In & Sign Up modals */}
      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
      <SignUpModal open={signUpOpen} onOpenChange={setSignUpOpen} />
    </div>
  );
}
