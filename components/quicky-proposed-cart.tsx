'use client'

import { useEffect, useState } from 'react'
import {
  BadgeIndianRupee,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Repeat,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  Minus,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  formatRupees,
  type QuickyAlternative,
  type QuickyCartItem,
  type QuickyCartTier,
  type QuickyResponse,
  type QuickySchedule,
} from '@/lib/quicky'

interface QuickyProposedCartProps {
  proposal: QuickyResponse
  walletBalance: number
  onRemoveItem: (productId: string) => void
  onUpdateQuantity: (productId: string, delta: number) => void
  onApplyAlternative: (alternative: QuickyAlternative) => void
  onCheckoutStart?: (
    mode: 'one_tap' | 'quick',
    summary: string,
    selectedItems: QuickyCartItem[],
    itemSchedules: Record<string, QuickySchedule>,
  ) => void
  onAddToCart?: (items: QuickyCartItem[]) => void
}

const tiers: QuickyCartTier[] = ['economy', 'balanced', 'premium']

const tierCopy: Record<QuickyCartTier, { label: string; accent: string }> = {
  economy: { label: 'Economy', accent: 'from-emerald-300 to-cyan-300' },
  balanced: { label: 'Balanced', accent: 'from-[#ffd814] to-[#febd69]' },
  premium: { label: 'Premium', accent: 'from-fuchsia-300 to-[#00a8e1]' },
}

const scheduleLabels: Record<QuickySchedule, string> = {
  daily: 'Daily',
  every_7_days: 'Weekly',
  every_14_days: 'Fortnightly',
  monthly_first: 'Monthly',
}

