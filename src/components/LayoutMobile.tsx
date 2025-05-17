"use client";
import React, { ReactNode, useEffect } from "react";

interface LayoutMobileProps {
  children: ReactNode;
}

export function LayoutMobile({ children }: LayoutMobileProps) {
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    window.addEventListener("resize", setVh);
    setVh();
    return () => window.removeEventListener("resize", setVh);
  }, []);

  // On mobile (lg:hidden) we simply fill the screen with whatever children the page provides.
  return (
    <div
      className="lg:hidden w-screen bg-black text-white overflow-hidden"
      style={{ height: "calc(var(--vh, 1vh) * 100)" }}
    >
      {children}
    </div>
  );
} 