import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '~/contexts/AuthContext';
import { Home, Search, PlusSquare, User } from 'lucide-react';

export const BottomNav = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const handleCreateClick = () => {
    if (!user) {
      // If not logged in, show sign-in modal
      // You could use a global state or context to trigger the modal
      // For now, let's just redirect to sign-in page
      router.push('/signin');
      return;
    }
    
    router.push('/create-post');
  };

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0
        h-14 pb-safe     /* shrink height and add safe-area bottom padding */
        bg-black border-t border-gray-800
        flex justify-around items-center
        z-40
      "
    >
      <Link href="/" passHref>
        <div className="flex flex-col items-center">
          <Home className={`h-6 w-6 ${router.pathname === '/' ? 'text-white' : 'text-gray-500'}`} />
        </div>
      </Link>
      
      <Link href="/search" passHref>
        <div className="flex flex-col items-center">
          <Search className={`h-6 w-6 ${router.pathname === '/search' ? 'text-white' : 'text-gray-500'}`} />
        </div>
      </Link>
      
      <div className="flex flex-col items-center" onClick={handleCreateClick}>
        <PlusSquare className="h-6 w-6 text-gray-500" />
      </div>
      
      <Link href={user ? `/profile/${user.id}` : '/signin'} passHref>
        <div className="flex flex-col items-center">
          <User className={`h-6 w-6 ${router.pathname.startsWith('/profile') ? 'text-white' : 'text-gray-500'}`} />
        </div>
      </Link>
    </div>
  );
};
