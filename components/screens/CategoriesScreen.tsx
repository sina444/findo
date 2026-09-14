'use client';

import React, { useState } from 'react';
import { MAIN_SERVICE_CATEGORIES, SERVICE_CATEGORIES } from '@/data/sanandajData';
import { MainCategoryId } from '@/types/findo';
import {
  Car,
  Home,
  Wrench,
  Smartphone,
  HeartPulse,
  Scale,
  GraduationCap,
  Building2,
  Utensils,
  Truck,
  Sparkle,
  Layers,
  Search,
  Sparkles,
  ChevronLeft,
  Clock,
  Coins,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import { toPersianDigits } from '@/lib/utils';

interface CategoriesScreenProps {
  onSelectCategory: (categoryId: string) => void;
  onRequestWithCategory: (categoryId: string) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  automotive: <Car className="h-5 w-5 text-amber-400" />,
  home_construction: <Home className="h-5 w-5 text-emerald-400" />,
  repair_technical: <Wrench className="h-5 w-5 text-orange-400" />,
  tech_digital: <Smartphone className="h-5 w-5 text-cyan-400" />,
  medical_dental: <HeartPulse className="h-5 w-5 text-rose-400" />,
  legal_consulting: <Scale className="h-5 w-5 text-purple-400" />,
  education: <GraduationCap className="h-5 w-5 text-blue-400" />,
  delivery_moving: <Truck className="h-5 w-5 text-yellow-400" />,
  real_estate: <Building2 className="h-5 w-5 text-teal-400" />,
  beauty_wellness: <Sparkle className="h-5 w-5 text-pink-400" />,
  events_dining: <Utensils className="h-5 w-5 text-red-400" />,
  other_services: <Layers className="h-5 w-5 text-slate-300" />,
};

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onSelectCategory,
  onRequestWithCategory,
}) => {
  const [search, setSearch] = useState('');
  const [activeMainCategory, setActiveMainCategory] = useState<string>('all');

  const filteredCategories = MAIN_SERVICE_CATEGORIES.filter((main) => {
    if (activeMainCategory !== 'all' && main.id !== activeMainCategory) return false;
    if (!search.trim()) return true;

    const query = search.trim().toLowerCase();
    const titleMatch = main.titleFa.toLowerCase().includes(query);
    const descMatch = main.descriptionFa.toLowerCase().includes(query);
    const subMatch = main.subcategories?.some(
      (sub) =>
        sub.titleFa.toLowerCase().includes(query) ||
        sub.descriptionFa.toLowerCase().includes(query) ||
        ((sub as any).popularIssues && (sub as any).popularIssues.some((issue: string) => issue.toLowerCase().includes(query)))
    ) || false;
    return titleMatch || descMatch || subMatch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            دسته‌بندی خدمات فایندو در سنندج
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            دسترسی به تمام ۱۲ رسته خدمات تخصصی محلی با نظارت کیفی و شفافیت نرخ‌ها
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی خدمت، متخصص یا عیب فنی..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Categories Pill Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            telegramService.triggerHaptic('light');
            setActiveMainCategory('all');
          }}
          className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
            activeMainCategory === 'all'
              ? 'bg-cyan-500 text-slate-950 font-bold'
              : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
          }`}
        >
          همه ۱۲ رسته
        </button>

        {MAIN_SERVICE_CATEGORIES.map((main) => (
          <button
            key={main.id}
            onClick={() => {
              telegramService.triggerHaptic('light');
              setActiveMainCategory(main.id);
            }}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMainCategory === main.id
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            {main.titleFa}
          </button>
        ))}
      </div>

      {/* Main Categories with their Subcategories */}
      <div className="space-y-6">
        {filteredCategories.map((main) => (
          <div
            key={main.id}
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 space-y-4"
          >
            {/* Header of Main Category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/70 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700">
                  {CATEGORY_ICON_MAP[main.id] || <Layers className="h-6 w-6 text-cyan-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {main.titleFa}
                    </h2>
                    {main.id === 'automotive' && (
                      <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/20">
                        رسته راه‌اندازی اول
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{main.descriptionFa}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  telegramService.triggerHaptic('medium');
                  onRequestWithCategory(main.id);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all self-start sm:self-auto"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>درخواست هوشمند در این رسته</span>
              </button>
            </div>

            {/* Subcategories grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(main.subcategories || []).map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{sub.titleFa}</h3>
                      {sub.badge && (
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                          {sub.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {sub.descriptionFa}
                    </p>

                    {/* Popular issues / tags */}
                    {sub.popularIssues && sub.popularIssues.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {sub.popularIssues.slice(0, 3).map((issue, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-400 border border-slate-800"
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between">
                    <button
                      onClick={() => {
                        telegramService.triggerHaptic('light');
                        onRequestWithCategory(sub.id);
                      }}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>ثبت درخواست</span>
                      <ArrowLeft className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
