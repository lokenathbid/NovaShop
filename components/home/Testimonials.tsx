'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { testimonials } from '@/data/reviews';

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => {
    setDirection(1);
    setCurrent((c) => (c + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 5000);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-indigo-400 text-sm font-medium mb-2"
        >
          Customer Love
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="font-display text-3xl sm:text-4xl font-bold text-white"
        >
          What Our <span className="gradient-text">Customers Say</span>
        </motion.h2>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl glass border border-white/8 p-8 sm:p-12 min-h-[300px] flex flex-col justify-center">
          {/* Quote icon */}
          <div className="absolute top-6 right-8 text-indigo-500/20">
            <Quote size={80} />
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < testimonials[current].rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-700 fill-slate-700'
                    }
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-slate-300 text-lg leading-relaxed mb-6 italic relative z-10">
                &ldquo;{testimonials[current].text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                  {testimonials[current].name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonials[current].name}</p>
                  <p className="text-slate-500 text-xs">{testimonials[current].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => { prev(); resetInterval(); }}
            aria-label="Previous testimonial"
            className="p-2.5 rounded-xl glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); resetInterval(); }}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => { next(); resetInterval(); }}
            aria-label="Next testimonial"
            className="p-2.5 rounded-xl glass border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
