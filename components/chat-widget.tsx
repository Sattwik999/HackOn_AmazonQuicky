'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronRight, History, Loader2, Maximize2, Mic, MicOff, Minimize2, Plus, Send, Sparkles, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart-context'
import { useQuicky } from '@/components/quicky-context'
import { QuickyProposedCart } from '@/components/quicky-proposed-cart'
import { Pacifico } from 'next/font/google'
import {
  formatRupees,
  mapQuickyItemsToCart,
  type QuickyAlternative,
  type QuickyCartItem,
  type QuickyPlan,
  type QuickyResponse,
  type QuickySchedule,
} from '@/lib/quicky'

// Initialize the Google Font
const pacifico = Pacifico({ weight: '400', subsets: ['latin'], display: 'swap' })

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  proposal?: QuickyResponse
  actions?: ChatAction[]
}

interface ChatAction {
  label: string
  prompt: string
  mode?: 'plan' | 'cart'
}

type CheckoutMode = 'one_tap' | 'quick'

interface ChatSession {
  id: string
  title: string
  date: Date
  messages: ChatMessage[]
}

interface ChatWidgetProps {
  isOpen: boolean
  onClose: () => void
}

type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'assistant',
  text: 'Tell me what you are shopping for, and I’ll shape it into a cart that feels ready to buy.',
}

const starterPrompts = [
  'Birthday gifts for a 14 year old under ₹2000',
  'Movie night for 4',
  'High fever at home',
  'Biryani ingredients',
  'Hostel essentials for a month',
  'Gym plan groceries for 10 days',
]

const refinementPrompts = [
  'Reduce cost',
  'Premium version',
  'Fit under ₹700',
]

