'use client'

import { ArrowRight, MessageSquareText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroBannerProps {
  onChatOpen: () => void
}

export function HeroBanner({ onChatOpen }: HeroBannerProps) {
  return (
    <section className="relative isolate min-h-[17rem] overflow-hidden bg-[#05070d] px-4 pb-14 pt-8 text-white sm:px-6 md:min-h-[20rem] md:pb-16 md:pt-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.22),transparent_34%),radial-gradient(circle_at_78%_62%,rgba(254,189,105,0.13),transparent_28%),linear-gradient(135deg,#05070d_0%,#0c1220_48%,#04060b_100%)]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl animate-refined-pulse" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-[1fr_auto]">
        <div className="text-center md:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80 shadow-[0_12px_40px_rgba(8,145,178,0.12)] backdrop-blur-xl animate-hero-fade">
            <Sparkles size={14} className="text-[#febd69]" />
            Amazon Quicky
          </div>

          <h1 className="max-w-3xl text-balance text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl md:text-6xl animate-hero-fade animation-delay-150">
            Ask. Decide.
            <span className="block bg-gradient-to-r from-white via-cyan-100 to-[#febd69] bg-clip-text text-transparent">
              Buy smarter.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-slate-300/85 sm:text-lg md:mx-0 animate-hero-fade animation-delay-300">
            AI-guided product picks, comparisons, and cart-ready answers in seconds.
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-col gap-3 md:mx-0 md:w-auto md:max-w-none">
          <Button
            onClick={onChatOpen}
            className="group h-12 rounded-full border border-white/15 bg-white/10 px-6 text-sm font-bold text-white shadow-[0_18px_50px_rgba(2,6,23,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-white/15 hover:shadow-[0_24px_70px_rgba(8,145,178,0.22),inset_0_1px_0_rgba(255,255,255,0.22)] focus-visible:ring-2 focus-visible:ring-cyan-200/70 md:h-14 md:px-7 animate-hero-fade animation-delay-450"
          >
            Chat With Quicky
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Button>

          <Button
            onClick={onChatOpen}
            variant="outline"
            className="group h-12 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-6 text-sm font-bold text-cyan-50 shadow-[0_12px_36px_rgba(8,145,178,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#febd69]/45 hover:bg-cyan-300/12 hover:text-white md:h-14 md:px-7 animate-hero-fade animation-delay-450"
          >
            Ask Quicky
            <MessageSquareText size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes refined-pulse {
          0%,
          100% {
            opacity: 0.45;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1.08);
          }
        }

        @keyframes hero-fade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-refined-pulse {
          animation: refined-pulse 12s ease-in-out infinite;
        }

        .animate-hero-fade {
          animation: hero-fade 700ms ease-out both;
        }

        .animation-delay-150 {
          animation-delay: 150ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-450 {
          animation-delay: 450ms;
        }
      `}</style>
    </section>
  )
}
