'use client';

import React from 'react';
import { UserRole } from '@/types/nexa';
import {
  Home,
  Sparkles,
  Layers,
  FileText,
  LayoutDashboard,
  Clock,
  CreditCard,
  Building2,
  BarChart3,
  Users,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import { toPersianDigits } from '@/lib/utils';

export type ScreenTab =
  | 'home'
  | 'ai_request'
  | 'categories'
  | 'my_leads'
  | 'matched_businesses'
  | 'business_dashboard'
  | 'business_history'
  | 'business_pricing'
  | 'business_register'
  | 'admin_dashboard';

interface BottomNavProps {
  currentRole: UserRole;
  currentScreen: ScreenTab;
  onSelectScreen: (screen: ScreenTab) => void;
  unreadLeadsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentRole,
  currentScreen,
  onSelectScreen,
  unreadLeadsCount = 0,
}) => {
  const handleNav = (screen: ScreenTab) => {
    telegramService.triggerHaptic('light');
    onSelectScreen(screen);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#070b14]/95 backdrop-blur-lg pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {currentRole === 'customer' && (
          <>
            <button
              id="nav-home"
              onClick={() => handleNav('home')}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
                currentScreen === 'home'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>خانه</span>
            </button>

            <button
              id="nav-ai-request"
              onClick={() => handleNav('ai_request')}
              className={`relative flex flex-col items-center gap-1 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 px-4 py-1.5 text-[11px] font-bold text-slate-950 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all`}
            >
              <Sparkles className="h-5 w-5 fill-slate-950" />
              <span>درخواست هوشمند</span>
            </button>

            <button
              id="nav-categories"
              onClick={() => handleNav('categories')}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
                currentScreen === 'categories'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-5 w-5" />
              <span>خدمات</span>
            </button>

            <button
              id="nav-my-leads"
              onClick={() => handleNav('my_leads')}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
                currentScreen === 'my_leads'
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>پیگیری لید</span>
            </button>
          </>
        )}

        {currentRole === 'business' && (
          <>
            <button
              id="nav-biz-dashboard"
              onClick={() => handleNav('business_dashboard')}
              className={`relative flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
                currentScreen === 'business_dashboard'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>لیدهای جدید</span>
              {unreadLeadsCount > 0 && (
                <span className="absolute -top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {toPersianDigits(unreadLeadsCount)}
                </span>
              )}
            </button>

            <button
              id="nav-biz-history"
              onClick={() => handleNav('business_history')}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
                currentScreen === 'business_history'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="h-5 w-5" />
              <span>تاریخچه</span>
            </button>

            <button
              id="nav-biz-pricing"
              onClick={() => handleNav('business_pricing')}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
                currentScreen === 'business_pricing'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>شارژ اعتبار</span>
            </button>

            <button
              id="nav-biz-register"
              onClick={() => handleNav('business_register')}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-medium transition-all ${
                currentScreen === 'business_register'
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span>ثبت واحد جدید</span>
            </button>
          </>
        )}

        {currentRole === 'admin' && (
          <>
            <button
              id="nav-admin-dash"
              onClick={() => handleNav('admin_dashboard')}
              className={`flex flex-col items-center gap-1 rounded-lg px-4 py-1 text-[11px] font-medium transition-all ${
                currentScreen === 'admin_dashboard'
                  ? 'text-purple-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>داشبورد نظارت</span>
            </button>

            <button
              id="nav-admin-leads"
              onClick={() => handleNav('my_leads')}
              className={`flex flex-col items-center gap-1 rounded-lg px-4 py-1 text-[11px] font-medium transition-all ${
                currentScreen === 'my_leads'
                  ? 'text-purple-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>کل لیدها</span>
            </button>

            <button
              id="nav-admin-biz"
              onClick={() => handleNav('matched_businesses')}
              className={`flex flex-col items-center gap-1 rounded-lg px-4 py-1 text-[11px] font-medium transition-all ${
                currentScreen === 'matched_businesses'
                  ? 'text-purple-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>تعمیرگاه‌های سنندج</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
