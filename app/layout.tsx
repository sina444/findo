import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const vazir = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazir',
});

export const metadata: Metadata = {
  title: 'فایندو (FINDO) | بازار هوشمند خدمات و متخصصین محلی',
  description: 'پلتفرم هوشمند تطبیق نیازهای خدماتی با کسب‌وکارها و متخصصین محلی با هوش مصنوعی — نیازت رو بگو؛ متخصصش رو پیدا میکنیم',
  openGraph: {
    title: 'فایندو (FINDO) | بازار هوشمند خدمات و متخصصین محلی',
    description: 'نیازت رو بگو؛ متخصصش رو پیدا میکنیم — پلتفرم هوشمند تطبیق خدمات محلی',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فایندو (FINDO) | بازار هوشمند خدمات و متخصصین محلی',
    description: 'نیازت رو بگو؛ متخصصش رو پیدا میکنیم — پلتفرم هوشمند تطبیق خدمات محلی',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.className} suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

