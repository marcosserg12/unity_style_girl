import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number | string): string {
  return new Intl.NumberFormat('pt-BR', {
    style:    'currency',
    currency: 'BRL',
  }).format(Number(value))
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '...'
}
