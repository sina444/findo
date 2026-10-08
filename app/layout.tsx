import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store-context';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Toast } from '@/components/Toast';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'گرین‌هیون — گیاهان، ابزار باغبانی و لوازم فضای باز',
  description: 'گیاهان پریمیوم، ابزار باغبانی، گلدان و لوازم فضای باز را در گرین‌هیون کشف کنید. محصولات دوستدار محیط زیست، گیاهان ارگانیک و تحویل سریع.',
  openGraph: {
    title: 'گرین‌هیون — گیاهان و ابزار باغبانی پریمیوم',
    description: 'گیاهان پریمیوم، ابزار باغبانی و لوازم فضای باز.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.className}>
      <body className="min-h-screen bg-white text-[#20251F] antialiased">
        <StoreProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
