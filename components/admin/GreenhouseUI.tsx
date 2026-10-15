'use client';

import { ReactNode, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== Stat Card =====
export function StatCard({ label, value, unit, icon: Icon, color = 'bg-[#3F6B45]', sublabel }: {
  label: string;
  value: string | number;
  unit?: string;
  icon: any;
  color?: string;
  sublabel?: string;
}) {
  return (
    <div className="rounded-xl border border-[#E8F0E5] bg-white p-5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-[#20251F]">
        {value}
        {unit && <span className="mr-1 text-base font-normal text-[#687067]">{unit}</span>}
      </p>
      <p className="text-sm text-[#687067]">{label}</p>
      {sublabel && <p className="mt-1 text-xs text-[#AFC8A8]">{sublabel}</p>}
    </div>
  );
}

// ===== Section Card =====
export function SectionCard({ title, children, action, className }: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl border border-[#E8F0E5] bg-white p-6', className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-[#20251F]">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ===== Badge =====
const BADGE_STYLES: Record<string, string> = {
  green: 'bg-[#E8F0E5] text-[#3F6B45]',
  yellow: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-blue-600',
  gray: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: keyof typeof BADGE_STYLES }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', BADGE_STYLES[color])}>
      {children}
    </span>
  );
}

// ===== Modal =====
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn('relative z-10 w-full rounded-2xl bg-white shadow-2xl', sizes[size])}>
        <div className="flex items-center justify-between border-b border-[#E8F0E5] px-6 py-4">
          <h2 className="text-lg font-bold text-[#20251F]">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-[#687067] hover:bg-[#F7F5EC]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

// ===== Confirm Dialog =====
export function ConfirmDialog({ open, onClose, onConfirm, title, message }: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-[#20251F]">{title}</h2>
        </div>
        <p className="mt-3 text-sm text-[#687067]">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-[#E8F0E5] px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC]">
            انصراف
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Empty State =====
export function EmptyState({ title, message, icon: Icon }: { title: string; message?: string; icon?: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F5EC]">
          <Icon className="h-6 w-6 text-[#AFC8A8]" />
        </div>
      )}
      <p className="text-sm font-medium text-[#20251F]">{title}</p>
      {message && <p className="mt-1 text-xs text-[#687067]">{message}</p>}
    </div>
  );
}

// ===== Loading Skeleton =====
export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-white/60" />
      ))}
    </div>
  );
}

// ===== Form Field =====
export function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#20251F]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

export const inputClass = 'w-full rounded-lg border border-[#E8F0E5] bg-white px-3 py-2 text-sm text-[#20251F] outline-none transition-colors focus:border-[#3F6B45]';

// ===== Page Header =====
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-[#20251F]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#687067]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ===== Status Dot =====
export function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ONLINE: 'bg-green-500',
    OFFLINE: 'bg-gray-400',
    ERROR: 'bg-red-500',
    MAINTENANCE: 'bg-amber-500',
  };
  return (
    <span className={cn('inline-block h-2.5 w-2.5 rounded-full', colors[status] || 'bg-gray-400')} />
  );
}
