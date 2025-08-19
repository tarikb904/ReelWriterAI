"use client";

import React from "react";

type LogoProps = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 40, className = "" }: LogoProps) {
  const w = size;
  const h = size;
  const id = "rw-gradient";
  return (
    <div className={`flex items-center ${className}`} style={{ width: w, height: h }}>
      <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(139 92 246)" />
            <stop offset="50%" stopColor="rgb(79 70 229)" />
            <stop offset="100%" stopColor="rgb(34 211 238)" />
          </linearGradient>
          <filter id="f" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feBlend in="SourceGraphic" in2="b" />
          </filter>
        </defs>

        {/* Gradient circle background */}
        <circle cx="32" cy="32" r="28" fill={`url(#${id})`} />

        {/* Play/pen mark: stylized */}
        <g transform="translate(16,14)" filter="none">
          <path d="M10 4c0-1.1.9-2 2-2 0 0 10.5 0 13 0 2.5 0 4 1.5 4 4 0 2.5-8 17-8 17s-2 3-6 3c-3.5 0-5-1-5-4V4z" fill="white" opacity="0.98"/>
          <path d="M30 12 L20 8 L20 16 z" fill="rgba(255,255,255,0.12)"/>
        </g>

        {/* small gloss highlight */}
        <path d="M10 18 C16 12, 28 10, 38 14" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" fill="none" />

      </svg>
      <span className="sr-only">ReelWriterAI</span>
    </div>
  );
}