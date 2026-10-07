import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'cat-001',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Cutting-edge gadgets, audio, and smart home devices.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    productCount: 42,
    featured: true,
  },
  {
    id: 'cat-002',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Premium apparel that blends style with comfort.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    productCount: 128,
    featured: true,
  },
  {
    id: 'cat-003',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Elevate any outfit with our curated accessory collection.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
    productCount: 87,
    featured: true,
  },
  {
    id: 'cat-004',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Transform your space with elegant home essentials.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    productCount: 63,
    featured: true,
  },
  {
    id: 'cat-005',
    name: 'Beauty',
    slug: 'beauty',
    description: 'Science-backed skincare and beauty for every routine.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    productCount: 94,
    featured: true,
  },
  {
    id: 'cat-006',
    name: 'Sports',
    slug: 'sports',
    description: 'Performance gear for athletes and fitness enthusiasts.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    productCount: 76,
    featured: true,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