export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showWalletSheet, setShowWalletSheet] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<QuickyPlan | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [customTopUp, setCustomTopUp] = useState('500')
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode | null>(null)
  const [showCheckoutSheet, setShowCheckoutSheet] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'address' | 'payment' | 'confirm'>('review')
  const [checkoutItems, setCheckoutItems] = useState<QuickyCartItem[]>([])
  const [checkoutSchedules, setCheckoutSchedules] = useState<Record<string, QuickySchedule>>({})
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [showOrderPlaced, setShowOrderPlaced] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const checkoutTimerRef = useRef<number | null>(null)
  const messageSeqRef = useRef(0)

  const { addManyToCart, clearCart } = useCart()
  const {
    walletBalance,
    addFunds,
    spendWallet,
    saveSubscription,
    userProfile,
    shoppingHistory,
    budgetProfile,
    favoriteCategories,
    rememberShoppingTrip,
  } = useQuicky()
  
  // Track the most recent cart proposal to display it on the left when expanded
  const latestProposal = [...messages].reverse().find((message) => message.proposal)?.proposal || null
  const showWelcome = messages.length === 1 && !latestProposal
  const createMessageId = (prefix: string) => `${prefix}_${Date.now()}_${messageSeqRef.current++}`

  useEffect(() => {
    if (!showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, showHistory])

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
      if (checkoutTimerRef.current) {
        window.clearTimeout(checkoutTimerRef.current)
      }
    }
  }, [])

  const toggleVoiceInput = () => {
    const SpeechRecognitionCtor = (window as typeof window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition
    }).SpeechRecognition || (window as typeof window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition
    }).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant_voice'),
          sender: 'assistant',
          text: 'Voice input is not supported in this browser.',
        },
      ])
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-IN'

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => Array.from(result).map((item) => item.transcript).join(''))
        .join(' ')
        .trim()
      if (transcript) setInput(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }

  const handleQuickTopUp = (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return
    addFunds(amount)
    setShowWalletSheet(false)
  }

  const handleCustomTopUp = () => {
    handleQuickTopUp(Math.max(1, Number(customTopUp) || 0))
  }

  const beginCheckoutFlow = (mode: CheckoutMode, summary: string, items: QuickyCartItem[] = [], schedules: Record<string, QuickySchedule> = {}) => {
    setCheckoutMode(mode)
    setCheckoutMessage(summary)
    setCheckoutStep('review')
    setCheckoutItems(items)
    setCheckoutSchedules(schedules)
    setShowCheckoutSheet(true)
    setShowOrderPlaced(false)
    setShowWalletSheet(false)
  }

  const completeCheckoutFlow = () => {
    setShowCheckoutSheet(false)
    setShowOrderPlaced(true)
    if (checkoutTimerRef.current) {
      window.clearTimeout(checkoutTimerRef.current)
    }
    checkoutTimerRef.current = window.setTimeout(() => {
      setShowOrderPlaced(false)
      setCheckoutMode(null)
      setCheckoutMessage('')
      checkoutTimerRef.current = null
    }, 7000)
  }

  const handleNewSession = () => {
    if (messages.length > 1) {
      setSessions((current) => [
        {
          id: Date.now().toString(),
          title: messages[1]?.text || 'New Shopping Trip',
          date: new Date(),
          messages: [...messages],
        },
        ...current,
      ])
    }
    setMessages([INITIAL_MESSAGE])
    setPendingPlan(null)
    setShowHistory(false)
    setShowWalletSheet(false)
  }

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages)
    setShowHistory(false)
  }

  const updateLatestProposal = (updater: (proposal: QuickyResponse) => QuickyResponse) => {
    setMessages((current) => {
      const latestProposalIndex = current.findLastIndex((entry) => Boolean(entry.proposal))

      return current.map((message, index) => {
        if (!message.proposal || index !== latestProposalIndex) return message
        return { ...message, proposal: syncBalancedTopLevel(updater(message.proposal)) }
      })
    })
  }

  const handleSend = async (nextPrompt?: string, budget?: number, mode?: 'plan' | 'cart') => {
    const query = (nextPrompt ?? input).trim()
    if (!query || isLoading) return

    setShowHistory(false)
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
    }

    setMessages((current) => [...current, userMessage])
    setInput('')

    if (!mode && pendingPlan && isPlanDecline(query)) {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant_decline'),
          sender: 'assistant',
          text: 'No problem. Tell me what to add or remove, like "add snacks", "keep it under ₹700", or "reduce the budget".',
        },
      ])
      return
    }

    if (!mode && latestProposal && handleLocalCartCommand(query)) {
      return
    }

    setIsLoading(true)

    try {
      const requestMode = mode || (pendingPlan && isConfirmation(query) ? 'cart' : undefined)
      const response = await fetch('/api/quicky', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          budget,
          mode: requestMode,
          plan: pendingPlan,
          previousCart: latestProposal,
          history: [...messages, userMessage].map(({ sender, text }) => ({ sender, text })),
          profile: {
            userProfile,
            shoppingHistory: shoppingHistory.slice(0, 5),
            budgetProfile,
            favoriteCategories,
          },
        }),
      })
      const payload = await response.json()

      if (!response.ok || payload.error) {
        throw new Error(payload.error || 'Quicky could not build a cart right now.')
      }

      if (payload.kind === 'plan') {
        setPendingPlan(payload.plan)
        setMessages((current) => [
          ...current,
          {
            id: `assistant_${Date.now()}`,
            sender: 'assistant',
            text: payload.message,
            actions: buildPlanActions(payload.plan),
          },
        ])
        return
      }

      if (payload.kind === 'assistant') {
        setMessages((current) => [
          ...current,
          {
            id: `assistant_${Date.now()}`,
            sender: 'assistant',
            text: payload.message,
            actions: [
              { label: 'Birthday party', prompt: 'Birthday party for 10 under ₹1500' },
              { label: 'Diwali plan', prompt: 'Diwali snacks and gifts under ₹2500' },
              { label: 'Movie night', prompt: 'Movie night for 5 under ₹800' },
            ],
          },
        ])
        return
      }

      if (payload.kind === 'add_item') {
        const addedItem = payload.item as QuickyCartItem
        updateLatestProposal((proposal) => addItemToProposal(proposal, addedItem))
        setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant_add'),
          sender: 'assistant',
          text: `Added ${addedItem.title} to the cart. I did not remove or rebalance anything.`,
        },
        ])
        return
      }

      setPendingPlan(null)
      setMessages((current) => [
        ...current,
        {
          id: `assistant_${Date.now()}`,
          sender: 'assistant',
          text: payload.result.message,
          proposal: payload.result,
        },
      ])
      rememberShoppingTrip({
        query: payload.query || query,
        totalCost: payload.result.total_cost || 0,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Quicky hit an unexpected error.'
      setMessages((current) => [
        ...current,
        {
          id: `assistant_error_${Date.now()}`,
          sender: 'assistant',
          text: message,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveItem = (productId: string) => {
    updateLatestProposal((proposal) => {
      const variants = { ...proposal.variants }
      for (const tier of Object.keys(variants) as Array<keyof typeof variants>) {
        const cartItems = variants[tier].cart_items.filter((item) => item.product_id !== productId)
        variants[tier] = {
          ...variants[tier],
          cart_items: cartItems,
          total_cost: getTotal(cartItems),
        }
      }

      return {
        ...proposal,
        variants,
        alternatives: proposal.alternatives.filter((item) => item.target_product_id !== productId),
      }
    })
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    updateLatestProposal((proposal) => {
      const variants = { ...proposal.variants }
      for (const tier of Object.keys(variants) as Array<keyof typeof variants>) {
        const cartItems = variants[tier].cart_items.map((item) => {
          if (item.product_id !== productId) return item
          const quantity = Math.max(1, Math.min(20, item.quantity + delta))
          return {
            ...item,
            quantity,
            total_price: quantity * item.unit_price,
          }
        })
        variants[tier] = {
          ...variants[tier],
          cart_items: cartItems,
          total_cost: getTotal(cartItems),
        }
      }

      return { ...proposal, variants }
    })
  }

  const handleLocalCartCommand = (query: string) => {
    const normalized = query.toLowerCase()
    if (!/remove|delete|increase|decrease|more|less|add/.test(normalized)) return false

    const activeItems = latestProposal?.variants.balanced.cart_items || []
    const matchedItem = findMentionedItem(normalized, activeItems)
    const isRemove = /remove|delete/.test(normalized)
    const isDecrease = /decrease|less|reduce/.test(normalized)
    const isIncrease = /increase|more|add/.test(normalized)

    if (isRemove && (matchedItem || /that|last item/.test(normalized))) {
      const item = matchedItem || activeItems.at(-1)
      if (!item) return false
      handleRemoveItem(item.product_id)
      setMessages((current) => [
        ...current,
        { id: createMessageId('assistant_local_remove'), sender: 'assistant', text: `Removed ${item.title} from the cart.` },
      ])
      return true
    }

    if ((isIncrease || isDecrease) && matchedItem) {
      handleUpdateQuantity(matchedItem.product_id, isDecrease ? -1 : 1)
      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant_local_qty'),
          sender: 'assistant',
          text: `${isDecrease ? 'Reduced' : 'Increased'} ${matchedItem.title} quantity.`,
        },
      ])
      return true
    }

    return false
  }

  const handleApplyAlternative = (alternative: QuickyAlternative) => {
    updateLatestProposal((proposal) => {
      const replacement = alternativeToCartItem(alternative)
      const targetItem = proposal.variants.balanced.cart_items.find((item) => item.product_id === alternative.target_product_id)
      const variants = { ...proposal.variants }

      for (const tier of Object.keys(variants) as Array<keyof typeof variants>) {
        const cartItems = variants[tier].cart_items.map((item) =>
          item.product_id === alternative.target_product_id
            ? {
                ...replacement,
                replaced_item: targetItem
                  ? {
                      title: targetItem.title,
                      image: targetItem.image,
                      unit_price: targetItem.unit_price,
                    }
                  : undefined,
              }
            : item,
        )
        variants[tier] = {
          ...variants[tier],
          cart_items: cartItems,
          total_cost: getTotal(cartItems),
        }
      }

      return {
        ...proposal,
        variants,
        alternatives: proposal.alternatives.filter((item) => item.product_id !== alternative.product_id),
      }
    })

    const actionText = alternative.price_delta < 0
      ? `Swapped in ${alternative.title} and saved ${formatRupees(Math.abs(alternative.price_delta))}.`
      : `Swapped in ${alternative.title} for a higher-quality option.`

    setMessages((current) => [
      ...current,
      {
        id: `assistant_swap_${Date.now()}`,
        sender: 'assistant',
        text: actionText,
      },
    ])
  }

  const handleBuyAll = (selectedItems: QuickyCartItem[], itemSchedules: Record<string, QuickySchedule>) => {
    if (selectedItems.length === 0) return

    const totalCost = getTotal(selectedItems)
    const modeLabel = checkoutMode === 'quick' ? 'Quick checkout' : 'Checkout'
    const wasWalletCharged = spendWallet(totalCost)

    if (!wasWalletCharged) {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId('wallet'),
          sender: 'assistant',
          text: `Your Quicky Wallet needs ${formatRupees(totalCost)} but only has ${formatRupees(walletBalance)}. Add funds and try again.`,
        },
      ])
      return
    }

    const mappedCartItems = mapQuickyItemsToCart(selectedItems)
    if (checkoutMode !== 'quick') {
      addManyToCart(mappedCartItems)
    }
    clearCart()

    let reorderCount = 0
    mappedCartItems.forEach((item) => {
      const schedule = itemSchedules[item.id]
      if (schedule) {
        saveSubscription({ item, schedule })
        reorderCount += 1
      }
    })

    setMessages((current) => [
      ...current,
      {
        id: createMessageId('checkout'),
        sender: 'assistant',
        text: `Done. ${modeLabel} placed your order for ${selectedItems.length} items${reorderCount > 0 ? ` and scheduled ${reorderCount} item reorders` : ''}.`,
      },
    ])

    completeCheckoutFlow()
  }

  const handleCheckoutStart = (
    mode: CheckoutMode,
    summary: string,
    selectedItems: QuickyCartItem[] = [],
    itemSchedules: Record<string, QuickySchedule> = {},
  ) => {
    const currentItems = selectedItems.length ? selectedItems : latestProposal?.variants.balanced.cart_items || latestProposal?.cart_items || []
    if (mode === 'quick') {
      setCheckoutMode('quick')
      handleBuyAll(currentItems, itemSchedules)
      return
    }

    addManyToCart(mapQuickyItemsToCart(currentItems))
    beginCheckoutFlow(mode, summary, currentItems, itemSchedules)
  }

  return (
    <div
      className={`fixed inset-0 z-[120] transition-all duration-500 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <aside
        className={`absolute flex flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(11,15,25,0.96),rgba(6,10,18,0.98))] text-white shadow-[0_24px_90px_rgba(0,0,0,0.8)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
        } ${
          isExpanded
            ? 'right-2 top-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] max-w-none rounded-[24px] border border-white/10 sm:right-4 sm:top-4 sm:h-[calc(100%-2rem)] sm:w-[calc(100%-2rem)] sm:rounded-[38px]'
            : 'right-2 top-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] max-w-[42rem] rounded-[24px] border border-white/10 sm:right-4 sm:top-4 sm:h-[calc(100%-2rem)] sm:w-[calc(100%-2rem)] sm:rounded-[38px]'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Quicky AI shopping copilot"
      >
        <header
          className={
            isExpanded
              ? 'absolute left-1/2 top-6 z-50 flex w-[94%] max-w-5xl -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-2xl shadow-2xl transition-all duration-500'
              : 'sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.05] px-3 py-3 backdrop-blur-2xl transition-all duration-500 sm:px-4'
          }
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#ffd814] to-[#00a8e1] shadow-[0_12px_30px_rgba(0,168,225,0.22)]">
              <img src="/playstore.png" alt="Quicky" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <h2 className={`truncate text-[24px] font-black tracking-tight text-white ${pacifico.className}`}>Quicky</h2>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Intent-first shopping</p>
            </div>
            <button
              type="button"
              onClick={() => setShowWalletSheet(true)}
              className="ml-1 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[11px] font-bold text-slate-200 transition-colors hover:bg-white/[0.1] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 sm:ml-3"
            >
              <Wallet size={14} className="text-cyan-300" />
              <span className="hidden sm:inline">Wallet</span>
              <span className="text-cyan-200">Top up</span>
            </button>
            <button
              onClick={handleNewSession}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition-colors hover:bg-white/[0.1] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
              aria-label="New chat"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                showHistory ? 'border-cyan-300/30 bg-cyan-400/15 text-cyan-200' : 'border-white/10 bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white'
              }`}
              aria-label="History"
              >
                <History size={16} />
              </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              aria-label={isExpanded ? 'Shrink window' : 'Expand window'}
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition-colors hover:bg-white/[0.1] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 sm:flex"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition-colors hover:bg-white/[0.1] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {showWalletSheet && (
          <div className="absolute inset-x-0 top-[86px] z-40 px-3 sm:px-4">
            <div className="mx-auto w-full max-w-xl rounded-[28px] border border-white/12 bg-[rgba(12,18,29,0.92)] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">Wallet</p>
                  <h3 className="mt-1 text-lg font-black text-white">Quick top up</h3>
                  <p className="mt-1 text-sm text-slate-300">Choose an amount and keep shopping without leaving the chat.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWalletSheet(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition-colors hover:bg-white/[0.1] hover:text-white"
                  aria-label="Close wallet sheet"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[200, 500, 1000, 2000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleQuickTopUp(amount)}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-left transition-colors hover:border-cyan-300/30 hover:bg-white/[0.09]"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Add</p>
                    <p className="mt-1 text-base font-black text-white">{formatRupees(amount)}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">Quick buy</p>
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
                <input
                  value={customTopUp}
                  onChange={(event) => setCustomTopUp(event.target.value)}
                  inputMode="numeric"
                  placeholder="Custom amount"
                  className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500"
                />
                <Button
                  type="button"
                  onClick={handleCustomTopUp}
                  className="h-11 rounded-xl bg-[#ffd814] px-4 text-sm font-black text-slate-950 hover:bg-[#f7ca00]"
                >
                  Add money
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickTopUp(250)}
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-xs font-bold text-cyan-100 transition-colors hover:bg-cyan-300/[0.14]"
                >
                  Small top up
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTopUp(750)}
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-xs font-bold text-cyan-100 transition-colors hover:bg-cyan-300/[0.14]"
                >
                  Medium top up
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTopUp(1500)}
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 text-xs font-bold text-cyan-100 transition-colors hover:bg-cyan-300/[0.14]"
                >
                  Large top up
                </button>
              </div>
            </div>
          </div>
        )}

        {showCheckoutSheet && (
          <div className="absolute inset-0 z-[75] flex items-center justify-center bg-black/55 px-4 backdrop-blur-md">
            <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(7,12,20,0.98))] shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Checkout</p>
                  <h3 className="mt-1 text-xl font-black text-white">Amazon-style secure checkout</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCheckoutSheet(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition-colors hover:bg-white/[0.1] hover:text-white"
                  aria-label="Close checkout"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid flex-1 gap-0 overflow-hidden lg:grid-cols-[1.3fr_0.9fr]">
                <div className="min-h-0 overflow-y-auto p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {checkoutStep === 'review' && (
                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Cart review</p>
                        <div className="mt-3 space-y-3">
                          {checkoutItems.slice(0, 5).map((item) => (
                            <div key={item.product_id} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
                              <img src={item.image} alt={item.title} className="h-12 w-12 rounded-xl bg-white object-contain p-1" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-white">{item.title}</p>
                                <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                              </div>
                              <p className="text-sm font-black text-[#ffd814]">{formatRupees(item.total_price)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setCheckoutStep('address')}
                        className="h-12 w-full rounded-full bg-[#ffd814] text-sm font-black text-slate-950 hover:bg-[#f7ca00]"
                      >
                        Continue to address
                      </Button>
                    </div>
                  )}

                  {checkoutStep === 'address' && (
                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Shipping address</p>
                        <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
                          <p className="text-sm font-black text-white">Deliver to Home</p>
                          <p className="mt-1 text-sm text-slate-300">A-14, Maple Residency, Andheri East, Mumbai, Maharashtra 400069</p>
                          <p className="mt-1 text-xs text-slate-400">Saved address selected</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setCheckoutStep('payment')}
                        className="h-12 w-full rounded-full bg-[#ffd814] text-sm font-black text-slate-950 hover:bg-[#f7ca00]"
                      >
                        Ship to this address
                      </Button>
                    </div>
                  )}

                  {checkoutStep === 'payment' && (
                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Payment method</p>
                        <div className="mt-3 space-y-2">
                          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                            <span className="text-sm font-semibold text-white">Quicky Wallet</span>
                            <span className="text-xs text-cyan-200">{formatRupees(walletBalance)} available</span>
                          </label>
                          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                            <span className="text-sm font-semibold text-white">UPI</span>
                            <span className="text-xs text-slate-400">Instant</span>
                          </label>
                          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                            <span className="text-sm font-semibold text-white">Card ending 4821</span>
                            <span className="text-xs text-slate-400">Default</span>
                          </label>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setCheckoutStep('confirm')}
                        className="h-12 w-full rounded-full bg-[#ffd814] text-sm font-black text-slate-950 hover:bg-[#f7ca00]"
                      >
                        Review order
                      </Button>
                    </div>
                  )}

                  {checkoutStep === 'confirm' && (
                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Final review</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          Place the order to your saved address. Quicky will confirm payment and then return you to the main screen.
                        </p>
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Order total</p>
                          <p className="mt-1 text-3xl font-black text-white">{formatRupees(getTotal(checkoutItems))}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleBuyAll(checkoutItems, checkoutSchedules)}
                        className="h-12 w-full rounded-full bg-[#ffd814] text-sm font-black text-slate-950 hover:bg-[#f7ca00]"
                      >
                        Place order now
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 bg-white/[0.03] p-5 lg:border-l lg:border-t-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Progress</p>
                  <div className="mt-3 space-y-2">
                    {['review', 'address', 'payment', 'confirm'].map((step, index) => {
                      const active = checkoutStep === step
                      return (
                        <div
                          key={step}
                          className={`rounded-2xl border px-3 py-3 text-sm font-bold transition-colors ${
                            active ? 'border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-100' : 'border-white/10 bg-white/[0.03] text-slate-300'
                          }`}
                        >
                          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">{index + 1}</span>
                          {step === 'review' ? 'Cart review' : step === 'address' ? 'Shipping address' : step === 'payment' ? 'Payment method' : 'Final review'}
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Summary</p>
                    <p className="mt-2 text-sm text-slate-300">{checkoutMessage}</p>
                    <p className="mt-3 text-2xl font-black text-white">{formatRupees(getTotal(checkoutItems))}</p>
                    <p className="mt-1 text-xs text-slate-400">Saved address checkout in progress.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showOrderPlaced && (
          <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 backdrop-blur-md">
            <div className="w-full max-w-md rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(7,12,20,0.98))] p-5 text-center shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-[#ffd814] text-slate-950">
                <Sparkles size={26} />
              </div>
              <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">Order placed</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-white">Thank you for your order</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{checkoutMessage || 'Your order has been placed to your saved address.'}</p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Delivery</p>
                <p className="mt-1 text-sm font-semibold text-white">Placed to your saved address</p>
                <p className="mt-1 text-xs text-slate-400">Returning to the main screen in 7 seconds.</p>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className={`flex flex-1 overflow-hidden ${isExpanded ? 'pt-28' : 'pt-4 sm:pt-6'}`}>
          
          {/* EXPANDED LEFT PANEL: CART VIEW */}
          {isExpanded && latestProposal && !showHistory && (
            <div className="hidden w-1/2 flex-col items-center justify-start border-r border-white/5 bg-[#0a0a0c]/50 px-8 pt-8 pb-36 sm:flex animate-in slide-in-from-left-8 duration-500 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="w-full max-w-lg mt-4">
                <QuickyProposedCart
                  proposal={latestProposal}
                  walletBalance={walletBalance}
                  onRemoveItem={handleRemoveItem}
                  onUpdateQuantity={handleUpdateQuantity}
                  onApplyAlternative={handleApplyAlternative}
                  onCheckoutStart={handleCheckoutStart}
                />
              </div>
            </div>
          )}

          {/* CHAT / HISTORY VIEW */}
          <div className={`flex-1 overflow-y-auto relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isExpanded ? 'px-4 pb-36 pt-8 sm:px-8 sm:pt-10' : 'px-4 pb-36 pt-10 sm:px-6 sm:pt-12'}`}>
            
            {showHistory ? (
              <div className="mx-auto w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="mb-4 text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <History className="text-cyan-400" size={20} />
                  Recent Shopping Trips
                </h3>
                
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
                    <History size={32} className="mb-3 text-slate-600" />
                    <p className="text-sm font-medium text-slate-300">No past sessions yet.</p>
                    <p className="mt-1 text-xs text-slate-500">Your chat history will automatically appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => loadSession(session)}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.04] p-4 text-left transition-all hover:bg-white/[0.08] hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300 group"
                      >
                        <div className="min-w-0 pr-4">
                          <h4 className="truncate text-[15px] font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {session.title}
                          </h4>
                          <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                            {session.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            <span>&bull;</span>
                            {session.messages.length} messages
                          </p>
                        </div>
                        <ChevronRight size={18} className="shrink-0 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-3xl flex-col space-y-6 animate-in fade-in duration-300">
                {showWelcome && (
  <div className="mt-1 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-md sm:mt-2">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200">
        <Sparkles size={18} strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400">
          AI Shopping Assistant
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
          Let's build the perfect cart for your needs.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
          {INITIAL_MESSAGE.text}
        </p>
      </div>
    </div>
  </div>
)}

                {showWelcome && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left transition-colors hover:border-cyan-300/30 hover:bg-white/[0.09]"
                      >
                        <span className="min-w-0 pr-3 text-sm font-semibold text-slate-100">{prompt}</span>
                        <ChevronRight size={16} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-200" />
                      </button>
                    ))}
                  </div>
                )}

                {pendingPlan && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSend('Yes, create carts', undefined, 'cart')}
                      className="rounded-full border border-[#ffd814]/40 bg-[#ffd814] px-4 py-2 text-xs font-black text-slate-950 transition-colors hover:bg-[#f7ca00]"
                    >
                      Yes, create carts
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSend('No')}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-slate-200 transition-colors hover:bg-white/[0.08]"
                    >
                      No, I’ll edit
                    </button>
                  </div>
                )}

                {latestProposal && (
                  <div className="flex flex-wrap gap-2">
                    {refinementPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3.5 py-2 text-xs font-bold text-cyan-100 transition-colors hover:bg-cyan-300/[0.12] hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`flex w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex w-full ${message.sender === 'user' ? 'max-w-[85%] sm:max-w-[75%] justify-end' : 'max-w-full flex-col items-start gap-2.5'}`}>
                      
                      {message.sender === 'assistant' && (
                        <div className="flex items-center gap-2 px-1">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                            <Sparkles size={11} />
                          </div>
                          <span className={`text-[13px] font-medium text-slate-200 ${pacifico.className}`}>Quicky</span>
                        </div>
                      )}

                      {message.sender === 'user' ? (
                        <div className="rounded-[22px] rounded-tr-sm bg-white/10 px-5 py-3.5 text-[14px] leading-relaxed text-white shadow-sm backdrop-blur-sm border border-white/5">
                          {message.text}
                        </div>
                      ) : (
                        <div className="w-full pl-1 sm:pl-8">
                          {!message.proposal ? (
                            <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-slate-300">
                              <p className="whitespace-pre-line">{message.text}</p>
                              {message.actions && (
                                <div className="not-prose mt-3 flex flex-wrap gap-2">
                                  {message.actions.map((action) => (
                                    <button
                                      key={`${message.id}_${action.label}`}
                                      type="button"
                                      onClick={() => handleSend(action.prompt, undefined, action.mode)}
                                      className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-xs font-bold text-cyan-100 transition-colors hover:bg-cyan-300/[0.12] hover:text-white"
                                    >
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className={`w-full pb-2 ${isExpanded && message.proposal === latestProposal ? 'hidden' : 'block'}`}>
                              <p className="mb-3 whitespace-pre-line text-[15px] leading-relaxed text-slate-300">{message.text}</p>
                              <QuickyProposedCart
                                proposal={message.proposal}
                                walletBalance={walletBalance}
                                onRemoveItem={handleRemoveItem}
                                onUpdateQuantity={handleUpdateQuantity}
                                onApplyAlternative={handleApplyAlternative}
                                onCheckoutStart={handleCheckoutStart}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex w-full justify-start">
                    <div className="flex flex-col items-start gap-2.5">
                      <div className="flex items-center gap-2 px-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300">
                          <Sparkles size={11} />
                        </div>
                        <span className={`text-[13px] font-medium text-slate-200 ${pacifico.className}`}>Quicky</span>
                      </div>
                      <div className="pl-1 sm:pl-8">
                        <div className="inline-flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-[14px] text-slate-300 border border-white/5">
                          <Loader2 size={16} className="animate-spin text-cyan-400" />
                          Building the best carts...
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT BAR */}
        {!showHistory && (
          <div className="pointer-events-none absolute bottom-4 left-0 right-0 px-4 sm:bottom-5 sm:px-6">
            <div className="mx-auto w-full max-w-3xl">
              <div className="pointer-events-auto rounded-[30px] border border-white/12 bg-[rgba(14,19,29,0.82)] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
                <div className="flex items-center gap-2 rounded-[24px] border border-white/10 bg-white/[0.04] p-1.5">
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300 ${
                      isListening ? 'bg-cyan-400 text-slate-950' : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white'
                    }`}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Ask Quicky something..."
                    className="h-12 min-w-0 flex-1 bg-transparent px-4 text-[15px] text-white outline-none placeholder:text-slate-500"
                    aria-label="Message Quicky"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="h-10 w-10 shrink-0 rounded-full bg-white p-0 text-slate-900 transition-transform hover:scale-105 hover:bg-slate-200 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send size={18} className="-ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}

