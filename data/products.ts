import type { Product } from '@/types';

// Real Unsplash image URLs per product (3 images each)
const IMG = (urls: [string, string, string], alt: string): import('@/types').ProductImage[] => [
  { id: '1', url: urls[0], alt: `${alt} - view 1` },
  { id: '2', url: urls[1], alt: `${alt} - view 2` },
  { id: '3', url: urls[2], alt: `${alt} - view 3` },
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
    images: IMG(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80','https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80','https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'], 'NovaPro X15 Wireless Headphones'),
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
    images: IMG(['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80','https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80','https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80'], 'PixelView Smart Watch Ultra'),
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
    images: IMG(['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80','https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&q=80','https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&q=80'], 'LumaShot Pro Camera Drone'),
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
    images: IMG(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80','https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80','https://images.unsplash.com/photo-1563884072595-01adcf975f3e?w=800&q=80'], 'SoundBar X9 Home Theater'),
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
    images: IMG(['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80','https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'], 'UrbanEdge Slim-Fit Bomber Jacket'),
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
    images: IMG(['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80','https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80','https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=800&q=80'], 'LuxeKnit Cashmere Turtleneck'),
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
    images: IMG(['https://images.unsplash.com/photo-1627123424574-724758594785?w=800&q=80','https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800&q=80','https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'], 'Meridian Minimal Leather Wallet'),
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
    images: IMG(['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80','https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=800&q=80','https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800&q=80'], 'Helio Titanium Sunglasses'),
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
    images: IMG(['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80','https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80','https://images.unsplash.com/photo-1555661530-68c8e98db4e6?w=800&q=80'], 'Aura Smart LED Desk Lamp'),
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
    images: IMG(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80','https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=800&q=80','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80'], 'Serenity Linen Bedding Set'),
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
    images: IMG(['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80','https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80','https://images.unsplash.com/photo-1570194065650-d99fb4d8b09a?w=800&q=80'], 'GlowLab Vitamin C Serum Pro'),
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
    images: IMG(['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80','https://images.unsplash.com/photo-1630340238843-9a11bf6a5a5a?w=800&q=80','https://images.unsplash.com/photo-1527799820374-87776dcd5570?w=800&q=80'], 'ArcBlaze Ionic Hair Dryer Pro'),
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
    images: IMG(['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80','https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80','https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80'], 'ApexRun Carbon Trail Runners'),
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
    images: IMG(['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80','https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80'], 'CoreForce Adjustable Dumbbells'),
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
    images: IMG(['https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80','https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80','https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80'], 'ZenFlow Premium Yoga Mat'),
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
    images: IMG(['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80','https://images.unsplash.com/photo-1612187951501-9ddddfaa5bf5?w=800&q=80','https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80'], 'AeroPlus Portable Blender'),
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
