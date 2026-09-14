import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toPersianDigits(input?: string | number | null): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[+w]);
}

export function formatPriceToman(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'توافقی';
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formatted} تومان`;
}

export function getTimeAgoFa(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'همین الان';
    if (mins < 60) return `${toPersianDigits(mins)} دقیقه پیش`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${toPersianDigits(hours)} ساعت پیش`;
    const days = Math.floor(hours / 24);
    return `${toPersianDigits(days)} روز پیش`;
  } catch {
    return 'به‌تازگی';
  }
}

export function getUrgencyBadge(urgency: 'emergency' | 'today' | 'flexible'): {
  labelFa: string;
  className: string;
} {
  switch (urgency) {
    case 'emergency':
      return {
        labelFa: 'فوری / اضطراری',
        className: 'bg-rose-950/70 text-rose-300 border border-rose-800/80',
      };
    case 'today':
      return {
        labelFa: 'امروز (تا چند ساعت آینده)',
        className: 'bg-amber-950/70 text-amber-300 border border-amber-800/80',
      };
    case 'flexible':
      return {
        labelFa: 'عادی / منعطف',
        className: 'bg-slate-800/80 text-slate-300 border border-slate-700',
      };
  }
}

export function getStatusInfo(status: string): { labelFa: string; className: string } {
  switch (status) {
    case 'created':
      return { labelFa: 'در انتظار تطبیق', className: 'bg-slate-800 text-slate-300 border-slate-700' };
    case 'dispatched':
      return { labelFa: 'ارسال شده به متخصصان', className: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/70' };
    case 'accepted':
      return { labelFa: 'پذیرفته شده توسط متخصص', className: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/70' };
    case 'in_progress':
      return { labelFa: 'در حال انجام تعمیر', className: 'bg-blue-950/80 text-blue-300 border-blue-800/70' };
    case 'completed':
      return { labelFa: 'تکمیل شده', className: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    case 'cancelled':
      return { labelFa: 'لغو شده', className: 'bg-rose-950/80 text-rose-300 border-rose-900/60' };
    default:
      return { labelFa: status, className: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
  }
}