function alternativeToCartItem(alternative: QuickyAlternative): QuickyCartItem {
  return {
    product_id: alternative.product_id,
    title: alternative.title,
    quantity: alternative.quantity,
    unit_price: alternative.unit_price,
    total_price: alternative.total_price,
    image: alternative.image,
    rationale: alternative.rationale,
    ai_badge: alternative.price_delta < 0 ? 'Savings swap' : 'Quality swap',
    savings_badge: alternative.price_delta < 0 ? 'Saved' : undefined,
    quality_tier: alternative.quality_comparison === 'higher' ? 'premium' : alternative.quality_comparison === 'lower' ? 'value' : 'standard',
  }
}

function syncBalancedTopLevel(proposal: QuickyResponse): QuickyResponse {
  const balanced = proposal.variants.balanced
  return {
    ...proposal,
    cart_items: balanced.cart_items,
    total_cost: balanced.total_cost,
    scores: balanced.scores,
    savings: balanced.savings,
  }
}

function addItemToProposal(proposal: QuickyResponse, itemToAdd: QuickyCartItem): QuickyResponse {
  const variants = { ...proposal.variants }

  for (const tier of Object.keys(variants) as Array<keyof typeof variants>) {
    const existingItem = variants[tier].cart_items.find((item) => item.product_id === itemToAdd.product_id)
    const cartItems = existingItem
      ? variants[tier].cart_items.map((item) => {
          if (item.product_id !== itemToAdd.product_id) return item
          const quantity = item.quantity + 1
          return {
            ...item,
            quantity,
            total_price: quantity * item.unit_price,
          }
        })
      : [
          ...variants[tier].cart_items,
          {
            ...itemToAdd,
            quantity: 1,
            total_price: itemToAdd.unit_price,
          },
        ]

    variants[tier] = {
      ...variants[tier],
      cart_items: cartItems,
      total_cost: getTotal(cartItems),
    }
  }

  return {
    ...proposal,
    variants,
  }
}

