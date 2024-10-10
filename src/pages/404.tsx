import React from 'react';

const Custom404 = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <iframe
        src="https://chromedino.com/"
        frameBorder="0"
        scrolling="no"
        width="100%"
        height="100%"
        loading="lazy"
        style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 999 }}
      ></iframe>
    </div>
  );
};

export default Custom404;
