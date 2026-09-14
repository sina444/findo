'use client';

import React, { useState } from 'react';
import { MAIN_SERVICE_CATEGORIES, SANANDAJ_DISTRICTS } from '@/data/sanandajData';
import {
  AIQualificationResult,
  UrgencyLevel,
  VehicleInfo,
  MainCategoryId,
} from '@/types/findo';
import {
  Sparkles,
  Car,
  Home,
  Wrench,
  Smartphone,
  Scale,
  GraduationCap,
  Truck,
  HeartPulse,
  Building2,
  Sparkle,
  Utensils,
  Layers,
  MapPin,
  Clock,
  User,
  Phone,
  Mic,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import { toPersianDigits } from '@/lib/utils';

interface AIServiceRequestScreenProps {
  initialPrompt?: string;
  initialCategoryId?: string;
  onQualificationComplete: (params: {
    query: string;
    vehicle?: VehicleInfo;
    districtId: string;
    districtNameFa: string;
    urgency: UrgencyLevel;
    customerName: string;
    customerPhone: string;
    qualification: AIQualificationResult;
  }) => void;
  onCancel: () => void;
}

const VEHICLE_PRESETS = [
  { brand: 'ایران خودرو', model: 'پژو ۲۰۶ تیپ ۵' },
  { brand: 'ایران خودرو', model: 'دنا پلاس توربو' },
  { brand: 'ایران خودرو', model: 'تارا اتوماتیک' },
  { brand: 'ایران خودرو', model: 'پژو پارس TU5' },
  { brand: 'سایپا', model: 'کوییک R' },
  { brand: 'سایپا', model: 'شاهین G' },
  { brand: 'سایپا', model: 'پراید ۱۳۱' },
  { brand: 'چینی و وارداتی', model: 'هایما S7 پلاس' },
  { brand: 'چینی و وارداتی', model: 'جک S5' },
  { brand: 'هیوندای', model: 'سوناتا YF' },
];

export const AIServiceRequestScreen: React.FC<AIServiceRequestScreenProps> = ({
  initialPrompt = '',
  initialCategoryId,
  onQualificationComplete,
  onCancel,
}) => {
  const [query, setQuery] = useState(initialPrompt);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>(
    initialCategoryId || 'auto_detect'
  );
  const [districtId, setDistrictId] = useState('baharan');
  const [urgency, setUrgency] = useState<UrgencyLevel>('today');
  const [customerName, setCustomerName] = useState('سینا حسینی');
  const [customerPhone, setCustomerPhone] = useState('09183719090');

  // Contextual item / vehicle fields
  const [brand, setBrand] = useState('ایران خودرو');
  const [model, setModel] = useState('پژو ۲۰۶ تیپ ۵');
  const [year, setYear] = useState('۱۳۹۸');
  const [itemOrDeviceDetails, setItemOrDeviceDetails] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Check if current request likely pertains to a vehicle
  const isLikelyAutomotive =
    selectedMainCategory === 'automotive' ||
    query.includes('ماشین') ||
    query.includes('خودرو') ||
    query.includes('پژو') ||
    query.includes('پراید') ||
    query.includes('دنا') ||
    query.includes('مکانیک') ||
    query.includes('یدک‌کش') ||
    query.includes('باتری خودرو');

  // Simulate audio capture
  const handleMicToggle = () => {
    telegramService.triggerHaptic('medium');
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setQuery(
          'برای پژو ۲۰۶ تیپ ۵ تعمیرکار جلوبندی می‌خوام در بهاران سنندج که امروز بتونه بیاد'
        );
      }, 2400);
    } else {
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setErrorMessage('لطفاً شرح نیاز یا خدمت مورد نظر خود را به زبان ساده بنویسید.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 10) {
      setErrorMessage('لطفاً یک شماره تماس معتبر برای دریافت پیشنهادها و استعلام‌ها وارد فرمایید.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    telegramService.triggerHaptic('medium');

    const selectedDistrict = SANANDAJ_DISTRICTS.find((d) => d.id === districtId);
    const districtNameFa = selectedDistrict ? selectedDistrict.nameFa : 'سنندج';

    try {
      // Call real server-side Gemini AI Qualification endpoint
      const response = await fetch('/api/ai/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          mainCategory: selectedMainCategory !== 'auto_detect' ? selectedMainCategory : undefined,
          vehicle: isLikelyAutomotive ? { brand, model, year } : undefined,
          itemOrDeviceDetails: itemOrDeviceDetails.trim() || undefined,
          district: districtNameFa,
        }),
      });

      if (!response.ok) {
        throw new Error('خطا در ارتباط با سامانه تحلیل هوشمند فایندو');
      }

      const qualification: AIQualificationResult = await response.json();

      telegramService.triggerHaptic('success');
      onQualificationComplete({
        query,
        vehicle: isLikelyAutomotive ? { brand, model, year } : undefined,
        districtId,
        districtNameFa,
        urgency,
        customerName,
        customerPhone,
        qualification,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ارزیابی و تطبیق هوشمند');
      telegramService.triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span>بازگشت به صفحه اصلی</span>
        </button>

        <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>تحلیل هوشمند درخواست خدمت</span>
        </span>
      </div>

      {/* Main Request Form Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#090f1d] p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 border-b border-slate-800 pb-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 fill-cyan-400" />
            <span>موتور هوش مصنوعی فایندو (سنندج)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            چه خدمتی لازم داری؟
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            به زبان گفتاری و طبیعی بنویس چه کاری داری؛ هوش مصنوعی فایندو نوع خدمت، ابعاد فنی، برآورد هزینه و متخصصان واجد شرایط سنندج را مشخص می‌کند.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Natural Language Prompt & Voice Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="ai-request-query" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>توضیح نیاز شما به زبان ساده</span>
                <span className="text-rose-400">*</span>
              </label>

              <button
                type="button"
                onClick={handleMicToggle}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
                <span>{isRecording ? 'در حال شنیدن...' : 'ورودی صوتی (شبیه‌ساز)'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                id="ai-request-query"
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثال: برای پژو ۲۰۶ تعمیرکار میخوام که امروز بتونه بیاد. یا: پکیج دیواری بوتان روشن نمیشه و آب گرم نداریم..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 leading-relaxed"
              />
            </div>
          </div>

          {/* Service Category Selection (Auto-detect or Manual) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200">
              دسته‌بندی خدمت (اختیاری):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMainCategory('auto_detect')}
                className={`rounded-xl border p-2.5 text-xs font-semibold text-right transition-all flex items-center gap-2 ${
                  selectedMainCategory === 'auto_detect'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                <span>تشخیص خودکار هوش مصنوعی</span>
              </button>

              {MAIN_SERVICE_CATEGORIES.slice(0, 7).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedMainCategory(cat.id)}
                  className={`rounded-xl border p-2.5 text-xs font-semibold text-right transition-all flex items-center gap-1.5 truncate ${
                    selectedMainCategory === cat.id
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{cat.titleFa}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Automotive Vehicle Details */}
          {isLikelyAutomotive && (
            <div className="rounded-2xl border border-cyan-900/40 bg-cyan-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Car className="h-4 w-4" />
                <span>مشخصات خودرو (جهت اعزام قطعه و متخصص دقیق)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">سازنده / برند</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="ایران خودرو، سایپا، هیوندای..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">مدل و تیپ</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="پژو ۲۰۶، دنا پلاس، کوییک..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">سال ساخت (تقریبی)</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    placeholder="مثال: ۱۳۹۸"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ai-district" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                <span>منطقه / محله شما در سنندج</span>
              </label>
              <select
                id="ai-district"
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {SANANDAJ_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameFa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ai-urgency" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>میزان فوریت</span>
              </label>
              <select
                id="ai-urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="emergency">فوری و اورژانسی (همین حالا / در راه مانده)</option>
                <option value="today">امروز (ظرف چند ساعت آینده)</option>
                <option value="flexible">منعطف و توافقی (روزهای آینده)</option>
              </select>
            </div>
          </div>

          {/* Customer Identity for Receiving Quotes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/80 pt-4">
            <div>
              <label htmlFor="customer-name" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>نام و نام خانوادگی</span>
              </label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                placeholder="سینا حسینی"
              />
            </div>

            <div>
              <label htmlFor="customer-phone" className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>شماره تماس همراه</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                id="customer-phone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none dir-ltr text-left"
                placeholder="09183719090"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            id="submit-ai-qualify-btn"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/25 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>هوش مصنوعی فایندو در حال تحلیل نیاز و تطبیق متخصصان...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 fill-slate-950" />
                <span>ارزیابی هوشمند و نمایش متخصصان منتخب سنندج</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
