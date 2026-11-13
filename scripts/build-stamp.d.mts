import type { Plugin } from 'vite'
export interface BuildStamp { buildId: string; builtAt: string; sourceCommit: string | null; sourceDirty: boolean; platform: 'web' | 'native' }
export function createBuildStamp(options?: { native?: boolean; now?: Date; commit?: string; dirty?: boolean }): BuildStamp
export function readBuildStamp(native?: boolean): BuildStamp
export function buildStampPlugin(stamp: BuildStamp): Plugin
