import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store-context';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Toast } from '@/components/Toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'GreenHaven — Premium Plants, Gardening Tools & Outdoor Essentials',
  description: 'Discover premium plants, gardening tools, planters, and outdoor accessories at GreenHaven. Eco-friendly products, organic plants, and fast delivery.',
  openGraph: {
    title: 'GreenHaven — Premium Plants & Gardening',
    description: 'Premium plants, gardening tools, and outdoor essentials.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
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
