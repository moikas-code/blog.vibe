import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function strip_html_tags(html: string): string {
  if (!html) return ''
  
  // Remove script and style elements and their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  
  // Replace BR tags with spaces
  text = text.replace(/<br\s*\/?>/gi, ' ')
  
  // Replace paragraph and div tags with spaces
  text = text.replace(/<\/?(p|div)[^>]*>/gi, ' ')
  
  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, '')
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  
  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim()
  
  return text
}