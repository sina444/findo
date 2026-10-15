'use client';

import dynamic from 'next/dynamic';

const FloatingLeaves = dynamic(() => import('@/components/FloatingLeaves').then(m => m.FloatingLeaves), { ssr: false });

export function Background3DWrapper() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-30"
      style={{ pointerEvents: 'none' }}
    >
      <FloatingLeaves />
    </div>
  );
}
