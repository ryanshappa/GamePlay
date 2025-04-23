// src/components/Sidebar.tsx

import Link from 'next/link';
import { Home, Plus, User as UserIcon } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-56 p-4 flex flex-col">
      <nav className="space-y-8 mt-8">
        <Link href="/">
          <div className="flex items-center space-x-4 cursor-pointer">
            <Home className="h-8 w-8" />
            <span className="text-lg">Home</span>
          </div>
        </Link>
        <Link href="/create-post">
          <div className="flex items-center space-x-4 cursor-pointer">
            <Plus className="h-8 w-8" />
            <span className="text-lg">Create</span>
          </div>
        </Link>
        {user && (
          <Link href={`/profile/${user.id}`}>
            <div className="flex items-center space-x-4 cursor-pointer">
              <UserIcon className="h-8 w-8" />
              <span className="text-lg">Profile</span>
            </div>
          </Link>
        )}
      </nav>
    </aside>
  );
}
