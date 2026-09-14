'use client';

import React from 'react';
import { BusinessProfile } from '@/types/findo';
import { businessService } from '@/services/businessService';
import { MAIN_SERVICE_CATEGORIES } from '@/data/sanandajData';
import {
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Briefcase,
  ChevronLeft,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import { toPersianDigits } from '@/lib/utils';

interface BusinessProfileScreenProps {
  businessId: string;
  onBack: () => void;
  onRequestDirectService: (businessId: string) => void;
}

export const BusinessProfileScreen: React.FC<BusinessProfileScreenProps> = ({
  businessId,
  onBack,
  onRequestDirectService,
}) => {
  const business = businessService.getById(businessId);

  if (!business) {
    return (
      <div className="max-w-xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-4">
        <p className="text-sm text-slate-300">کسب‌وکار مورد نظر در فایندو یافت نشد.</p>
        <button
          onClick={onBack}
          className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700"
        >
          بازگشت
        </button>
      </div>
    );
  }

  const handleCall = () => {
    telegramService.triggerHaptic('medium');
    window.location.href = `tel:${business.phone}`;
  };

  const handleWhatsApp = () => {
    telegramService.triggerHaptic('medium');
    if (business.whatsapp) {
      window.open(`https://wa.me/98${business.whatsapp.replace(/^0/, '')}`, '_blank');
    }
  };

  const mainCategoryMeta = MAIN_SERVICE_CATEGORIES.find((m) => m.id === business.mainCategory);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span>بازگشت به فهرست</span>
        </button>

        <span className="text-xs text-slate-400">
          شناسه واحد: <strong className="text-slate-300">{business.id}</strong>
        </span>
      </div>

      {/* Hero Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-[#080d19] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/20">
              <Briefcase className="h-7 w-7 text-slate-950" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">
                  {business.businessNameFa}
                </h1>
                {business.isVerified && (
                  <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>احراز هویت شده فایندو</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300">
                مدیریت و مسئول فنی: <strong className="text-white">{business.ownerName}</strong>
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{toPersianDigits(business.rating)}</span>
                  <span className="text-slate-500 font-normal">
                    ({toPersianDigits(business.reviewsCount ?? business.reviewCount ?? 0)} نظر مشتریان)
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{toPersianDigits(business.completedLeadsCount)} خدمت موفق</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{toPersianDigits(business.yearsInBusiness)} سال سابقه در سنندج</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              telegramService.triggerHaptic('medium');
              onRequestDirectService(business.id);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 active:scale-95 transition-all shadow-md shadow-cyan-500/20 self-stretch sm:self-auto shrink-0"
          >
            <Sparkles className="h-4 w-4 fill-slate-950" />
            <span>درخواست خدمت مستقیم</span>
          </button>
        </div>

        {/* Action buttons: Call & WhatsApp */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-800/80 pt-4">
          <button
            onClick={handleCall}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-all"
          >
            <Phone className="h-4 w-4 text-emerald-400" />
            <span>تماس تلفنی مستقیم</span>
          </button>

          {business.whatsapp && (
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-800/50 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-all"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>گفتگو در واتساپ</span>
            </button>
          )}

          <div className="mr-auto flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            <span>{business.addressFa}</span>
          </div>
        </div>
      </div>

      {/* Bio and Description */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>درباره کسب‌وکار و دامنه تخصص</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {business.bioFa}
        </p>

        {mainCategoryMeta && (
          <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-cyan-300 block">
              رسته اصلی فعالیت در فایندو: {mainCategoryMeta.titleFa}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {business.categories.map((catId) => (
                <span
                  key={catId}
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-slate-200 border border-slate-700"
                >
                  ✓ {catId}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Special Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>اعزام متخصص در محل مشتری</span>
          </div>
          <p className="text-xs text-slate-400">
            {business.hasOnsiteService
              ? 'این واحد دارای تیم سیار و ابزار پرتابل جهت انجام کار در تمام محلات سنندج است.'
              : 'خدمات تنها با مراجعه حضوری به محل کسب‌وکار انجام می‌شود.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <span>مجوز صنفی و ضمانت فایندو</span>
          </div>
          <p className="text-xs text-slate-400">
            شماره ثبت و پروانه صنفی در سنندج: {business.licenseNumber}
          </p>
        </div>
      </div>
    </div>
  );
};
