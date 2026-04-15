import { Loader2 } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export function EmptyState({ icon, title, description, actionButton }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full animate-fade-in">
      {icon && (
        <div className="mb-6 p-4 rounded-full bg-zinc-900/50 text-zinc-400 border border-zinc-800">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 max-w-sm mb-6">{description}</p>
      {actionButton}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded-md ${className}`} />
  );
}

export function FullScreenLoader({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-zinc-400">
      <Loader2 className="animate-spin text-[var(--love-rose, #ff4d6d)]" size={32} />
      <p className="font-medium">{message}</p>
    </div>
  );
}
