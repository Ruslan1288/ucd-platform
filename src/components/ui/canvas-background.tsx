import React from 'react';

export function CanvasBackground() {
  return (
    <div className="absolute inset-0 w-full h-full bg-white">
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15]"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="#94a3b8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
