import React, { ReactNode } from 'react';
import Layout from './layout';

interface LayoutDesktopProps {
  children: ReactNode;
}

export function LayoutDesktop({ children }: LayoutDesktopProps) {
  return (
    <div className="hidden lg:block">
      <Layout>{children}</Layout>
    </div>
  );
} 