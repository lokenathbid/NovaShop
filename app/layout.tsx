import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NovaShop — Premium E-Commerce',
    template: '%s | NovaShop',
  },
  description:
    'Discover premium electronics, fashion, accessories, beauty, and more at NovaShop. Fast delivery. Easy returns. Genuine products.',
  keywords: ['ecommerce', 'online shopping', 'electronics', 'fashion', 'accessories'],
  openGraph: {
    title: 'NovaShop — Premium E-Commerce',
    description: 'Premium products. Seamless shopping.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-surface-950 text-slate-100 min-h-screen flex flex-col" suppressHydrationWarning>
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
