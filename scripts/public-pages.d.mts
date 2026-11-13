import type { Plugin } from 'vite'
export interface PublicPage {
  path: string
  fileName: string
  language: string
  alternate: string
  title: string
  description: string
  heading: string
  type: string
  body: string
}
export const publicPages: PublicPage[]
export function renderPublicPage(page: PublicPage): string
export function publicPagesPlugin(): Plugin
