import React from 'react'

interface BeaverLogoProps {
  size?: number
  className?: string
}

export function BeaverLogo({ size = 32, className = '' }: BeaverLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Beaver body */}
      <ellipse cx="16" cy="18" rx="10" ry="8" fill="#8B4513" />
      
      {/* Beaver head */}
      <circle cx="16" cy="12" r="6" fill="#A0522D" />
      
      {/* Ears */}
      <ellipse cx="12" cy="9" rx="2" ry="3" fill="#8B4513" />
      <ellipse cx="20" cy="9" rx="2" ry="3" fill="#8B4513" />
      
      {/* Eyes */}
      <circle cx="14" cy="11" r="1" fill="#000" />
      <circle cx="18" cy="11" r="1" fill="#000" />
      
      {/* Nose */}
      <ellipse cx="16" cy="13" rx="1" ry="0.5" fill="#000" />
      
      {/* Teeth */}
      <rect x="15" y="13.5" width="2" height="1" fill="#FFD700" />
      
      {/* Tail */}
      <ellipse cx="26" cy="18" rx="4" ry="2" fill="#8B4513" />
      
      {/* Paws */}
      <ellipse cx="12" cy="24" rx="1.5" ry="2" fill="#A0522D" />
      <ellipse cx="20" cy="24" rx="1.5" ry="2" fill="#A0522D" />
      
      {/* Wood chip */}
      <rect x="22" y="14" width="3" height="2" fill="#8B4513" stroke="#654321" strokeWidth="0.5" />
    </svg>
  )
} 