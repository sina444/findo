'use client';

import React, { useState } from 'react';
import { BusinessProfile } from '@/types/findo';
import { businessService } from '@/services/businessService';
import { SANANDAJ_DISTRICTS, MAIN_SERVICE_CATEGORIES } from '@/data/sanandajData';
import {
  Briefcase,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  Filter,
  Search,
  CheckCircle2,
  ChevronLeft,
  Truck,
  Sparkles,
  Layers,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import { toPersianDigits } from '@/lib/utils';

interface MatchedBusinessesScreenProps {
  onSelectBusiness: (businessId: string) => void;
  onRequestService: (businessId?: string) => void;
}

export const MatchedBusinessesScreen: React.FC<MatchedBusinessesScreenProps> = ({
  onSelectBusiness,
  onRequestService,
}) => {
  const allBusinesses = businessService.getAll();

  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyOnsite, setOnlyOnsite] = useState(false);

  const filtered = allBusinesses.filter((b) => {
    if (search && !b.businessNameFa.includes(search) && !b.ownerName.includes(search)) return false;
    if (selectedDistrict !== 'all' && b.districtId !== selectedDistrict) return false;
    if (selectedCategory !== 'all') {
      const matchMain = b.mainCategory === selectedCategory;
      const matchSub = b.categories.includes(selectedCategory);
      if (!matchMain && !matchSub) return false;
    }
    if (onlyOnsite && !b.hasOnsiteService) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            متخصصان و کسب‌وکارهای مجاز سنندج
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {toPersianDigits(allBusinesses.length)} واحد دارای تاییدیه فنی و گارانتی خدمات در پلتفرم فایندو
          </p>
        </div>

        <button
          onClick={() => onRequestService()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4 fill-slate-950" />
          <span>تطبیق خودکار با هوش مصنوعی</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی نام کسب‌وکار یا متخصص..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">تمام محله‌های سنندج</option>
              {SANANDAJ_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameFa}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">همه رسته‌های خدمات</option>
              {MAIN_SERVICE_CATEGORIES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.titleFa}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-3 pt-1 text-xs">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyOnsite}
              onChange={(e) => setOnlyOnsite(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
            />
            <span>فقط دارای خدمات اعزام در محل</span>
          </label>
        </div>
      </div>

      {/* Businesses List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
            موردی مطابق با فیلترهای انتخابی شما در سنندج یافت نشد.
          </div>
        ) : (
          filtered.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-cyan-500/40 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Briefcase className="h-6 w-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">
                        {b.businessNameFa}
                      </h2>
                      {b.isVerified && (
                        <span className="flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                          <ShieldCheck className="h-3 w-3" />
                          <span>احراز شده</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>مدیر: {b.ownerName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{b.districtNameFa}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{toPersianDigits(b.rating)}</span>
                        <span className="text-slate-500 font-normal">
                          ({toPersianDigits(b.reviewsCount ?? b.reviewCount ?? 0)} نظر)
                        </span>
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onSelectBusiness(b.id)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
                  >
                    مشاهده پروفایل
                  </button>

                  <button
                    onClick={() => onRequestService(b.id)}
                    className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
                  >
                    درخواست خدمت
                  </button>
                </div>
              </div>

              {/* Bio & Tags */}
              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                {b.bioFa}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {b.hasOnsiteService && (
                  <span className="rounded-md bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-800/40">
                    اعزام به محل مشتری در سنندج
                  </span>
                )}
                {b.hasTowingFleet && (
                  <span className="rounded-md bg-rose-950/60 px-2 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-800/40">
                    دارای ناوگان یدک‌کش چرخ‌گیر
                  </span>
                )}
                <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                  سابقه: {toPersianDigits(b.yearsInBusiness)} سال در سنندج
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
