import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import TrendingProducts from '@/components/home/TrendingProducts';
import PromoBanner from '@/components/home/PromoBanner';
import Benefits from '@/components/home/Benefits';
import Testimonials from '@/components/home/Testimonials';
import Newsletter from '@/components/home/Newsletter';

export const metadata: Metadata = {
  title: 'NovaShop — Premium E-Commerce',
  description:
    'Shop premium electronics, fashion, accessories, and more at NovaShop. Fast delivery. Easy returns. Genuine products.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <TrendingProducts />
      <PromoBanner />
      <Benefits />
      <Testimonials />
      <Newsletter />
    </>
  );
}
