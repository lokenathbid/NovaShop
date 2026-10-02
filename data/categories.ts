import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'cat-001',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Cutting-edge gadgets, audio, and smart home devices.',
    image: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    productCount: 42,
    featured: true,
  },
  {
    id: 'cat-002',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Premium apparel that blends style with comfort.',
    image: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    productCount: 128,
    featured: true,
  },
  {
    id: 'cat-003',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Elevate any outfit with our curated accessory collection.',
    image: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    productCount: 87,
    featured: true,
  },
  {
    id: 'cat-004',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Transform your space with elegant home essentials.',
    image: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    productCount: 63,
    featured: true,
  },
  {
    id: 'cat-005',
    name: 'Beauty',
    slug: 'beauty',
    description: 'Science-backed skincare and beauty for every routine.',
    image: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
    productCount: 94,
    featured: true,
  },
  {
    id: 'cat-006',
    name: 'Sports',
    slug: 'sports',
    description: 'Performance gear for athletes and fitness enthusiasts.',
    image: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    productCount: 76,
    featured: true,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
