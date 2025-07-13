import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

export const tailwindColorMap: Record<string, string> = {
  'bg-blue-500': '#3B82F6',
  'bg-green-500': '#22C55E',
  'bg-purple-500': '#A855F7',
  'bg-red-500': '#EF4444',
  'bg-orange-500': '#F97316',
  'bg-cyan-500': '#06B6D4',
  'bg-gray-500': '#6B7280'
}

// Reverse map for hex to class
export const hexToTailwindMap: Record<string, string> = Object.entries(tailwindColorMap).reduce((acc, [className, hex]) => ({
  ...acc,
  [hex.toLowerCase()]: className
}), {})

export const getTailwindColor = (colorClass: string | undefined | null): string => {
  if (!colorClass) return tailwindColorMap['bg-gray-500']
  // If it's a hex color, convert to Tailwind class first
  if (colorClass.startsWith('#')) {
    const tailwindClass = hexToTailwindMap[colorClass.toLowerCase()]
    return tailwindColorMap[tailwindClass] || tailwindColorMap['bg-gray-500']
  }
  return tailwindColorMap[colorClass] || tailwindColorMap['bg-gray-500']
}

export const getTailwindClass = (color: string | undefined | null): string => {
  if (!color) return 'bg-gray-500'
  // If it's a hex color, convert to Tailwind class
  if (color.startsWith('#')) {
    return hexToTailwindMap[color.toLowerCase()] || 'bg-gray-500'
  }
  // If it's already a Tailwind class, return it
  if (color.startsWith('bg-')) {
    return tailwindColorMap[color] ? color : 'bg-gray-500'
  }
  return 'bg-gray-500'
} 