function getTotal(items: QuickyCartItem[]) {
  return items.reduce((sum, item) => sum + item.total_price, 0)
}

function isConfirmation(query: string) {
  return /^(yes|yep|yeah|ok|okay|sure|create|make|build|go ahead|do it|cart)$/i.test(query.trim())
}

function isPlanDecline(query: string) {
  return /^(no|nope|not yet|wait)$/i.test(query.trim())
}

function buildPlanActions(plan: QuickyPlan): ChatAction[] {
  const normalized = `${plan.headline} ${plan.question} ${plan.reason}`.toLowerCase()
  if (/birthday/.test(normalized) && /gift|teen/.test(normalized)) {
    return [
      { label: 'Tech gifts', prompt: 'focus on tech gifts for the birthday' },
      { label: 'Fun gifts', prompt: 'focus on fun gifts for the birthday' },
      { label: 'Books', prompt: 'focus on books for the birthday' },
      { label: 'Mixed gifts', prompt: 'mix tech, fun and books for the birthday' },
      { label: 'Build cart', prompt: 'Yes, create carts', mode: 'cart' },
    ]
  }

  return [
    { label: 'Yes, create carts', prompt: 'Yes, create carts', mode: 'cart' },
    { label: 'No, I’ll edit', prompt: 'No' },
    { label: 'Lower budget', prompt: 'Fit under ₹700' },
  ]
}

function findMentionedItem(query: string, items: QuickyCartItem[]) {
  const queryTokens = tokenize(query)
  return items.find((item) => {
    const titleTokens = tokenize(item.title)
    return titleTokens.some((token) => token.length > 3 && queryTokens.includes(token))
  })
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}