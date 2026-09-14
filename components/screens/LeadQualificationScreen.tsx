'use client';

import React, { useState } from 'react';
import {
  AIQualificationResult,
  BusinessProfile,
  Lead,
  UrgencyLevel,
  VehicleInfo,
} from '@/types/findo';
import { businessService } from '@/services/businessService';
import { leadService } from '@/services/leadService';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  AlertTriangle,
  Clock,
  Coins,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  Phone,
  Send,
  Wrench,
  Star,
  Info,
  Car,
  Briefcase,
  ThumbsUp,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import { formatPriceToman, toPersianDigits, getUrgencyBadge } from '@/lib/utils';

interface LeadQualificationScreenProps {
  requestData: {
    query: string;
    vehicle?: VehicleInfo;
    districtId: string;
    districtNameFa: string;
    urgency: UrgencyLevel;
    customerName: string;
    customerPhone: string;
    qualification: AIQualificationResult;
  };
  onLeadCreated: (createdLead: Lead) => void;
  onViewBusinessProfile: (businessId: string) => void;
  onBack: () => void;
}

export const LeadQualificationScreen: React.FC<LeadQualificationScreenProps> = ({
  requestData,
  onLeadCreated,
  onViewBusinessProfile,
  onBack,
}) => {
  const { query, vehicle, districtId, districtNameFa, urgency, customerName, customerPhone, qualification } =
    requestData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  // Match businesses based on AI qualification (main category, subcategory & district)
  const matchedList = businessService.matchBusinesses(
    qualification.categoryId || qualification.mainCategory,
    qualification.mainCategory,
    districtId,
    Boolean(qualification.requiresTowTruck),
    true
  );

  const handleCreateLead = (targetBusinessId?: string) => {
    setIsSubmitting(true);
    telegramService.triggerHaptic('medium');

    const matchedIds = targetBusinessId
      ? [targetBusinessId]
      : matchedList.slice(0, 4).map((m) => m.business.id);

    const newLead = leadService.createLead({
      customerName,
      customerPhone,
      naturalLanguageQuery: query,
      serviceTitle: qualification.titleFa || qualification.serviceNameFa || 'خدمت درخواستی فایندو',
      category: qualification.categoryId || qualification.mainCategory,
      categoryTitleFa: qualification.categoryTitleFa || qualification.mainCategoryTitleFa || 'خدمات تخصصی',
      vehicle,
      districtId,
      districtNameFa,
      urgency,
      qualification,
      matchedBusinessIds: matchedIds,
      assignedBusinessId: targetBusinessId,
    });

    telegramService.triggerHaptic('success');
    setIsSubmitting(false);
    onLeadCreated(newLead);
  };

  const urgencyInfo = getUrgencyBadge(urgency);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span>ویرایش متن درخواست</span>
        </button>

        <span className="text-xs font-semibold text-emerald-400">
          مرحله ۲ از ۲: نتیجه تحلیل هوش مصنوعی و تطبیق متخصصان
        </span>
      </div>

      {/* AI Triage Diagnosis Card */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-[#0a1828] to-[#070e1a] p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="h-5 w-5 fill-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">
                  {qualification.titleFa}
                </h1>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/20">
                  {qualification.categoryTitleFa}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تطبیق تخصص با هوش مصنوعی فایندو • ضریب اطمینان: {toPersianDigits(Math.round(qualification.confidenceScore * 100))}٪
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${urgencyInfo.className}`}>
              {urgencyInfo.labelFa}
            </span>
          </div>
        </div>

        {/* Query Summary & Vehicle/Item details if present */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
            <span className="text-slate-400 block mb-1">متن نیاز ثبت شده:</span>
            <p className="text-slate-200 font-medium leading-relaxed">«{query}»</p>
          </div>

          <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="h-3.5 w-3.5 text-cyan-400" />
              <span>محله در سنندج: <strong className="text-white">{districtNameFa}</strong></span>
            </div>
            {vehicle && vehicle.brand && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Car className="h-3.5 w-3.5 text-amber-400" />
                <span>خودرو: <strong className="text-white">{vehicle.brand} {vehicle.model} ({toPersianDigits(vehicle.year || '')})</strong></span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span>زمان پیشنهادی: <strong className="text-white">{urgency === 'emergency' ? 'فوری / اورژانسی' : urgency === 'today' ? 'امروز' : 'منعطف'}</strong></span>
            </div>
          </div>
        </div>

        {/* Diagnosis and Scope Breakdown */}
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-cyan-950/20 border border-cyan-500/20 p-4">
            <span className="text-xs font-bold text-cyan-300 block mb-1">
              تحلیل اولیه و دامنه کار تخصصی:
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {qualification.probableCause}
            </p>
          </div>

          {/* Key Detected Symptoms */}
          {qualification.detectedSymptoms && qualification.detectedSymptoms.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300 block">نشانه‌های فنی شناسایی شده:</span>
              <div className="flex flex-wrap gap-1.5">
                {qualification.detectedSymptoms.map((sym, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-slate-800/80 border border-slate-700 px-2.5 py-1 text-xs text-slate-200"
                  >
                    • {sym}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                <Coins className="h-4 w-4" />
                <span>برآورد منصفانه دستمزد در سنندج:</span>
              </div>
              <p className="text-sm font-bold text-white">
                {formatPriceToman(qualification.estimatedCostTomanMin)} تا {formatPriceToman(qualification.estimatedCostTomanMax)}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                مبنای نرخ اتحادیه و میانگین استعلام‌های فعال در فایندو
              </span>
            </div>

            <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 p-3">
              <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-1">
                <Clock className="h-4 w-4" />
                <span>مدت زمان تقریبی کار:</span>
              </div>
              <p className="text-sm font-bold text-white">
                {qualification.estimatedDuration ||
                  (qualification.estimatedDurationMinutes
                    ? `حدود ${toPersianDigits(qualification.estimatedDurationMinutes)} دقیقه`
                    : 'متغیر بسته به بررسی حضوری')}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                توسط استادکار ماهر و ابزار تخصصی
              </span>
            </div>
          </div>

          {/* Urgent Warning / Recommendations */}
          {((qualification.immediateActionTips && qualification.immediateActionTips.length > 0) ||
            (qualification.recommendedActionsFa && qualification.recommendedActionsFa.length > 0)) && (
            <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="h-4 w-4" />
                <span>اقدامات احتیاطی پیشنهادی پیش از شروع کار:</span>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5 pr-2">
                {(qualification.immediateActionTips || qualification.recommendedActionsFa || []).map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Matched Local Businesses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              <span>متخصصان احراز شده و منتخب در سنندج ({toPersianDigits(matchedList.length)} مورد)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              این واحدها دارای تاییدیه فنی، ضمانت خدمت و نزدیک‌ترین فاصله به محله {districtNameFa} هستند
            </p>
          </div>
        </div>

        {matchedList.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400 space-y-3">
            <p>در حال حاضر واحد مستقیمی در این زیردسته در محله شما نیست، اما درخواست شما برای تمام متخصصان سنندج ارسال خواهد شد.</p>
            <button
              onClick={() => handleCreateLead()}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950"
            >
              ثبت و انتشار عمومی در سنندج
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {matchedList.map(({ business, score, reasons }) => {
              const isSelected = selectedBusinessId === business.id;

              return (
                <div
                  key={business.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-[#0c182c] shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-cyan-400">
                        <Briefcase className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {business.businessNameFa}
                          </h3>
                          {business.isVerified && (
                            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
                              تایید شده
                            </span>
                          )}
                          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            تطابق: {toPersianDigits(score)}٪
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                          <span>مدیر: {business.ownerName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-cyan-400" />
                            <span>{business.districtNameFa}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            <span>{toPersianDigits(business.rating)}</span>
                            <span className="text-slate-500">({toPersianDigits(business.reviewsCount ?? business.reviewCount ?? 0)})</span>
                          </span>
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {reasons.map((r, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60"
                            >
                              ✓ {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <button
                        onClick={() => onViewBusinessProfile(business.id)}
                        className="text-xs text-slate-400 hover:text-cyan-300 underline underline-offset-4 px-2 py-1"
                      >
                        مشاهده پروفایل و سوابق
                      </button>

                      <button
                        onClick={() => handleCreateLead(business.id)}
                        disabled={isSubmitting}
                        className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
                      >
                        ارسال به این متخصص
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Global Dispatch Action */}
      <div className="sticky bottom-20 z-20 rounded-2xl border border-cyan-500/50 bg-[#091224]/95 p-4 shadow-2xl backdrop-blur-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-white">
              می‌خواهید استعلام هم‌زمان از تمام متخصصان دریافت کنید؟
            </p>
            <p className="text-slate-400">
              درخواست شما هم‌زمان به برترین متخصصان واجد شرایط سنندج ارسال می‌شود
            </p>
          </div>
        </div>

        <button
          onClick={() => handleCreateLead()}
          disabled={isSubmitting}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4 fill-slate-950" />
          <span>ارسال رایگان به تمام متخصصان برگزیده</span>
        </button>
      </div>
    </div>
  );
};
