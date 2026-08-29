import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility untuk menggabungkan class Tailwind dengan aman.
 * Menghindari konflik class (mis. 'p-2' dan 'p-4' → hanya 'p-4').
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