export function QuickyProposedCart({
  proposal,
  walletBalance,
  onRemoveItem,
  onUpdateQuantity,
  onApplyAlternative,
  onCheckoutStart,
  onAddToCart,
}: QuickyProposedCartProps) {
  const [activeTier, setActiveTier] = useState<QuickyCartTier>('balanced')
  const [budget, setBudget] = useState(proposal.budget || proposal.total_cost)
  const [reorderConfigs, setReorderConfigs] = useState<Record<string, { enabled: boolean; schedule: QuickySchedule }>>({})
  const [openAlternatives, setOpenAlternatives] = useState<Record<string, boolean>>({})

  const variant = proposal.variants?.[activeTier] || {
    tier: activeTier,
    title: `${tierCopy[activeTier].label} cart`,
    summary: proposal.message,
    cart_items: proposal.cart_items,
    total_cost: proposal.total_cost,
    scores: proposal.scores,
    savings: proposal.savings,
  }

  const optimizedItems = variant.cart_items
  const optimizedTotal = optimizedItems.reduce((sum, item) => sum + item.total_price, 0)
  const walletAfterBuy = Math.max(walletBalance - optimizedTotal, 0)
  const maxBudget = Math.max(proposal.budget || 0, variant.total_cost, optimizedTotal, walletBalance, 1000)
  const budgetUsage = budget ? Math.min(150, Math.round((optimizedTotal / budget) * 100)) : 0
  const savingsTotal = variant.savings.reduce((sum, saving) => sum + saving.potential_savings, 0)

  useEffect(() => {
    setBudget((current) => Math.max(current, optimizedTotal))
  }, [optimizedTotal])

  const handleItemReorderToggle = (productId: string, enabled: boolean) => {
    setReorderConfigs((current) => ({
      ...current,
      [productId]: { enabled, schedule: current[productId]?.schedule || 'every_7_days' },
    }))
  }

  const handleItemScheduleChange = (productId: string, schedule: QuickySchedule) => {
    setReorderConfigs((current) => ({
      ...current,
      [productId]: { enabled: current[productId]?.enabled ?? true, schedule },
    }))
  }

  const toggleAlternatives = (productId: string) => {
    setOpenAlternatives((current) => ({
      ...current,
      [productId]: !current[productId],
    }))
  }

  const startOneTapBuy = () => {
    const schedules = Object.fromEntries(
      Object.entries(reorderConfigs)
        .filter(([, config]) => config.enabled)
        .map(([id, config]) => [id, config.schedule]),
    ) as Record<string, QuickySchedule>

    onCheckoutStart?.('one_tap', 'Proceeding to the Amazon-style checkout flow with your saved address and wallet.', optimizedItems, schedules)
  }

  const startQuickBuy = () => {
    const schedules = Object.fromEntries(
      Object.entries(reorderConfigs)
        .filter(([, config]) => config.enabled)
        .map(([id, config]) => [id, config.schedule]),
    ) as Record<string, QuickySchedule>

    onCheckoutStart?.('quick', 'Quick buy with Amazon-style confirmation and saved address delivery.', optimizedItems, schedules)
  }

  return (
    // ✨ FIX: Added max-w-2xl and mx-auto here to constrain width on desktop ✨
    <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-[22px] border border-white/15 bg-[#101827] text-white shadow-[0_22px_70px_rgba(2,6,23,0.42)]">
      <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(0,168,225,0.22),rgba(255,216,20,0.12),rgba(255,255,255,0.03))] p-2.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {/* <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100 sm:text-[11px]">
              <Sparkles size={12} />
              Commerce Copilot
            </p> */}
            <h3 className="line-clamp-1 mt-1.5 text-base font-black tracking-tight text-white sm:text-lg">{variant.title}</h3>
            {/* <p className="line-clamp-2 mt-1 text-xs leading-5 text-slate-200">{proposal.message}</p> */}
          </div>
          <div className="shrink-0 rounded-xl border border-white/12 bg-white/[0.08] px-2 py-1.5 text-right sm:px-3 sm:py-2">
            <p className="text-[9px] uppercase tracking-[0.16em] text-slate-300 sm:text-[11px]">Live total</p>
            <p className="text-base font-black text-white sm:text-lg">{formatRupees(optimizedTotal)}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-slate-950/30 p-1 sm:gap-2">
          {tiers.map((tier) => {
            const tierVariant = proposal.variants?.[tier]
            const isActive = tier === activeTier
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setActiveTier(tier)}
                aria-pressed={isActive}
                className={`rounded-xl px-1 py-1.5 text-center transition-all focus:outline-none focus:ring-2 focus:ring-cyan-300 sm:px-2 sm:py-2 sm:text-left ${
                  isActive ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span className="block truncate text-[9px] font-black uppercase tracking-[0.12em] sm:text-[11px]">{tierCopy[tier].label}</span>
                <span className="mt-0.5 block truncate text-xs font-black sm:mt-1 sm:text-sm">{formatRupees(tierVariant?.total_cost || 0)}</span>
              </button>
            )
          })}
        </div>

        {/* <div className="mt-3 grid grid-cols-3 gap-1 sm:gap-2">
          <ScorePill label="Value" value={variant.scores.value} />
          <ScorePill label="Quality" value={variant.scores.quality} />
          <ScorePill label="Budget" value={variant.scores.budget_efficiency} />
        </div> */}
      </div>

      <div className="border-b border-white/10 bg-[#0b1220] p-2.5 sm:p-4">
        {/* <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="min-w-0 flex-1 basis-full sm:basis-auto">
            <span className="mb-1.5 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300 sm:text-xs">
              <span>Live budget</span>
              <span className="text-white">{formatRupees(budget)}</span>
            </span>
            <input
              type="range"
              min={100}
              max={maxBudget}
              step={50}
              value={Math.min(budget, maxBudget)}
              onChange={(event) => setBudget(Number(event.target.value))}
              className="h-2 w-full accent-[#ffd814]"
              aria-label="Adjust cart budget"
            />
          </label>
          <div className="relative w-full sm:w-auto">
            <BadgeIndianRupee size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="number"
              value={budget}
              min={100}
              step={50}
              onChange={(event) => setBudget(Math.max(100, Number(event.target.value) || 100))}
              className="h-9 w-full rounded-full border border-white/12 bg-white/[0.07] pl-8 pr-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-cyan-300 sm:h-11 sm:w-28"
              aria-label="Budget amount in rupees"
            />
          </div>
        </div> */}
        {/* {optimizedTotal <= budget ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-200 sm:text-xs">
            <CheckCircle2 size={12} />
            Fits budget with live recalculation.
          </p>
        ) : (
          <p className="mt-2 text-[11px] font-semibold text-amber-200 sm:text-xs">Try a lower tier or apply cheaper swaps to fit this budget.</p>
        )} */}
        {/* <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Meter label="Budget meter" value={budgetUsage} suffix="%" tone={budgetUsage <= 100 ? 'cyan' : 'amber'} />
          <Meter label="Savings meter" value={Math.min(100, Math.round((savingsTotal / Math.max(optimizedTotal, 1)) * 100))} suffix="%" tone="emerald" />
        </div> */}
      </div>

      <div className="space-y-2 p-2.5 sm:p-4">
        {optimizedItems.map((item) => {
          const itemReorder = reorderConfigs[item.product_id] || { enabled: false, schedule: 'every_7_days' as QuickySchedule }
          const alternatives = proposal.alternatives.filter((alternative) => alternative.target_product_id === item.product_id).slice(0, 3)
          const alternativesOpen = Boolean(openAlternatives[item.product_id])
          const bestAlternativeSaving = alternatives.reduce((best, alternative) => Math.max(best, -alternative.price_delta), 0)

          return (
            <article
              key={item.product_id}
              className="group overflow-hidden rounded-[16px] border border-white/10 bg-white/[0.07] shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition-all duration-300 hover:bg-white/[0.1] sm:rounded-[18px]"
            >
              <div className="flex gap-2 p-2 sm:gap-2.5 sm:p-3">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 sm:h-20 sm:w-20 sm:rounded-2xl sm:p-2">
                  {item.savings_badge && (
                    <span className="absolute left-1 top-1 rounded-full bg-[#cc0c39] px-1.5 py-0.5 text-[8px] font-black uppercase text-white sm:left-1.5 sm:top-1.5 sm:text-[9px]">
                      {item.savings_badge}
                    </span>
                  )}
                  <img src={item.image} alt={item.title} className="h-full w-full object-contain mix-blend-multiply" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-1 sm:gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-1 sm:gap-1.5">
                        <span className={`rounded-full bg-gradient-to-r ${tierCopy[activeTier].accent} px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-950 sm:text-[10px]`}>
                          {item.ai_badge || 'AI pick'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/12 px-1.5 py-0.5 text-[9px] font-bold text-emerald-100 sm:text-[10px]">
                          <Clock3 size={10} />
                          {item.delivery_estimate || 'Fast delivery'}
                        </span>
                      </div>
                      <h4 className="line-clamp-2 text-xs font-black leading-snug text-white sm:text-[13px] sm:leading-5">{item.title}</h4>
                      {item.replaced_item && (
                        <div className="mt-1 rounded-xl border border-white/10 bg-black/20 px-2 py-1.5">
                          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-200">Swapped from</p>
                          <div className="mt-1 flex items-center gap-2">
                            <img src={item.replaced_item.image} alt="" className="h-7 w-7 rounded-lg bg-white object-contain p-0.5" />
                            <div className="min-w-0">
                              <p className="truncate text-[10px] font-bold text-slate-200">{item.replaced_item.title}</p>
                              <p className="text-[9px] font-semibold text-slate-400">{formatRupees(item.replaced_item.unit_price)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => onRemoveItem(item.product_id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-rose-500/20 hover:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200 sm:h-8 sm:w-8"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] sm:gap-2 sm:text-[11px]">
                    <div className="inline-flex items-center overflow-hidden rounded-full border border-white/10 bg-white/10">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product_id, -1)}
                        aria-label={`Decrease ${item.title} quantity`}
                        className="flex h-7 w-7 items-center justify-center text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-8 px-2 text-center font-black text-slate-100">Qty {item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product_id, 1)}
                        aria-label={`Increase ${item.title} quantity`}
                        className="flex h-7 w-7 items-center justify-center text-slate-200 transition-colors hover:bg-white/10"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="rounded-full bg-[#ffd814] px-2.5 py-1 font-black text-slate-950">{formatRupees(item.total_price)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 px-2 py-1.5 sm:px-3 sm:py-2">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-xl bg-white/[0.05] px-2 py-1.5 text-[10px] font-semibold text-slate-200 sm:gap-2 sm:px-2.5 sm:py-2 sm:text-[11px]">
                    <input
                      type="checkbox"
                      checked={itemReorder.enabled}
                      onChange={(event) => handleItemReorderToggle(item.product_id, event.target.checked)}
                      className="h-3.5 w-3.5 rounded border-white/20 bg-transparent text-cyan-300 focus:ring-cyan-300 sm:h-4 sm:w-4"
                    />
                    <Repeat size={12} />
                    <span className="truncate">Subscribe</span>
                  </label>
                  {itemReorder.enabled && (
                    <select
                      value={itemReorder.schedule}
                      onChange={(event) => handleItemScheduleChange(item.product_id, event.target.value as QuickySchedule)}
                      className="h-7 rounded-xl border border-white/12 bg-slate-900 px-2 text-[10px] font-bold text-white outline-none focus:ring-2 focus:ring-cyan-300 sm:h-8.5 sm:px-3 sm:text-[11px]"
                    >
                      {Object.entries(scheduleLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  )}
                  {alternatives.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleAlternatives(item.product_id)}
                      aria-expanded={alternativesOpen}
                      className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] px-2.5 text-[10px] font-black text-cyan-100 transition-colors hover:bg-cyan-300/[0.14] focus:outline-none focus:ring-2 focus:ring-cyan-300 sm:h-8.5 sm:px-3 sm:text-[11px]"
                    >
                      <span>Swaps</span>
                      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] leading-none">{alternatives.length}</span>
                      {bestAlternativeSaving > 0 && (
                        <span className="hidden text-emerald-200 sm:inline">Save {formatRupees(bestAlternativeSaving)}</span>
                      )}
                      <ChevronRight size={13} className={`transition-transform ${alternativesOpen ? 'rotate-90' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {alternatives.length > 0 && alternativesOpen && (
                <div className="space-y-1.5 border-t border-white/10 bg-slate-950/24 p-2 sm:space-y-2 sm:p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">Suggested swaps</p>
                    <button
                      type="button"
                      onClick={() => toggleAlternatives(item.product_id)}
                      className="text-[10px] font-bold text-slate-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    >
                      Hide
                    </button>
                  </div>
                  {alternatives.map((alternative) => {
                    const isCheaper = alternative.price_delta < 0
                    return (
                      <button
                        key={alternative.product_id}
                        type="button"
                        onClick={() => onApplyAlternative(alternative)}
                        className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] p-1.5 text-left transition-colors hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-cyan-300 sm:rounded-2xl sm:p-2"
                      >
                        <img src={alternative.image} alt="" className="h-7 w-7 shrink-0 rounded-lg bg-white object-contain p-0.5 sm:h-9 sm:w-9 sm:rounded-xl sm:p-1" />
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-1 text-[10px] font-bold text-white sm:text-[11px]">{alternative.title}</span>
                          <span className={`mt-0.5 flex items-center gap-1 text-[9px] font-black sm:text-[10px] ${isCheaper ? 'text-emerald-200' : 'text-amber-200'}`}>
                            {isCheaper ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                            {isCheaper ? 'Save' : 'Add'} {formatRupees(Math.abs(alternative.price_delta))}
                            <span className="truncate text-slate-400">| {alternative.quality_comparison}</span>
                          </span>
                        </span>
                        <ChevronRight size={14} className="shrink-0 text-slate-400" />
                      </button>
                    )
                  })}
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* {variant.savings.length > 0 && (
        <div className="border-t border-white/10 bg-[#0b1220] p-2.5 sm:p-4">
          <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 sm:mb-3 sm:text-[11px]">Savings engine</p>
          <div className="grid gap-1.5 sm:grid-cols-3 sm:gap-2">
            {variant.savings.slice(0, 3).map((saving) => (
              <div key={`${saving.type}-${saving.title}`} className="rounded-xl border border-emerald-300/15 bg-emerald-300/8 p-2 sm:rounded-2xl sm:p-3">
                <p className="text-[11px] font-black text-emerald-100 sm:text-xs">{saving.title}</p>
                <p className="line-clamp-2 mt-0.5 text-[10px] leading-snug text-emerald-50/75 sm:mt-1 sm:text-[11px] sm:leading-4">{saving.description}</p>
                <p className="mt-1 text-xs font-black text-emerald-200 sm:mt-2 sm:text-sm">{formatRupees(saving.potential_savings)}</p>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* {(proposal.subscription_suggestions?.length || 0) > 0 && (
        <div className="border-t border-white/10 bg-[#081421] p-2.5 sm:p-4">
          <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 sm:mb-3 sm:text-[11px]">Smart subscriptions</p>
          <div className="grid gap-2">
            {proposal.subscription_suggestions.slice(0, 3).map((suggestion) => (
              <div key={suggestion.product_id} className="flex items-center gap-2 rounded-xl border border-cyan-300/15 bg-cyan-300/8 p-2.5">
                <Repeat size={15} className="shrink-0 text-cyan-200" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-black text-white">{suggestion.title}</p>
                  <p className="line-clamp-1 text-[11px] text-cyan-100/80">{suggestion.reason}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-cyan-100">
                  {scheduleLabels[suggestion.schedule]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )} */}

      <div className="border-t border-white/10 bg-[#07101d] p-2.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 sm:gap-3 sm:rounded-2xl sm:px-3.5 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1f2937] text-cyan-100 sm:h-11 sm:w-11">
              <Wallet size={16} className="sm:h-[18px] sm:w-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-xs">Quicky Wallet</p>
              <p className={`truncate text-xs font-black sm:text-sm ${optimizedTotal > walletBalance ? 'text-rose-300' : 'text-white'}`}>
                {formatRupees(walletBalance)} available
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-right sm:px-4 sm:py-2">
            <p className="text-[9px] uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">After buy</p>
            <p className="text-xs font-black text-white sm:text-sm">{formatRupees(walletAfterBuy)}</p>
          </div>
        </div>

        <div className="mt-2.5 grid gap-2 sm:mt-3 sm:grid-cols-3">
          <Button
            onClick={startOneTapBuy}
            disabled={optimizedItems.length === 0}
            className="h-10 rounded-full bg-[#ffd814] text-xs font-black text-slate-950 shadow-[0_12px_30px_rgba(255,216,20,0.2)] hover:bg-[#f7ca00] disabled:opacity-50 sm:h-11 sm:text-sm"
          >
            <ShoppingCart size={16} className="mr-1.5 sm:h-[18px] sm:w-[18px]" />
            Checkout
          </Button>
          <Button
            onClick={startQuickBuy}
            disabled={optimizedTotal > walletBalance || optimizedItems.length === 0}
            className="h-10 rounded-full border border-white/10 bg-white/[0.06] text-xs font-bold text-white hover:bg-white/[0.1] disabled:opacity-50 sm:h-11 sm:text-sm"
          >
            <Wallet size={16} className="mr-1.5 sm:h-[18px] sm:w-[18px]" />
            Quick Buy
          </Button>
          <Button
            onClick={() => onAddToCart?.(optimizedItems)}
            disabled={optimizedItems.length === 0}
            className="h-10 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] text-xs font-bold text-cyan-100 transition-colors hover:bg-cyan-300/[0.14] disabled:opacity-50 sm:h-11 sm:text-sm"
          >
            <Plus size={16} className="mr-1.5 sm:h-[18px] sm:w-[18px]" />
            Add to Cart
          </Button>
        </div>
      </div>
    </section>
  )
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] p-1.5 sm:rounded-2xl sm:p-2">
      <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:justify-between sm:gap-2">
        <span className="w-full truncate text-center text-[8px] font-black uppercase tracking-[0.13em] text-slate-300 sm:text-left sm:text-[10px]">{label}</span>
        <span className="inline-flex items-center gap-1 text-[10px] font-black text-white sm:text-xs">
          <Star size={10} className="fill-[#ffd814] text-[#ffd814] sm:h-[12px] sm:w-[12px]" />
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-700 sm:mt-2 sm:h-1.5">
        <div className="h-full rounded-full bg-[#ffd814]" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function Meter({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: 'cyan' | 'emerald' | 'amber' }) {
  const color = tone === 'emerald' ? 'bg-emerald-300' : tone === 'amber' ? 'bg-amber-300' : 'bg-cyan-300'
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-slate-300">{label}</span>
        <span className="text-xs font-black text-white">{value}{suffix}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  )
}