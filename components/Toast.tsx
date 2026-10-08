'use client';

import { useStore } from '@/lib/store-context';
import { CheckCircle2 } from 'lucide-react';

export function Toast() {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-in-right">
      <div className="flex items-center gap-3 rounded-xl border border-[#AFC8A8] bg-white px-5 py-4 shadow-lg">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F0E5]">
          <CheckCircle2 className="h-5 w-5 text-[#3F6B45]" />
        </div>
        <span className="text-sm font-medium text-[#20251F]">{toast}</span>
      </div>
    </div>
  );
}
