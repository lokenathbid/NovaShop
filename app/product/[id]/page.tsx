'use client';

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  Shield,
  Star,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatCurrency } from '@/lib/utils';
import ProductRating from '@/components/product/ProductRating';
import ProductGrid from '@/components/product/ProductGrid';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Product, Review } from '@/types';

interface DetailedProduct extends Product {
  reviews?: Review[];
}

function SectionAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-white/8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
      >
        <span className="font-semibold text-white">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-slate-500" />
        ) : (
          <ChevronDown size={16} className="text-slate-500" />
        )}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pb-5 text-slate-400 text-sm leading-relaxed"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [product, setProduct] = useState<DetailedProduct | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addItem, isInCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch product from API
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    async function fetchProductData() {
      try {
        setLoading(true);
        setError(null);
        setNotFoundState(false);

        const res = await fetch(`/api/products/${id}`);
        if (res.status === 404) {
          if (isMounted) setNotFoundState(true);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to load product');
        }

        const data = await res.json();
        const currentProd: DetailedProduct = data.product;

        if (isMounted) {
          setProduct(currentProd);
          setActiveImage(0);

          // Fetch related products based on category
          try {
            const relatedRes = await fetch(
              `/api/products?category=${currentProd.categorySlug}&limit=5`
            );
            if (relatedRes.ok) {
              const relatedData = await relatedRes.json();
              const filtered = (relatedData.products || [])
                .filter((p: Product) => p.id !== currentProd.id)
                .slice(0, 4);
              if (isMounted) setRelated(filtered);
            }
          } catch (relErr) {
            console.error('Failed to load related products:', relErr);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        if (isMounted) {
          setError('Unable to load product details. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProductData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (notFoundState) {
    notFound();
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass rounded-2xl border border-red-500/20 p-8 flex items-center gap-4 text-red-400">
          <AlertCircle size={28} className="flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Product Load Error</h2>
            <p className="text-sm">{error}</p>
            <Link
              href="/shop"
              className="mt-3 inline-block px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 transition-colors"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-6 bg-white/5 rounded w-48 mb-8 animate-pulse" />
        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          <div className="aspect-square rounded-2xl bg-white/5 border border-white/6 animate-pulse" />
          <div className="flex flex-col gap-4">
            <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
            <div className="h-8 bg-white/10 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-white/5 rounded w-32 animate-pulse" />
            <div className="h-10 bg-white/10 rounded w-40 animate-pulse my-2" />
            <div className="h-20 bg-white/5 rounded w-full animate-pulse" />
            <div className="h-12 bg-white/10 rounded w-full animate-pulse mt-4" />
          </div>
        </div>
      </div>
    );
  }

  const inCart = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);
  const productReviews = product.reviews || [];

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariants);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Group variants by type
  const variantGroups =
    product.variants?.reduce<Record<string, typeof product.variants>>((acc, v) => {
      if (!acc[v.type]) acc[v.type] = [];
      acc[v.type]!.push(v);
      return acc;
    }, {}) ?? {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-white transition-colors">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/shop/${product.categorySlug}`}
          className="hover:text-white transition-colors capitalize"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-300 line-clamp-1">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0.6, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-[#12121e]"
            suppressHydrationWarning
          >
            {product.images && product.images[activeImage]?.url ? (
              <img
                src={product.images[activeImage]?.url}
                alt={product.images[activeImage]?.alt ?? product.name}
                className="w-full h-full object-cover"
                suppressHydrationWarning
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                No image available
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {product.isNew && <Badge variant="new">New</Badge>}
              {product.discountPercentage && (
                <Badge variant="sale">-{product.discountPercentage}%</Badge>
              )}
            </div>
          </motion.div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2" suppressHydrationWarning>
              {product.images.map((img, i) => (
                <button
                  key={img.id || i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all relative flex-shrink-0 cursor-pointer ${
                    i === activeImage
                      ? 'border-indigo-500'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  suppressHydrationWarning
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    suppressHydrationWarning
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-indigo-400 text-sm font-medium mb-1">{product.brand}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            {product.name}
          </h1>

          <ProductRating
            rating={product.rating}
            reviewCount={product.reviewCount}
            className="mb-4"
          />

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-white">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-slate-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
                <Badge variant="sale">{product.discountPercentage}% OFF</Badge>
              </>
            )}
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {product.shortDescription}
          </p>

          {/* Variants */}
          {Object.entries(variantGroups).map(([type, variants]) => (
            <div key={type} className="mb-4">
              <p className="text-sm font-medium text-white mb-2 capitalize">{type}</p>
              <div className="flex flex-wrap gap-2">
                {variants?.map((v) => (
                  <button
                    key={v.id}
                    onClick={() =>
                      setSelectedVariants((prev) => ({ ...prev, [type]: v.value }))
                    }
                    disabled={!v.inStock}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-all cursor-pointer ${
                      selectedVariants[type] === v.value
                        ? 'border-indigo-500 bg-indigo-500/20 text-white'
                        : v.inStock
                        ? 'border-white/10 text-slate-300 hover:border-white/30'
                        : 'border-white/5 text-slate-700 cursor-not-allowed line-through'
                    }`}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-slate-400">Quantity</span>
            <div className="flex items-center gap-2 glass rounded-xl border border-white/10 px-3 py-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <span className="text-white font-medium w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
            {product.stockCount && product.stockCount < 20 && (
              <span className="text-xs text-amber-400">Only {product.stockCount} left!</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={handleAddToCart}
              leftIcon={addedToCart ? <Check size={18} /> : <ShoppingCart size={18} />}
              fullWidth
              variant={addedToCart ? 'secondary' : 'primary'}
              size="lg"
            >
              {addedToCart ? 'Added!' : inCart ? 'In Cart' : 'Add to Cart'}
            </Button>
            <Link href="/checkout" className="flex-1">
              <Button variant="accent" size="lg" fullWidth leftIcon={<Zap size={18} />}>
                Buy Now
              </Button>
            </Link>
            <button
              onClick={() => toggleItem(product)}
              aria-label="Wishlist"
              className={`flex-shrink-0 p-3 rounded-xl border transition-all cursor-pointer ${
                wishlisted
                  ? 'border-rose-500/40 bg-rose-500/15 text-rose-400'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
              }`}
            >
              <Heart size={20} className={wishlisted ? 'fill-rose-400' : ''} />
            </button>
          </div>

          {/* Info pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Truck, text: product.shippingInfo ?? 'Free delivery' },
              { icon: RotateCcw, text: product.returnInfo ?? '30-day returns' },
              { icon: Shield, text: 'Genuine product' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-xs text-slate-400"
              >
                <Icon size={13} className="text-indigo-400 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accordions */}
      <div className="max-w-3xl mb-16">
        <SectionAccordion title="Description" defaultOpen>
          <p>{product.description}</p>
        </SectionAccordion>

        {product.specifications && product.specifications.length > 0 && (
          <SectionAccordion title="Specifications">
            <div className="grid grid-cols-2 gap-3">
              {product.specifications.map((spec) => (
                <div key={spec.label} className="flex flex-col">
                  <span className="text-xs text-slate-600 uppercase tracking-wider">
                    {spec.label}
                  </span>
                  <span className="text-slate-300">{spec.value}</span>
                </div>
              ))}
            </div>
          </SectionAccordion>
        )}

        <SectionAccordion
          title={`Customer Reviews (${productReviews.length || product.reviewCount})`}
        >
          {productReviews.length > 0 ? (
            <div className="flex flex-col gap-5 mt-2">
              {productReviews.map((rev) => (
                <div key={rev.id} className="glass rounded-xl p-4 border border-white/6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium text-sm">{rev.userName}</p>
                      <p className="text-xs text-slate-600">{rev.date}</p>
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700 fill-slate-700'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">{rev.title}</p>
                  <p className="text-sm text-slate-400">{rev.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              This product has {product.reviewCount.toLocaleString()} verified reviews with an
              average of {product.rating} stars.
            </p>
          )}
        </SectionAccordion>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="font-display text-2xl font-bold text-white mb-6">Related Products</h2>
          <ProductGrid products={related} className="grid grid-cols-2 lg:grid-cols-4 gap-4" />
        </div>
      )}
    </div>
  );
}
