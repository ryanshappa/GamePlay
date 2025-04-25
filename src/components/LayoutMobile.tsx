import React, { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface LayoutMobileProps {
  children: ReactNode;
}

export function LayoutMobile({ children }: LayoutMobileProps) {
  return (
    <div className="md:hidden flex flex-col h-screen bg-black text-white">
      {/* Full-screen content area */}
      <main className="flex-1 overflow-auto relative">
        {children}
      </main>
      
      {/* Bottom navigation is included in the mobile layout */}
      <BottomNav />
    </div>
  );
} 