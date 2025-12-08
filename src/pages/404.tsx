import React from 'react';

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">But here’s something to keep you entertained.</p>

      <div className="relative w-full max-w-xl h-[600px] border border-border rounded overflow-hidden">
        <iframe
          src="https://chromedino.com/"
          frameBorder="0"
          scrolling="no"
          width="100%"
          height="100%"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
