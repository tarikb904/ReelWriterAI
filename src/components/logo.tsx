"use client";

import React from "react";

type LogoProps = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 40, className = "" }: LogoProps) {
  const w = size;
  const h = size;
  const gradId = "rw-grad";
  const shadowId = "rw-shadow";
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: w, height: h }}>
      <svg
        width={w}
        height={h}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Rounded square background */}
        <rect x="6" y="6" width="52" height="52" rx="14" fill={`url(#${gradId})`} filter={`url(#${shadowId})`} />

        {/* Play symbol */}
        <polygon points="27,22 27,42 44,32" fill="white" opacity="0.96" />

        {/* Pen nib (stylized) */}
        <path d="M20 40 L26 34 L30 38 L24 44 Z" fill="rgba(255,255,255,0.9)" />
        <circle cx="26.5" cy="36.5" r="1.2" fill="#6366F1" />

        {/* Shine */}
        <path d="M14 22 C22 14, 42 12, 52 20" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <span className="sr-only">ReelWriterAI</span>
    </div>
  );
}