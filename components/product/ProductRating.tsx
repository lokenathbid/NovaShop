'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export default function ProductRating({
  rating,
  reviewCount,
  size = 'md',
  showCount = true,
  className,
}: ProductRatingProps) {
  const starSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <span key={i} className="relative">
              <Star
                size={starSize}
                className="text-slate-700 fill-slate-700"
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: partial ? `${(rating % 1) * 100}%` : '100%' }}
                >
                  <Star
                    size={starSize}
                    className="text-amber-400 fill-amber-400"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className={cn('font-medium text-amber-400', textSize)}>{rating.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && (
        <span className={cn('text-slate-500', textSize)}>({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
}
