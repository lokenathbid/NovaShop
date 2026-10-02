import type { Product } from '@/types';

// Placeholder gradient backgrounds used as product image stand-ins
// In production, swap `images` with real URLs
const PLACEHOLDER = (gradient: string): import('@/types').ProductImage[] => [
  { id: '1', url: gradient, alt: 'Product image 1' },
  { id: '2', url: gradient, alt: 'Product image 2' },
  { id: '3', url: gradient, alt: 'Product image 3' },
];

export const products: Product[] = [
  // ─── Electronics ─────────────────────────────────────────────────────────
  {
    id: 'prod-001',
    name: 'NovaPro X15 Wireless Headphones',
    slug: 'novapro-x15-wireless-headphones',
    category: 'Electronics',
    categorySlug: 'electronics',
    brand: 'NovaTech',
    shortDescription: 'Studio-grade sound with 40-hour battery & active noise cancellation.',
    description:
      'Experience audio like never before with the NovaPro X15. Featuring adaptive active noise cancellation, 40mm custom drivers, and a sleek over-ear design, these headphones deliver pristine highs, rich mids, and deep bass. With 40-hour battery life and fast-charge support, music is always at hand.',
    images: PLACEHOLDER('linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
    price: 8999,
    originalPrice: 12999,
    discountPercentage: 31,
    rating: 4.7,
    reviewCount: 2341,
    inStock: true,
    stockCount: 48,
    isFeatured: true,
    isTrending: true,
    tags: ['headphones', 'wireless', 'audio', 'anc'],
    variants: [
      { id: 'v1', name: 'Color', value: 'Midnight Black', type: 'color', inStock: true },
      { id: 'v2', name: 'Color', value: 'Pearl White', type: 'color', inStock: true },
      { id: 'v3', name: 'Color', value: 'Cobalt Blue', type: 'color', inStock: false },
    ],
    specifications: [
      { label: 'Driver Size', value: '40mm' },
      { label: 'Frequency Response', value: '20Hz–20kHz' },
      { label: 'Battery Life', value: '40 hours' },
      { label: 'Connectivity', value: 'Bluetooth 5.3' },
      { label: 'Weight', value: '250g' },
      { label: 'Noise Cancellation', value: 'Adaptive ANC' },
    ],
    shippingInfo: 'Free delivery in 2–4 business days.',
    returnInfo: '30-day hassle-free returns.',
  },
  {
    id: 'prod-002',
    name: 'PixelView 4K Smart Watch Ultra',
    slug: 'pixelview-4k-smart-watch-ultra',
    category: 'Electronics',
    categorySlug: 'electronics',
    brand: 'PixelView',
    shortDescription: 'Health, fitness, and style — all on your wrist.',
    description:
      'The PixelView Smart Watch Ultra packs a 1.9" AMOLED display, continuous heart rate monitoring, SpO2 tracking, GPS, and a 7-day battery into an ultra-slim titanium chassis. Swim-proof to 50m, it seamlessly tracks your workouts and keeps you connected.',
    images: PLACEHOLDER('linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'),
    price: 24999,
    originalPrice: 34999,
    discountPercentage: 29,
    rating: 4.5,
    reviewCount: 1892,
    inStock: true,
    isFeatured: true,
    isBestseller: true,
    tags: ['smartwatch', 'fitness', 'health', 'wearable'],
    variants: [
      { id: 'v1', name: 'Color', value: 'Titanium Silver', type: 'color', inStock: true },
      { id: 'v2', name: 'Color', value: 'Midnight Black', type: 'color', inStock: true },
      { id: 'v3', name: 'Color', value: 'Rose Gold', type: 'color', inStock: true },
    ],
    specifications: [
      { label: 'Display', value: '1.9" AMOLED' },
      { label: 'Battery', value: '7 days' },
      { label: 'Water Resistance', value: '50m' },
      { label: 'Connectivity', value: 'GPS + Bluetooth 5.2' },
      { label: 'Sensors', value: 'HR, SpO2, Temp, Gyro' },
    ],
    shippingInfo: 'Free delivery in 2–4 business days.',
    returnInfo: '30-day hassle-free returns.',
  },
  {
    id: 'prod-003',
    name: 'LumaShot Pro Camera Drone',
    slug: 'lumashot-pro-camera-drone',
    category: 'Electronics',
    categorySlug: 'electronics',
    brand: 'LumaShot',
    shortDescription: '4K/60fps aerial photography with 35-min flight time.',
    description:
      'The LumaShot Pro is engineered for professionals who demand quality. Its 1/2" CMOS sensor captures 4K/60fps footage with HDR, while the 3-axis mechanical gimbal eliminates shake. Obstacle avoidance, intelligent flight modes, and 35 minutes of flight time make every shot perfect.',
    images: PLACEHOLDER('linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'),
    price: 54999,
    originalPrice: 64999,
    discountPercentage: 15,
    rating: 4.8,
    reviewCount: 743,
    inStock: true,
    isFeatured: true,
    tags: ['drone', 'camera', '4k', 'photography'],
    specifications: [
      { label: 'Sensor', value: '1/2" CMOS 48MP' },
      { label: 'Video', value: '4K @ 60fps HDR' },
      { label: 'Flight Time', value: '35 minutes' },
      { label: 'Range', value: '10km' },
      { label: 'Stabilization', value: '3-axis gimbal' },
    ],
    shippingInfo: 'Free delivery in 3–5 business days.',
    returnInfo: '15-day returns (unopened).',
  },
  {
    id: 'prod-004',
    name: 'SoundBar X9 Immersive Home Theater',
    slug: 'soundbar-x9-home-theater',
    category: 'Electronics',
    categorySlug: 'electronics',
    brand: 'NovaTech',
    shortDescription: 'Dolby Atmos soundbar with wireless subwoofer for cinematic audio.',
    description:
      'Fill your room with rich, three-dimensional sound. The SoundBar X9 delivers 300W of total power, supports Dolby Atmos and DTS:X, and pairs effortlessly with its wireless subwoofer for earth-shaking bass. HDMI eARC, optical, and Bluetooth connectivity cover every source.',
    images: PLACEHOLDER('linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'),
    price: 19999,
    originalPrice: 27999,
    discountPercentage: 29,
    rating: 4.4,
    reviewCount: 521,
    inStock: true,
    isTrending: true,
    tags: ['soundbar', 'home theater', 'audio', 'dolby atmos'],
    specifications: [
      { label: 'Power', value: '300W' },
      { label: 'Channels', value: '3.1 with wireless sub' },
      { label: 'Audio Formats', value: 'Dolby Atmos, DTS:X' },
      { label: 'Connectivity', value: 'HDMI eARC, Optical, BT 5.0' },
    ],
    shippingInfo: 'Free delivery in 2–4 business days.',
    returnInfo: '30-day hassle-free returns.',
  },

  // ─── Fashion ──────────────────────────────────────────────────────────────
  {
    id: 'prod-005',
    name: 'UrbanEdge Slim-Fit Bomber Jacket',
    slug: 'urbanedge-slim-fit-bomber-jacket',
    category: 'Fashion',
    categorySlug: 'fashion',
    brand: 'UrbanEdge',
    shortDescription: 'Premium nylon bomber with ribbed cuffs and satin lining.',
    description:
      'Turn heads wherever you go in the UrbanEdge Slim-Fit Bomber Jacket. Crafted from premium ripstop nylon with a luxurious satin lining, it features contrast ribbed cuffs, a sleek front zip, and a flattering slim silhouette. Available in versatile colourways for every aesthetic.',
    images: PLACEHOLDER('linear-gradient(135deg, #fa709a 0%, #fee140 100%)'),
    price: 3999,
    originalPrice: 5999,
    discountPercentage: 33,
    rating: 4.6,
    reviewCount: 1123,
    inStock: true,
    isFeatured: true,
    isBestseller: true,
    tags: ['jacket', 'bomber', 'fashion', 'streetwear'],
    variants: [
      { id: 'v1', name: 'Size', value: 'S', type: 'size', inStock: true },
      { id: 'v2', name: 'Size', value: 'M', type: 'size', inStock: true },
      { id: 'v3', name: 'Size', value: 'L', type: 'size', inStock: true },
      { id: 'v4', name: 'Size', value: 'XL', type: 'size', inStock: false },
      { id: 'v5', name: 'Color', value: 'Jet Black', type: 'color', inStock: true },
      { id: 'v6', name: 'Color', value: 'Olive Green', type: 'color', inStock: true },
      { id: 'v7', name: 'Color', value: 'Navy Blue', type: 'color', inStock: true },
    ],
    shippingInfo: 'Free delivery in 3–5 business days.',
    returnInfo: '30-day hassle-free returns.',
  },
  {
    id: 'prod-006',
    name: 'LuxeKnit Cashmere Turtleneck',
    slug: 'luxeknit-cashmere-turtleneck',
    category: 'Fashion',
    categorySlug: 'fashion',
    brand: 'LuxeKnit',
    shortDescription: '100% Grade A Mongolian cashmere — unparalleled softness.',
    description:
      'Experience the pinnacle of comfort with our pure-cashmere turtleneck. Made from Grade A Mongolian cashmere, it delivers warmth without bulk and a buttery-soft feel that only improves with wear. A timeless wardrobe essential, available in muted, elegant tones.',
    images: PLACEHOLDER('linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'),
    price: 5499,
    originalPrice: 7999,
    discountPercentage: 31,
    rating: 4.9,
    reviewCount: 876,
    inStock: true,
    isTrending: true,
    tags: ['cashmere', 'sweater', 'luxury', 'fashion'],
    variants: [
      { id: 'v1', name: 'Size', value: 'XS', type: 'size', inStock: true },
      { id: 'v2', name: 'Size', value: 'S', type: 'size', inStock: true },
      { id: 'v3', name: 'Size', value: 'M', type: 'size', inStock: true },
      { id: 'v4', name: 'Size', value: 'L', type: 'size', inStock: true },
    ],
    shippingInfo: 'Free delivery in 3–5 business days.',
    returnInfo: '30-day hassle-free returns.',
  },

  // ─── Accessories ──────────────────────────────────────────────────────────
  {
    id: 'prod-007',
    name: 'Meridian Minimal Leather Wallet',
    slug: 'meridian-minimal-leather-wallet',
    category: 'Accessories',
    categorySlug: 'accessories',
    brand: 'Meridian',
    shortDescription: 'RFID-blocking slim wallet in full-grain vegetable-tanned leather.',
    description:
      'The Meridian Wallet is hand-stitched from full-grain vegetable-tanned leather that develops a beautiful patina over time. Slim enough for any pocket, it holds up to 6 cards plus notes, and features built-in RFID blocking to keep your data secure.',
    images: PLACEHOLDER('linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'),
    price: 1499,
    originalPrice: 2499,
    discountPercentage: 40,
    rating: 4.8,
    reviewCount: 2109,
    inStock: true,
    isBestseller: true,
    isTrending: true,
    tags: ['wallet', 'leather', 'accessories', 'rfid'],
    variants: [
      { id: 'v1', name: 'Color', value: 'Tan', type: 'color', inStock: true },
      { id: 'v2', name: 'Color', value: 'Espresso', type: 'color', inStock: true },
      { id: 'v3', name: 'Color', value: 'Midnight', type: 'color', inStock: true },
    ],
    shippingInfo: 'Free delivery in 2–4 business days.',
    returnInfo: '30-day hassle-free returns.',
  },
  {
    id: 'prod-008',
    name: 'Helio Titanium Sunglasses',
    slug: 'helio-titanium-sunglasses',
    category: 'Accessories',
    categorySlug: 'accessories',
    brand: 'Helio',
    shortDescription: 'Ultralight titanium frames with UV400 polarised lenses.',
    description:
      'Helio Sunglasses feature aerospace-grade titanium frames weighing just 18g, making them virtually weightless. Polarised UV400 lenses eliminate glare while providing 100% UV protection. A flexible spring hinge ensures a perfect fit for any face shape.',
    images: PLACEHOLDER('linear-gradient(135deg, #30cfd0 0%, #330867 100%)'),
    price: 4999,
    originalPrice: 6999,
    discountPercentage: 29,
    rating: 4.6,
    reviewCount: 654,
    inStock: true,
    isFeatured: true,
    tags: ['sunglasses', 'titanium', 'accessories', 'eyewear'],
    specifications: [
      { label: 'Frame Material', value: 'Aerospace Titanium' },
      { label: 'Lens Type', value: 'Polarised UV400' },
      { label: 'Weight', value: '18g' },
      { label: 'Hinge', value: 'Flexible Spring' },
    ],
    shippingInfo: 'Free delivery in 2–4 business days.',
    returnInfo: '30-day hassle-free returns.',
  },

  // ─── Home & Living ────────────────────────────────────────────────────────
  {
    id: 'prod-009',
    name: 'Aura Smart LED Desk Lamp',
    slug: 'aura-smart-led-desk-lamp',
    category: 'Home & Living',
    categorySlug: 'home-living',
    brand: 'Aura',
    shortDescription: 'Adaptive brightness, Qi wireless charging, and USB-C hub built in.',
    description:
      "The Aura Smart Lamp isn't just a light — it's a productivity station. Features an adaptive brightness sensor that adjusts to ambient light, 4 colour temperature modes, a 10W Qi wireless charging pad at the base, two USB-A ports, and a USB-C port. Sleek, minimal, and powerful.",
    images: PLACEHOLDER('linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'),
    price: 3499,
    originalPrice: 4999,
    discountPercentage: 30,
    rating: 4.7,
    reviewCount: 1345,
    inStock: true,
    isFeatured: true,
    isTrending: true,
    tags: ['lamp', 'desk', 'smart', 'home', 'charging'],
    specifications: [
      { label: 'Brightness', value: '400 lux (adaptive)' },
      { label: 'Colour Temp', value: '2700K–6500K' },
      { label: 'Wireless Charging', value: '10W Qi' },
      { label: 'USB Ports', value: '2× USB-A, 1× USB-C' },
    ],
    shippingInfo: 'Free delivery in 2–4 business days.',
    returnInfo: '30-day hassle-free returns.',
  },
  {
    id: 'prod-010',
    name: 'Serenity Linen Bedding Set',
    slug: 'serenity-linen-bedding-set',
    category: 'Home & Living',
    categorySlug: 'home-living',
    brand: 'Serenity Home',
    shortDescription: '100% stonewashed French linen — naturally cooling and durable.',
    description:
      'Sleep in luxury with the Serenity Linen Bedding Set. Made from 100% French flax stonewashed linen, it gets softer with every wash, regulates temperature naturally, and offers a casually elegant look. Includes 1 duvet cover, 2 pillow covers, and 1 fitted sheet.',
    images: PLACEHOLDER('linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'),
    price: 6999,
    originalPrice: 9999,
    discountPercentage: 30,
    rating: 4.8,
    reviewCount: 892,
    inStock: true,
    isBestseller: true,
    tags: ['bedding', 'linen', 'home', 'sleep'],
    variants: [
      { id: 'v1', name: 'Size', value: 'Queen', type: 'size', inStock: true },
      { id: 'v2', name: 'Size', value: 'King', type: 'size', inStock: true },
      { id: 'v3', name: 'Color', value: 'Cloud White', type: 'color', inStock: true },
      { id: 'v4', name: 'Color', value: 'Sage Green', type: 'color', inStock: true },
      { id: 'v5', name: 'Color', value: 'Dusty Rose', type: 'color', inStock: true },
    ],
    shippingInfo: 'Free delivery in 3–5 business days.',
    returnInfo: '30-day hassle-free returns.',
  },

  // ─── Beauty ───────────────────────────────────────────────────────────────
  {
    id: 'prod-011',
    name: 'GlowLab Vitamin C Serum Pro',
    slug: 'glowlab-vitamin-c-serum-pro',
    category: 'Beauty',
    categorySlug: 'beauty',
    brand: 'GlowLab',
    shortDescription: '20% Vitamin C + Hyaluronic Acid for radiant, youthful skin.',
    description:
      'Formulated with stabilised 20% L-Ascorbic Acid, the GlowLab Vitamin C Serum Pro brightens, firms, and protects your skin. Combined with hyaluronic acid for deep hydration and ferulic acid for antioxidant synergy, this serum visibly reduces dark spots in 4 weeks.',
    images: PLACEHOLDER('linear-gradient(135deg, #f6d365 0%, #fda085 100%)'),
    price: 1299,
    originalPrice: 1799,
    discountPercentage: 28,
    rating: 4.6,
    reviewCount: 3421,
    inStock: true,
    isBestseller: true,
    isTrending: true,
    tags: ['serum', 'vitamin c', 'skincare', 'beauty'],
    shippingInfo: 'Free delivery in 2–4 business days.',
    returnInfo: '30-day hassle-free returns.',
  },
  {
    id: 'prod-012',
    name: 'ArcBlaze Ionic Hair Dryer Pro',
    slug: 'arcblaze-ionic-hair-dryer-pro',
    category: 'Beauty',
    categorySlug: 'beauty',
    brand: 'ArcBlaze',
    shortDescription: '2400W professional ionic dryer for salon-quality blowouts.',
    description:
      'The ArcBlaze Ionic Hair Dryer Pro delivers a 2400W motor and negative ion technology to reduce frizz and enhance shine. Its lightweight, ergonomic handle and 3-heat/2-speed settings ensure comfortable, fast drying while protecting hair from heat damage.',
    images: PLACEHOLDER('linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)'),
    price: 2999,
    originalPrice: 4499,
    discountPercentage: 33,
    rating: 4.5,
    reviewCount: 1678,
    inStock: true,
    isFeatured: true,
    tags: ['hair dryer', 'ionic', 'beauty', 'salon'],
    shippingInfo: 'Free delivery in 2–4 business days.',
    returnInfo: '30-day hassle-free returns.',
  },

  // ─── Sports ───────────────────────────────────────────────────────────────
  {
    id: 'prod-013',
    name: 'ApexRun Carbon Trail Runners',
    slug: 'apexrun-carbon-trail-runners',
    category: 'Sports',
    categorySlug: 'sports',
    brand: 'ApexRun',
    shortDescription: 'Carbon-plate trail runners with rocker geometry for maximum efficiency.',
    description:
      'Built for the relentless trail runner, the ApexRun Carbon features a full-length carbon-fibre plate, grippy Vibram® Megagrip outsole, and breathable mesh upper. Rocker geometry reduces fatigue on technical terrain while keeping you fast and responsive.',
    images: PLACEHOLDER('linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'),
    price: 11999,
    originalPrice: 15999,
    discountPercentage: 25,
    rating: 4.7,
    reviewCount: 923,
    inStock: true,
    isFeatured: true,
    isTrending: true,
    tags: ['running shoes', 'trail', 'carbon plate', 'sports'],
    variants: [
      { id: 'v1', name: 'Size', value: 'UK 7', type: 'size', inStock: true },
      { id: 'v2', name: 'Size', value: 'UK 8', type: 'size', inStock: true },
      { id: 'v3', name: 'Size', value: 'UK 9', type: 'size', inStock: true },
      { id: 'v4', name: 'Size', value: 'UK 10', type: 'size', inStock: true },
      { id: 'v5', name: 'Size', value: 'UK 11', type: 'size', inStock: false },
    ],
    shippingInfo: 'Free delivery in 3–5 business days.',
    returnInfo: '30-day hassle-free returns.',
  },
  {
    id: 'prod-014',
    name: 'CoreForce Adjustable Dumbbells',
    slug: 'coreforce-adjustable-dumbbells',
    category: 'Sports',
    categorySlug: 'sports',
    brand: 'CoreForce',
    shortDescription: 'Replaces 15 dumbbell pairs — quick-select dial from 2.5kg to 24kg.',
    description:
      'The CoreForce Adjustable Dumbbells replace an entire rack with a single pair. The innovative quick-select dial allows instant weight adjustments from 2.5kg to 24kg in 2.5kg increments. Durable steel with anti-scratch coating, compact storage tray included.',
    images: PLACEHOLDER('linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'),
    price: 14999,
    originalPrice: 19999,
    discountPercentage: 25,
    rating: 4.8,
    reviewCount: 2341,
    inStock: true,
    isBestseller: true,
    tags: ['dumbbells', 'weights', 'fitness', 'sports', 'home gym'],
    specifications: [
      { label: 'Weight Range', value: '2.5kg – 24kg per dumbbell' },
      { label: 'Increments', value: '2.5kg' },
      { label: 'Replaces', value: '15 pairs of dumbbells' },
      { label: 'Material', value: 'Steel with anti-scratch coating' },
    ],
    shippingInfo: 'Free delivery in 3–5 business days.',
    returnInfo: '30-day hassle-free returns.',
  },
  {
    id: 'prod-015',
    name: 'ZenFlow Premium Yoga Mat',
    slug: 'zenflow-premium-yoga-mat',
    category: 'Sports',
    categorySlug: 'sports',
    brand: 'ZenFlow',
    shortDescription: '6mm natural rubber mat with alignment lines and carry strap.',
    description:
      'The ZenFlow Premium Yoga Mat is crafted from natural rubber with a microfibre top layer for exceptional grip in any position. The 6mm thickness cushions joints while maintaining ground feel. Printed alignment lines guide your practice, and the included carry strap makes transport effortless.',
    images: PLACEHOLDER('linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)'),
    price: 2499,
    originalPrice: 3499,
    discountPercentage: 29,
    rating: 4.6,
    reviewCount: 1567,
    inStock: true,
    isNew: true,
    tags: ['yoga', 'mat', 'fitness', 'sports', 'wellness'],
    variants: [
      { id: 'v1', name: 'Color', value: 'Midnight Teal', type: 'color', inStock: true },
      { id: 'v2', name: 'Color', value: 'Blush Pink', type: 'color', inStock: true },
      { id: 'v3', name: 'Color', value: 'Slate Grey', type: 'color', inStock: true },
    ],
    shippingInfo: 'Free delivery in 2–4 business days.',
    returnInfo: '30-day hassle-free returns.',
  },
  {
    id: 'prod-016',
    name: 'AeroPlus Portable Blender',
    slug: 'aeroplus-portable-blender',
    category: 'Home & Living',
    categorySlug: 'home-living',
    brand: 'AeroPlus',
    shortDescription: '500ml USB-C rechargeable blender with 6 stainless steel blades.',
    description:
      'Take your nutrition on the go with the AeroPlus Portable Blender. Its 500ml BPA-free Tritan jar houses 6 stainless-steel blades powered by a 150W motor. USB-C rechargeable with 25 blending cycles per charge, it crushes ice, frozen fruit, and protein powder with ease.',
    images: PLACEHOLDER('linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'),
    price: 1999,
    originalPrice: 2999,
    discountPercentage: 33,
    rating: 4.4,
    reviewCount: 892,
    inStock: true,
    isNew: true,
    isTrending: true,
    tags: ['blender', 'portable', 'kitchen', 'home', 'nutrition'],
    variants: [
      { id: 'v1', name: 'Color', value: 'White', type: 'color', inStock: true },
      { id: 'v2', name: 'Color', value: 'Teal', type: 'color', inStock: true },
      { id: 'v3', name: 'Color', value: 'Black', type: 'color', inStock: true },
    ],
    shippingInfo: 'Free delivery in 2–4 business days.',
    returnInfo: '30-day hassle-free returns.',
  },
];

// ─── Utility Functions ────────────────────────────────────────────────────────

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured);
}

export function getTrendingProducts(): Product[] {
  return products.filter((p) => p.isTrending);
}

export function getBestsellerProducts(): Product[] {
  return products.filter((p) => p.isBestseller);
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.isNew);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q),
  );
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, limit);
}

export function sortProducts(prods: Product[], sort: string): Product[] {
  const arr = [...prods];
  switch (sort) {
    case 'price_asc':
      return arr.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return arr.sort((a, b) => b.price - a.price);
    case 'rating':
      return arr.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return arr.filter((p) => p.isNew).concat(arr.filter((p) => !p.isNew));
    case 'popular':
      return arr.sort((a, b) => b.reviewCount - a.reviewCount);
    default:
      return arr.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }
}
