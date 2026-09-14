'use client';

import React, { useState } from 'react';
import { SANANDAJ_DISTRICTS, MAIN_SERVICE_CATEGORIES } from '@/data/sanandajData';
import { MainCategoryId, ServiceCategoryId } from '@/types/findo';
import { businessService } from '@/services/businessService';
import {
  Building2,
  CheckCircle2,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  Gift,
  ChevronLeft,
  User,
  AlertCircle,
  Truck,
  FileCheck,
  Layers,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import { toPersianDigits } from '@/lib/utils';

interface BusinessRegistrationScreenProps {
  onSuccess: (newBusinessId: string) => void;
  onCancel: () => void;
}

export const BusinessRegistrationScreen: React.FC<BusinessRegistrationScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [districtId, setDistrictId] = useState('baharan');
  const [addressFa, setAddressFa] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState('6');
  const [mainCategory, setMainCategory] = useState<MainCategoryId>('automotive');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([
    'mechanic',
  ]);
  const [hasOnsite, setHasOnsite] = useState(true);
  const [hasTowing, setHasTowing] = useState(false);
  const [bio, setBio] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeMainMeta = MAIN_SERVICE_CATEGORIES.find((m) => m.id === mainCategory);

  const toggleSubcategory = (subId: string) => {
    telegramService.triggerHaptic('light');
    if (selectedSubcategories.includes(subId)) {
      if (selectedSubcategories.length === 1) return;
      setSelectedSubcategories(selectedSubcategories.filter((c) => c !== subId));
    } else {
      setSelectedSubcategories([...selectedSubcategories, subId]);
    }
  };

  const handleMainCategoryChange = (newCat: MainCategoryId) => {
    setMainCategory(newCat);
    const meta = MAIN_SERVICE_CATEGORIES.find((m) => m.id === newCat);
    if (meta && meta.subcategories && meta.subcategories.length > 0) {
      setSelectedSubcategories([meta.subcategories[0].id]);
    } else {
      setSelectedSubcategories([newCat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim()) {
      setErrorMsg('لطفاً نام واحد یا تخصص و نام مدیر را وارد فرمایید.');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setErrorMsg('لطفاً یک شماره تلفن معتبر وارد فرمایید.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    telegramService.triggerHaptic('medium');

    const selectedDistrict = SANANDAJ_DISTRICTS.find((d) => d.id === districtId);
    const districtNameFa = selectedDistrict ? selectedDistrict.nameFa : 'سنندج';

    const newBiz = businessService.register({
      businessNameFa: businessName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      districtId,
      districtNameFa,
      addressFa: addressFa.trim() || `سنندج، ${districtNameFa}`,
      licenseNumber: licenseNumber.trim() || `FND-${Math.floor(1000 + Math.random() * 9000)}`,
      mainCategory,
      categories: selectedSubcategories,
      hasOnsiteService: hasOnsite,
      hasTowingFleet: hasTowing,
      bioFa:
        bio.trim() ||
        `ارائه کلیه خدمات تخصصی ${activeMainMeta?.titleFa || 'فایندو'} با کادر مجرب در سنندج.`,
      yearsInBusiness: Number(yearsInBusiness) || 5,
    });

    telegramService.triggerHaptic('success');
    setIsSubmitting(false);
    onSuccess(newBiz.id);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span>انصراف و بازگشت</span>
        </button>

        <span className="text-xs font-semibold text-cyan-400">
          عضویت رایگان متخصصان و اصناف سنندج در فایندو
        </span>
      </div>

      {/* Free Welcome Credits Banner */}
      <div className="rounded-2xl border border-emerald-900/60 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0b1b14] p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white">
              هدیه ویژه عضویت: ۵ لید رایگان
            </h2>
            <p className="text-[11px] text-slate-400">
              پس از ثبت‌نام، کیف پول شما با ۵ اعتبار شارژ می‌شود تا بدون پرداخت هزینه، مشتریان منطقه خود در سنندج را دریافت کنید.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-slate-800 bg-[#090f1d] p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-white">
            ثبت اطلاعات کسب‌وکار و تخصص در فایندو
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            اطلاعات هویتی و صنفی شما جهت ارزیابی و تطبیق هوشمند درخواست‌های مشتریان سنندج ثبت می‌شود.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              رسته اصلی فعالیت شما در سنندج:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MAIN_SERVICE_CATEGORIES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMainCategoryChange(m.id)}
                  className={`rounded-xl border p-2.5 text-xs font-semibold text-right transition-all flex items-center gap-2 ${
                    mainCategory === m.id
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-sm'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{m.titleFa}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories checklist */}
          {activeMainMeta && activeMainMeta.subcategories && activeMainMeta.subcategories.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">
                تخصص‌ها و زیردسته‌های تحت پوشش شما:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeMainMeta.subcategories.map((sub) => {
                  const isChecked = selectedSubcategories.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubcategory(sub.id)}
                      className={`rounded-xl border p-2.5 text-xs font-medium text-right transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{sub.titleFa}</span>
                      {isChecked && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Business Name & Owner Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                نام کسب‌وکار یا عنوان تخصصی <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="مثال: تاسیسات و تعمیرات تخصصی زاگرس سنندج"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                نام و نام خانوادگی مدیر / استادکار <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="مثال: فاروق امینی"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Phone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                شماره تماس مستقیم (همراه) <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09181710000"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                شماره واتساپ یا تلگرام (جهت اعلان لیدها)
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="09181710000"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none dir-ltr text-left"
              />
            </div>
          </div>

          {/* District and Years */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                محله / محدوده اصلی استقرار در سنندج
              </label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {SANANDAJ_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameFa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                سابقه فعالیت (سال)
              </label>
              <input
                type="number"
                value={yearsInBusiness}
                onChange={(e) => setYearsInBusiness(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                placeholder="6"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              آدرس دقیق کارگاه، دفتر یا مغازه در سنندج
            </label>
            <input
              type="text"
              value={addressFa}
              onChange={(e) => setAddressFa(e.target.value)}
              placeholder="مثال: سنندج، بلوار پاسداران، پایین‌تر از دانشگاه، مجتمع پلاک ۱۲"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Special service flags */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasOnsite}
                onChange={(e) => setHasOnsite(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
              />
              <span>دارای امکان اعزام متخصص و ابزار به محل مشتری در سنندج</span>
            </label>

            {mainCategory === 'automotive' && (
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTowing}
                  onChange={(e) => setHasTowing(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>دارای ناوگان یدک‌کش چرخ‌گیر یا کفی خودروبر</span>
              </label>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              معرفی کوتاه، تجربیات و ضمانت‌های کاری
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="شرح مهارت‌ها، گارانتی قطعات، زمان‌های پاسخگویی و سوابق کاری..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-cyan-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            تکمیل ثبت‌نام و دریافت ۵ لید هدیه در فایندو
          </button>
        </form>
      </div>
    </div>
  );
};
