'use client';

import React, { useState } from 'react';
import { CreditPackage, BusinessProfile } from '@/types/findo';
import { paymentService } from '@/services/paymentService';
import { businessService } from '@/services/businessService';
import {
  CreditCard,
  Coins,
  CheckCircle2,
  Zap,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  Loader2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { telegramService } from '@/services/telegramService';
import { formatPriceToman, toPersianDigits } from '@/lib/utils';

interface PricingScreenProps {
  activeBusinessId: string;
  onPaymentSuccess?: (creditsAdded: number) => void;
  onBack: () => void;
}

export const PricingScreen: React.FC<PricingScreenProps> = ({
  activeBusinessId,
  onPaymentSuccess,
  onBack,
}) => {
  const packages = paymentService.getPackages();
  const business = businessService.getById(activeBusinessId);

  const [selectedPkg, setSelectedPkg] = useState<CreditPackage>(packages[1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDoneModal, setPaymentDoneModal] = useState<{
    referenceId: string;
    credits: number;
    amount: number;
  } | null>(null);

  const handlePurchase = (pkg: CreditPackage) => {
    setSelectedPkg(pkg);
    setIsProcessing(true);
    telegramService.triggerHaptic('medium');

    setTimeout(() => {
      const result = paymentService.purchaseCredits(activeBusinessId, pkg.id);
      setIsProcessing(false);

      if (result.success && result.transaction) {
        telegramService.triggerHaptic('success');
        setPaymentDoneModal({
          referenceId: result.transaction.id,
          credits: result.transaction.creditsDelta,
          amount: result.transaction.amountToman || pkg.priceToman,
        });
        onPaymentSuccess?.(result.transaction.creditsDelta);
      }
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span>بازگشت به داشبورد</span>
        </button>

        {business && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs">
            <span className="text-slate-400">موجودی فعلی شما:</span>
            <strong className="text-emerald-400 font-black">
              {toPersianDigits(business.credits)} لید
            </strong>
          </div>
        )}
      </div>

      {/* Hero Headline */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300">
          <Coins className="h-3.5 w-3.5" />
          <span>شارژ حساب و دریافت لیدهای اختصاصی</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-white">
          بسته‌های اعتباری ویژه متخصصان و کسب‌وکارهای سنندج در فایندو
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          تنها زمانی هزینه پرداخت می‌کنید که مشتری واقعی با مشکل مشخص در سنندج معرفی شده باشد. بدون هزینه اشتراک ماهانه پنهان.
        </p>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {packages.map((pkg) => {
          const isSelected = selectedPkg.id === pkg.id;
          const creditsCount = pkg.credits ?? pkg.leadsCount;
          const featuresList = pkg.featuresFa ?? pkg.features ?? [];
          const pricePerLead = pkg.pricePerLeadToman ?? Math.round(pkg.priceToman / creditsCount);

          return (
            <div
              key={pkg.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                pkg.isPopular
                  ? 'border-cyan-500 bg-gradient-to-b from-[#0a182c] to-[#060c18] shadow-xl shadow-cyan-500/10 scale-[1.02]'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              {pkg.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-0.5 text-[10px] font-black text-slate-950 shadow-md">
                  محبوب‌ترین انتخاب اصناف سنندج
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">{pkg.titleFa}</h2>
                  <div className="rounded-lg bg-slate-800/80 px-2 py-1 text-xs font-black text-cyan-400">
                    {toPersianDigits(creditsCount)} لید
                  </div>
                </div>

                {(pkg.bonusCredits || 0) > 0 && (
                  <span className="inline-block mt-2 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                    + {toPersianDigits(pkg.bonusCredits!)} لید هدیه اضافی
                  </span>
                )}

                {/* Price Display */}
                <div className="mt-4 border-b border-slate-800 pb-4">
                  <div className="text-2xl font-black text-white">
                    {formatPriceToman(pkg.priceToman)}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    قیمت هر لید خالص: ~{formatPriceToman(pricePerLead)}
                  </span>
                </div>

                {/* Feature checklist */}
                <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                  {featuresList.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePurchase(pkg)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                    pkg.isPopular
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/25 hover:brightness-110'
                      : 'border border-slate-700 bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {isProcessing && selectedPkg.id === pkg.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>اتصال به درگاه بانکی شاپرک...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>خرید و شارژ فوری</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
          <div className="space-y-0.5">
            <h3 className="font-bold text-white">ضمانت بازگشت اعتبار فایندو</h3>
            <p className="text-slate-400">
              اگر شماره تماس مشتری خاموش، نادرست یا غیرواقعی باشد، اعتبار کسر شده به صورت خودکار به کیف پول شما برمی‌گردد.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 shrink-0">
          <span>پرداخت امن شتاب</span>
          <span>•</span>
          <span>فاکتور رسمی صنف</span>
        </div>
      </div>

      {/* Payment Success Invoice Modal */}
      {paymentDoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">پرداخت با موفقیت انجام شد</h3>
              <p className="text-xs text-slate-300">
                اعتبار حساب شما فوراً به‌روزرسانی شد.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>کد پیگیری شاپرک:</span>
                <span className="text-white font-mono">{paymentDoneModal.referenceId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>مبلغ پرداختی:</span>
                <span className="text-white font-bold">{formatPriceToman(paymentDoneModal.amount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>تعداد لید اضافه شده:</span>
                <span className="text-emerald-400 font-bold">
                  {toPersianDigits(paymentDoneModal.credits)} لید جدید
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentDoneModal(null);
                onBack();
              }}
              className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              مشاهده لیدهای آماده در داشبورد
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
