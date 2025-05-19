// ArrowOverlay.js
import React from 'react';
import { createPortal } from 'react-dom';


const ArrowOverlay = ({ visible }) => {
  if (!visible) return null;

  return createPortal(
    <img
      src="/icons/image.png"
      alt="설치 안내 화살표"
      width="150"
      style={{
        position: 'fixed',
        top: '-30px',
        right: '10px',
        zIndex: 2147483647,
        pointerEvents: 'none',
      }}
    />,
    document.body
  );
};

export default ArrowOverlay;
