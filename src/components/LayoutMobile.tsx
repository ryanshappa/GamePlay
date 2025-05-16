import React from 'react';

interface LayoutMobileProps {
  children: React.ReactNode;
}

export function LayoutMobile({ children }: LayoutMobileProps) {
  // On mobile (md:hidden) we simply fill the screen with whatever children the page provides.
  return (
    <div className="md:hidden w-screen h-screen bg-black text-white">
      {children}
    </div>
  );
} 