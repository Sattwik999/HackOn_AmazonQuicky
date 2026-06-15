'use client'

import React from 'react'
import { ShoppingCart, Star, ShieldCheck, Truck } from 'lucide-react'
import { useCart } from '@/components/cart-context'

export interface SerpProduct {
  position: number;
  product_id: string;
  title: string;
  thumbnail: string;
  price: string;
  extracted_price: number;
  rating?: number;
  reviews?: number;
  source?: string;
  delivery?: string;
  asin?: string; // Added ASIN in case you switched to the Amazon Engine
}

interface ProductCardProps {
  product: SerpProduct
}

// Utility for robust Indian Rupee formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  // --- Derived State & Fallbacks ---
  const safeId = product.asin || product.product_id || product.position.toString()
  const isDeal = product.position % 3 === 0 // Mocking "Limited Time Deal"
  const isPrime = product.position % 2 === 0 // Mocking "Prime"
  
  const currentPrice = product.extracted_price || 0
  const originalPrice = isDeal ? Math.round(currentPrice * 1.35) : null
  const discountPercent = originalPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0

  // --- Handlers ---
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation() // Prevents the modal from opening when clicking the button
    
    addToCart({
      id: safeId,
      name: product.title,
      price: currentPrice,
      image: product.thumbnail,
      qty: 1
    })
  }

  return (
    <div className="group relative flex h-full min-h-[500px] flex-col overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-2 hover:border-cyan-200/70 hover:shadow-[0_24px_70px_rgba(8,145,178,0.18)] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/30">
      
      {/* 1. Deal Badge (Top Left) */}
      {isDeal && (
        <div className="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-[#cc0c39] via-[#f97316] to-[#febd69] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white shadow-[0_12px_30px_rgba(204,12,57,0.32)]">
          Limited time deal
        </div>
      )}

      {/* 2. Product Image Container */}
      <div className="relative flex min-h-[300px] w-full shrink-0 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_10%,rgba(14,165,233,0.12),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-5 dark:bg-[radial-gradient(circle_at_50%_10%,rgba(14,165,233,0.16),transparent_34%),linear-gradient(180deg,#1e293b_0%,#0f172a_100%)]">
        <div className="absolute inset-x-8 bottom-5 h-10 rounded-full bg-slate-900/10 blur-2xl dark:bg-cyan-300/10" />
        <img 
          src={product.thumbnail} 
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="relative z-[1] max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-110 dark:mix-blend-normal"
        />
      </div>

      {/* 3. Product Details */}
      <div className="relative flex flex-grow flex-col bg-white/92 p-4 backdrop-blur-xl dark:bg-slate-900/92">
        
        {/* Title */}
        <h3 
          className="mb-2 line-clamp-3 text-[15px] font-semibold leading-snug text-slate-950 transition-colors duration-150 group-hover:text-[#c45500] dark:text-white dark:group-hover:text-[#febd69]"
          title={product.title}
        >
          {product.title}
        </h3>

        {/* Ratings */}
        <div className="mb-2 flex h-5 select-none items-center gap-1.5">
          {product.rating ? (
            <>
              <div className="flex text-[#FFA41C]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(product.rating || 0) ? 'fill-current' : 'fill-none text-gray-200'}
                  />
                ))}
              </div>
              <span className="cursor-pointer text-[12px] font-semibold text-[#007185] hover:text-[#c45500] hover:underline dark:text-cyan-300">
                {product.reviews?.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="text-[11px] text-slate-400">Not yet reviewed</span>
          )}
        </div>

        {/* Pricing */}
        <div className="mb-3 flex flex-col">
          <div className="flex flex-wrap items-baseline gap-1.5">
            {isDeal && (
              <span className="mr-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-sm font-black text-[#cc0c39] dark:bg-rose-500/15">
                -{discountPercent}%
              </span>
            )}
            <span className="text-[28px] font-black leading-none tracking-tight text-slate-950 dark:text-white">
              {formatCurrency(currentPrice)}
            </span>
          </div>

          {originalPrice && (
            <span className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
              M.R.P.: <span className="line-through">{formatCurrency(originalPrice)}</span>
            </span>
          )}
        </div>

        {/* Badges & Meta (Prime, Delivery) */}
        <div className="mb-2 flex items-center gap-2 text-[12px]">
          {isPrime && (
            <span className="inline-flex items-center rounded-full bg-cyan-50 px-2 py-1 text-[12px] font-black italic tracking-tight text-[#00a8e1] ring-1 ring-cyan-100 dark:bg-cyan-400/10 dark:ring-cyan-300/10">
              prime
            </span>
          )}
          <span className="inline-flex min-w-0 items-center gap-1 truncate text-slate-500 dark:text-slate-400">
            <Truck size={13} className="shrink-0" />
            {product.delivery || "FREE Delivery by Amazon"}
          </span>
        </div>

        {/* Trust Indicator */}
        <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-300/10">
          <ShieldCheck size={13} />
          <span>Top Brand Guarantee</span>
        </div>

        {/* Action Button */}
        <div className="mt-auto translate-y-3 rounded-2xl border border-white/70 bg-white/70 p-2 opacity-0 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 dark:border-white/10 dark:bg-slate-800/75">
          <button 
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.title} to cart`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#fcd200]/60 bg-gradient-to-r from-[#ffd814] via-[#ffb84d] to-[#ff8a3d] py-2.5 text-[13px] font-black text-slate-950 shadow-[0_12px_30px_rgba(255,184,77,0.34)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#008296] focus:ring-offset-1 dark:focus:ring-offset-slate-900"
          >
            <ShoppingCart size={15} />
            Add to Basket
          </button>
        </div>

      </div>
    </div>
  )
}
