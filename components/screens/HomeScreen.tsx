'use client';

import React, { useState } from 'react';
import { MAIN_SERVICE_CATEGORIES, SANANDAJ_DISTRICTS } from '@/data/sanandajData';
import { MainCategoryId, ServiceCategoryId } from '@/types/findo';
import {
  Sparkles,
  Search,
  Car,
  Home,
  HeartPulse,
  Sparkle,
  Scale,
  Smartphone,
  GraduationCap,
  Building2,
  Utensils,
  Wrench,
  Truck,
  Layers,
  Clock,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Zap,
  BatteryCharging,
  Cog,
  Cpu,
  ShieldAlert,
  Settings,
  Flame,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import { toPersianDigits } from '@/lib/utils';

interface HomeScreenProps {
  onStartAIRequest: (initialPrompt?: string, categoryId?: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onViewBusinessRegister: () => void;
  onViewMatchedBusinesses: () => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  automotive: <Car className="h-6 w-6 text-amber-400" />,
  home_construction: <Home className="h-6 w-6 text-emerald-400" />,
  repair_technical: <Wrench className="h-6 w-6 text-orange-400" />,
  tech_digital: <Smartphone className="h-6 w-6 text-cyan-400" />,
  medical_dental: <HeartPulse className="h-6 w-6 text-rose-400" />,
  legal_consulting: <Scale className="h-6 w-6 text-purple-400" />,
  education: <GraduationCap className="h-6 w-6 text-blue-400" />,
  delivery_moving: <Truck className="h-6 w-6 text-yellow-400" />,
  real_estate: <Building2 className="h-6 w-6 text-teal-400" />,
  beauty_wellness: <Sparkle className="h-6 w-6 text-pink-400" />,
  events_dining: <Utensils className="h-6 w-6 text-red-400" />,
  other_services: <Layers className="h-6 w-6 text-slate-300" />,
};

const AUTO_SUBCAT_ICONS: Record<string, React.ReactNode> = {
  mechanic: <Wrench className="h-4 w-4 text-amber-400" />,
  electrical: <Zap className="h-4 w-4 text-yellow-400" />,
  battery: <BatteryCharging className="h-4 w-4 text-emerald-400" />,
  towing: <Truck className="h-4 w-4 text-rose-400" />,
  suspension: <Cog className="h-4 w-4 text-cyan-400" />,
  diagnostics: <Cpu className="h-4 w-4 text-blue-400" />,
  body_paint: <ShieldAlert className="h-4 w-4 text-purple-400" />,
  gearbox: <Settings className="h-4 w-4 text-indigo-400" />,
  car_wash: <Sparkles className="h-4 w-4 text-sky-400" />,
  periodic_service: <Flame className="h-4 w-4 text-orange-400" />,
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartAIRequest,
  onSelectCategory,
  onViewBusinessRegister,
  onViewMatchedBusinesses,
}) => {
  const [naturalQuery, setNaturalQuery] = useState('');
  const [expandedAutomotive, setExpandedAutomotive] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;
    telegramService.triggerHaptic('medium');
    onStartAIRequest(naturalQuery.trim());
  };

  const samplePrompts = [
    { text: 'برای پژو ۲۰۶ تعمیرکار میخوام که امروز بتونه بیاد', tag: 'خودرو' },
    { text: 'لوله زیر سینک سوراخ شده و آب میده در بهاران', tag: 'تاسیسات منزل' },
    { text: 'پکیج دیواری بوتان روشن نمیشه در پاسداران', tag: 'تعمیر پکیج' },
    { text: 'وکیل دعاوی ملکی برای تنظیم مبایعه‌نامه', tag: 'مشاوره حقوقی' },
    { text: 'خاور مسقف و کارگر برای اسباب‌کشی به شالمان', tag: 'باربری' },
    { text: 'تعمیر ال‌سی‌دی و تعویض گلس آیفون ۱۳', tag: 'موبایل و دیجیتال' },
  ];

  const automotiveMeta = MAIN_SERVICE_CATEGORIES.find((c) => c.id === 'automotive');

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Section prioritizing the AI Natural-Language Request Box */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-[#0a1020] to-[#070b14] p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Brand & positioning badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 mb-4">
            <Sparkles className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400" />
            <span>FINDO — Tell us what you need. We find who can do it.</span>
          </div>

          {/* Persian RTL Headline */}
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            نیازت رو بگو؛
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 mt-1">
              متخصصش رو پیدا می‌کنیم.
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            فایندو بازار هوشمند خدمات محلی در سنندج است. کافی است به زبان گفتاری بفرمایید چه مشکلی پیش آمده یا به چه متخصصی احتیاج دارید؛ هوش مصنوعی فایندو نوع خدمت، فوریت و بودجه را تحلیل کرده و درخواست شما را به بهترین متخصصان و کسب‌وکارهای احراز شده متصل می‌کند.
          </p>

          {/* Natural Language Request Box */}
          <form onSubmit={handleQuickSubmit} className="mt-6">
            <div className="rounded-2xl border border-slate-700/90 bg-slate-950/90 p-3 shadow-inner focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
              <label htmlFor="hero-ai-request-input" className="block text-xs font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>چه خدمتی لازم داری؟</span>
              </label>

              <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex flex-1 items-center gap-2 px-2">
                  <Search className="h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    id="hero-ai-request-input"
                    type="text"
                    value={naturalQuery}
                    onChange={(e) => setNaturalQuery(e.target.value)}
                    placeholder="مثال: برای پژو ۲۰۶ تعمیرکار میخوام که امروز بتونه بیاد..."
                    className="w-full bg-transparent py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  id="hero-ai-submit-btn"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-cyan-500/25 hover:brightness-110 active:scale-98 transition-all shrink-0"
                >
                  <Sparkles className="h-4 w-4 fill-slate-950" />
                  <span>پیدا کردن متخصص با هوش مصنوعی</span>
                </button>
              </div>
            </div>
          </form>

          {/* Fast sample prompt tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">پیشنهادهای پرکاربرد:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  telegramService.triggerHaptic('light');
                  setNaturalQuery(p.text);
                  onStartAIRequest(p.text);
                }}
                className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-all flex items-center gap-1.5"
              >
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-800/40">
                  {p.tag}
                </span>
                <span>{p.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Sanandaj stats strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-6">
          <div className="rounded-xl bg-slate-950/40 p-3 border border-slate-800/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>سرعت تطبیق متخصص</span>
            </div>
            <p className="mt-1 text-base font-bold text-white">
              کمتر از {toPersianDigits(3)} دقیقه
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/40 p-3 border border-slate-800/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>متخصصان احراز شده</span>
            </div>
            <p className="mt-1 text-base font-bold text-white">
              {toPersianDigits(124)} واحد در سنندج
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/40 p-3 border border-slate-800/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-blue-400" />
              <span>پوشش شهری</span>
            </div>
            <p className="mt-1 text-base font-bold text-white">
              تمام مناطق و محلات سنندج
            </p>
          </div>

          <div className="rounded-xl bg-slate-950/40 p-3 border border-slate-800/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              <span>رضایت مشتریان</span>
            </div>
            <p className="mt-1 text-base font-bold text-white">
              {toPersianDigits(98.6)}٪ از سفارش‌ها
            </p>
          </div>
        </div>
      </section>

      {/* Main Categories Grid - The 12 primary service domains */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              ۱۲ رسته خدمات فایندو در سنندج
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              از تعمیرات خودرو و لوازم خانگی تا خدمات پزشکی، حقوقی و باربری
            </p>
          </div>

          <button
            onClick={onViewMatchedBusinesses}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-all"
          >
            <span>مشاهده همه متخصصان</span>
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {MAIN_SERVICE_CATEGORIES.map((cat) => {
            const isAuto = cat.id === 'automotive';

            return (
              <div
                key={cat.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer shadow-sm hover:shadow-cyan-500/10"
                onClick={() => {
                  telegramService.triggerHaptic('light');
                  onSelectCategory(cat.id);
                }}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700/80 group-hover:scale-105 transition-transform">
                      {CATEGORY_ICON_MAP[cat.id] || <Layers className="h-6 w-6 text-slate-400" />}
                    </div>

                    {isAuto && (
                      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                        اولین رسته راه‌اندازی
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {cat.titleFa}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.descriptionFa}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-cyan-400">
                  <span>ثبت درخواست</span>
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Automotive Subcategory Explorer (Full preservation of the automotive vertical) */}
      <section className="rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-[#0a1628] to-[#070e1c] p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  زیردسته‌های تخصصی خودرو در فایندو
                </h3>
                <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  ۱۰ رسته فعال
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                رسته خودرویی فایندو با تمام ۱۰ زیردسته تخصصی در سنندج پوشش داده می‌شود
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpandedAutomotive(!expandedAutomotive)}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 self-start sm:self-auto"
          >
            <span>{expandedAutomotive ? 'بستن لیست کامل' : 'مشاهده همه زیردسته‌ها'}</span>
            {expandedAutomotive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(expandedAutomotive
            ? automotiveMeta?.subcategories || []
            : (automotiveMeta?.subcategories || []).slice(0, 5)
          ).map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                telegramService.triggerHaptic('light');
                onStartAIRequest(`درخواست خدمات ${sub.titleFa} در سنندج`, sub.id);
              }}
              className="flex flex-col text-right rounded-xl border border-slate-800 bg-slate-900/80 p-3 hover:border-cyan-500/40 hover:bg-slate-800 transition-all text-xs"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 rounded bg-slate-800 border border-slate-700">
                  {AUTO_SUBCAT_ICONS[sub.id] || <Wrench className="h-3.5 w-3.5 text-cyan-400" />}
                </div>
                <strong className="text-slate-100 text-[11px] font-bold">{sub.titleFa}</strong>
              </div>
              <span className="text-[10px] text-slate-400 line-clamp-1">{sub.descriptionFa}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Emergency Roadside & Urgent Home Assistance CTA */}
      <section className="rounded-2xl border border-rose-900/60 bg-gradient-to-r from-rose-950/50 via-slate-900 to-[#0c0e18] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400">
            <Truck className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                خدمات فوری و اورژانسی در محل (سنندج ۲۴ ساعته)
              </h2>
              <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                شبکه‌ اعزام فوری
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              یدک‌کش شبانه‌روزی، امداد باتری خودرو در محل، رفع نشتی فوری لوله آب یا تعمیر فوری پکیج بدون معطلی
            </p>
          </div>
        </div>

        <button
          id="btn-emergency-towing"
          onClick={() => {
            telegramService.triggerHaptic('heavy');
            onStartAIRequest('درخواست فوری امداد و خدمات اضطراری در سنندج', 'towing');
          }}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-600/20"
        >
          <PhoneCall className="h-4 w-4" />
          <span>درخواست فوری امداد</span>
        </button>
      </section>

      {/* Business Registration Callout Banner */}
      <section className="rounded-2xl border border-emerald-900/60 bg-gradient-to-r from-[#0a2016] via-slate-900 to-[#07130e] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              صاحب کسب‌وکار یا متخصص فنی در سنندج هستید؟
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              در فایندو ثبت‌نام کنید، مشتریان محلی منطقه خودتان را بی‌واسطه دریافت کنید و با ۵ لید هدیه رایگان کار خود را آغاز نمایید.
            </p>
          </div>
        </div>

        <button
          onClick={onViewBusinessRegister}
          className="w-full sm:w-auto shrink-0 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
        >
          <span>عضویت رایگان متخصصان</span>
        </button>
      </section>
    </div>
  );
};
