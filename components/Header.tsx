'use client';

import React from 'react';
import { UserRole } from '@/types/findo';
import {
  Sparkles,
  MapPin,
  Send,
  User,
  Briefcase,
  BarChart3,
  Search,
  Compass,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import { toPersianDigits } from '@/lib/utils';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNewRequest?: () => void;
  activeLeadsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenNewRequest,
  activeLeadsCount = 3,
}) => {
  const isTma = telegramService.isTelegramMiniApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md">
      {/* Top micro-bar with Sanandaj city info & live pulse */}
      <div className="border-b border-slate-800/50 bg-[#050811] px-4 py-1.5 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-300">
              شبکه فعال سنندج:
            </span>
            <span className="text-emerald-400 font-semibold">
              {toPersianDigits(124)} متخصص و کسب‌وکار محلی آنلاین
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-slate-400">
              <MapPin className="h-3 w-3 text-cyan-400" />
              <span>پوشش تمام مناطق شهری سنندج</span>
            </div>
            {isTma && (
              <span className="flex items-center gap-1 rounded bg-cyan-950/80 px-2 py-0.5 text-[11px] font-medium text-cyan-300 border border-cyan-800/50">
                <Send className="h-2.5 w-2.5" />
                <span>نسخه تلگرام</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand logo & tagline */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Compass className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white sm:text-xl">
                فایندو
              </span>
              <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                FINDO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              نیازت رو بگو؛ متخصصش رو پیدا می‌کنیم
            </p>
          </div>
        </div>

        {/* Role Switcher tabs (Customer / Business / Admin) */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            id="role-btn-customer"
            onClick={() => {
              telegramService.triggerHaptic('light');
              onRoleChange('customer');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              currentRole === 'customer'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>مشتری</span>
          </button>

          <button
            id="role-btn-business"
            onClick={() => {
              telegramService.triggerHaptic('light');
              onRoleChange('business');
            }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              currentRole === 'business'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>پنل متخصصان و کسب‌وکار</span>
            {activeLeadsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {toPersianDigits(activeLeadsCount)}
              </span>
            )}
          </button>

          <button
            id="role-btn-admin"
            onClick={() => {
              telegramService.triggerHaptic('light');
              onRoleChange('admin');
            }}
            className={`hidden md:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              currentRole === 'admin'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>مدیریت بازار</span>
          </button>
        </div>

        {/* Quick action button */}
        {currentRole === 'customer' && onOpenNewRequest && (
          <button
            id="header-quick-request-btn"
            onClick={() => {
              telegramService.triggerHaptic('medium');
              onOpenNewRequest();
            }}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 fill-slate-950" />
            <span>چه خدمتی لازم داری؟</span>
          </button>
        )}
      </div>
    </header>
  );
};
