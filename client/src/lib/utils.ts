import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('ETB', 'ETB ')
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-ET', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Addis_Ababa'
  }).format(d)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

const placeholderImages = [
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop'
];

export function getImageUrl(url: string, index: number = 0): string {
  if (!url) return placeholderImages[index % placeholderImages.length]
  if (url.startsWith('http')) return url
  
  // Handle base64 data URIs - these can be very large and cause performance issues
  if (url.startsWith('data:image/')) {
    // Use different placeholder images for variety
    return placeholderImages[index % placeholderImages.length]
  }
  
  return url
}
