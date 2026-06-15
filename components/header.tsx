'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronDown,
  Home,
  MapPin,
  Menu,
  MessageSquareText,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  User,
  X,
  ChevronLeft,
  Smartphone,
  CreditCard,
  Building2,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { useQuicky } from '@/components/quicky-context'

interface HeaderProps {
  onChatOpen: () => void
}

const navItems = ['Fresh', 'Sell', 'Best Sellers', 'Mobiles', "Today's Deals"]
const allMenuCategories = [
  'Echo & Alexa', 
  'Fire TV', 
  'Kindle E-Readers', 
  'Amazon Prime Music', 
  'Mobiles, Computers', 
  'TV, Appliances, Electronics', 
  "Men's Fashion", 
  "Women's Fashion"
]

export function Header({ onChatOpen }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState('Fetching...')
  const [pincode, setPincode] = useState('')
  const [userName, setUserName] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  
  // Header Dropdowns
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isAllMenuOpen, setIsAllMenuOpen] = useState(false)
  const [isOrdersOpen, setIsOrdersOpen] = useState(false)
  
  // Wallet States
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [walletView, setWalletView] = useState<'wallet' | 'payment' | 'processing' | 'success'>('wallet')
  const [walletSelectedAmount, setWalletSelectedAmount] = useState(0)

  // Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [showOrderPlaced, setShowOrderPlaced] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'address' | 'payment' | 'confirm'>('review')
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: 'Sattwik',
    phone: '9876543210',
    line1: 'A-14, Maple Residency, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
  })
  const checkoutTimerRef = useRef<number | null>(null)

  // Cart State
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { cartItems, updateQty, removeFromCart: removeItem, clearCart, cartTotalItems, cartSubtotal } = useCart()
  const { walletBalance, addFunds, spendWallet, confirmedOrders, recordOrder } = useQuicky()

  // Keep search bar in sync if user uses browser Back/Forward buttons
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    fetch('https://ipinfo.io/json')
      .then(res => res.json())
      .then(data => {
        if (data.city) {
          setCity(data.city)
          setPincode(data.postal || '')
        } else {
          setCity('Select your address')
        }
      })
      .catch(() => {
        setCity('Select your address')
      })
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    return () => {
      if (checkoutTimerRef.current) {
        window.clearTimeout(checkoutTimerRef.current)
      }
    }
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/')
    }
  }

  // Helper function to trigger search from Sub-header items
  const triggerSearch = (term: string) => {
    setSearchQuery(term)
    setIsAllMenuOpen(false) // Close the menu if open
    router.push(`/?q=${encodeURIComponent(term)}`)
  }

  // --- Wallet Methods ---
  const handleWalletAmountClick = (amount: number) => {
    setWalletSelectedAmount(amount)
    setWalletView('payment')
  }

  const processWalletPayment = (method: string) => {
    setWalletView('processing')
    setTimeout(() => {
      addFunds(walletSelectedAmount)
      setWalletView('success')
      setTimeout(() => {
        setWalletView('wallet')
        setIsWalletOpen(false)
      }, 2000)
    }, 1500)
  }

  const closeWallet = () => {
    setIsWalletOpen(false)
    setTimeout(() => setWalletView('wallet'), 300)
  }
  // -------------------------

  const openCheckout = () => {
    setIsCartOpen(false)
    setCheckoutStep('review')
    setIsCheckoutOpen(true)
  }

  const finishCheckout = () => {
    if (cartItems.length === 0) return
    const approved = spendWallet(cartSubtotal)
    if (!approved) {
      setIsWalletOpen(true)
      return
    }

    const address = `${deliveryAddress.fullName}, ${deliveryAddress.phone}, ${deliveryAddress.line1}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.pincode}`
    recordOrder({
      totalCost: cartSubtotal,
      cartItems,
      address,
      paymentMethod: 'Quicky Wallet',
    })
    clearCart()
    setIsCheckoutOpen(false)
    setShowOrderPlaced(true)
    if (checkoutTimerRef.current) {
      window.clearTimeout(checkoutTimerRef.current)
    }
    checkoutTimerRef.current = window.setTimeout(() => {
      setShowOrderPlaced(false)
      checkoutTimerRef.current = null
    }, 7000)
  }

  return (
    <>
      <header className="fixed top-0 z-50 w-full px-2 pt-2 font-amazon sm:px-4 sm:pt-4">
        <div
          className={`relative mx-auto w-full max-w-[1480px] overflow-visible rounded-[24px] border border-white/10 bg-[#0b111d]/80 text-white shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl transition-all duration-300 sm:rounded-[30px] ${
            isScrolled ? 'sm:max-w-[1400px] sm:bg-[#0b111d]/88 sm:shadow-[0_18px_60px_rgba(2,6,23,0.42)]' : ''
          }`}
        >
          {/* Main Header */}
          <div className="flex min-h-[72px] items-center gap-2 px-3 py-3 text-sm sm:gap-3 sm:px-4 lg:gap-4 lg:px-5">
            {/* Logo */}
            <button
              type="button"
              onClick={() => router.push('/')}
              aria-label="Go to home"
              className="group flex shrink-0 items-center rounded-full px-2 py-2 transition-all duration-300 hover:scale-[1.03] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80 sm:px-3"
            >
              <span className="flex items-start text-[22px] font-black leading-none tracking-[-0.04em] text-white sm:text-[26px]">
                amazon
                <span className="ml-0.5 mt-1 text-xs font-semibold tracking-normal text-white/70 sm:text-sm">.in</span>
              </span>
            </button>

            {/* Location */}
            <button
              type="button"
              className="hidden min-w-0 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80 sm:flex"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#febd69]/15 text-[#febd69]">
                <MapPin size={18} />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="max-w-[150px] truncate text-[11px] text-white/60 lg:max-w-[210px]">
                  {pincode ? `Delivering to ${city} ${pincode}` : 'Delivering to you'}
                </span>
                <span className="max-w-[150px] truncate text-[13px] font-bold text-white lg:max-w-[210px]">
                  {city === 'Fetching...' ? 'Update location' : city}
                </span>
              </span>
            </button>

            {/* Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="group/search flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-full border border-white/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 focus-within:border-[#febd69]/70 focus-within:shadow-[0_0_0_4px_rgba(254,189,105,0.22),0_16px_44px_rgba(0,0,0,0.22)]"
            >
              <button
                type="button"
                className="hidden h-full items-center gap-1 border-r border-slate-200 bg-slate-50 px-4 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 md:flex"
              >
                All <ChevronDown size={14} className="text-slate-400" />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Amazon.in"
                className="h-full min-w-0 flex-1 bg-transparent px-4 text-[15px] font-medium text-slate-950 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                aria-label="Search"
                className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#febd69] text-slate-950 transition-all duration-300 hover:scale-105 hover:bg-[#f3a847] group-focus-within/search:rotate-[-8deg] sm:mr-1.5 sm:w-12"
              >
                <Search size={21} />
              </button>
            </form>

            {/* Language */}
            <button
              type="button"
              className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80 md:flex"
            >
              EN <ChevronDown size={14} className="text-white/50" />
            </button>

            {/* Account - Dynamic with Dropdown */}
            <div
              className="group/account relative hidden md:block"
              onMouseEnter={() => setIsAccountOpen(true)}
              onMouseLeave={() => setIsAccountOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsAccountOpen(open => !open)}
                aria-expanded={isAccountOpen}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-left leading-tight transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80"
              >
                <span className="text-[11px] font-medium text-white/65">{userName ? `Hello, ${userName}` : 'Hello, sign in'}</span>
                <span className="flex items-center text-[13px] font-bold text-white">
                  Account & Lists <ChevronDown size={14} className="ml-1 mt-0.5 text-white/50 transition-transform duration-300 group-hover/account:rotate-180" />
                </span>
              </button>

              <div
                className={`absolute right-[-44px] top-full z-[60] mt-3 w-[400px] origin-top-right rounded-[28px] border border-white/15 bg-white/92 p-4 text-slate-950 shadow-[0_28px_90px_rgba(2,6,23,0.32)] backdrop-blur-xl transition-all duration-200 ${
                  isAccountOpen
                    ? 'visible translate-y-0 scale-100 opacity-100'
                    : 'invisible -translate-y-2 scale-95 opacity-0 group-hover/account:visible group-hover/account:translate-y-0 group-hover/account:scale-100 group-hover/account:opacity-100'
                }`}
              >
                <div className="absolute -top-2 right-[70px] h-4 w-4 rotate-45 border-l border-t border-white/30 bg-white/92" />

                {!userName ? (
                  <div className="relative z-10 mb-4 border-b border-slate-200 pb-4 text-center">
                    <button
                      onClick={() => setUserName('User')}
                      className="mx-auto block w-52 rounded-full border border-[#d49b2a] bg-[#febd69] py-2 text-sm font-black text-slate-950 shadow-[0_10px_24px_rgba(254,189,105,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f3a847] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]"
                    >
                      Sign in
                    </button>
                    <div className="mt-2 text-[11px] text-slate-500">
                      New customer? <span className="cursor-pointer font-semibold text-cyan-700 hover:text-[#c45500] hover:underline">Start here.</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 mb-4 border-b border-slate-200 pb-4 text-center">
                    <p className="text-sm text-slate-700">Welcome back, <strong className="text-slate-950">{userName}</strong>!</p>
                    <button
                      onClick={() => setUserName('')}
                      className="mt-1 cursor-pointer text-[12px] font-semibold text-cyan-700 hover:text-[#c45500] hover:underline"
                    >
                      Sign out
                    </button>
                  </div>
                )}
                <div className="relative z-10 flex gap-6 text-sm">
                  <div className="flex-1">
                    <h3 className="mb-2 font-black text-slate-950">Your Lists</h3>
                    <ul className="space-y-1.5 text-[13px] text-slate-600">
                      <li className="cursor-pointer transition-colors hover:text-[#c45500] hover:underline">Create a Wish List</li>
                      <li className="cursor-pointer transition-colors hover:text-[#c45500] hover:underline">Wish from Any Website</li>
                      <li className="cursor-pointer transition-colors hover:text-[#c45500] hover:underline">Baby Wish List</li>
                      <li className="cursor-pointer transition-colors hover:text-[#c45500] hover:underline">Discover Your Style</li>
                    </ul>
                  </div>
                  <div className="flex-1 border-l border-slate-200 pl-4">
                    <h3 className="mb-2 font-black text-slate-950">Your Account</h3>
                    <ul className="space-y-1.5 text-[13px] text-slate-600">
                      <li className="cursor-pointer transition-colors hover:text-[#c45500] hover:underline">Your Account</li>
                      <li className="cursor-pointer transition-colors hover:text-[#c45500] hover:underline">Your Orders</li>
                      <li className="cursor-pointer transition-colors hover:text-[#c45500] hover:underline">Your Wish List</li>
                      <li className="cursor-pointer transition-colors hover:text-[#c45500] hover:underline">Your Recommendations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders */}
            <button
              type="button"
              onClick={() => router.push('/orders')}
              className="hidden flex-col rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-left leading-tight transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80 md:flex"
            >
              <span className="text-[11px] font-medium text-white/65">Returns</span>
              <span className="text-[13px] font-bold text-white">& Orders</span>
            </button>

            {/* Quicky Wallet Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsWalletOpen((current) => !current)
                setIsOrdersOpen(false)
              }}
              className="hidden flex-col rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-left leading-tight transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80 lg:flex"
            >
              <span className="text-[11px] font-medium text-white/65">Quicky</span>
              <span className="text-[13px] font-bold text-white">Wallet</span>
            </button>

            {/* Cart */}
            <button
              type="button"
              className="relative flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80 lg:px-3"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open cart with ${cartTotalItems} items`}
            >
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <ShoppingCart size={22} className="text-white" />
                <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#febd69] px-1.5 text-xs font-black leading-none text-slate-950 shadow-[0_0_0_3px_rgba(11,17,29,0.9)] transition-transform duration-300 hover:scale-110">
                  {cartTotalItems}
                </span>
              </span>
              <span className="hidden font-black text-white lg:block">Cart</span>
            </button>
          </div>

          {/* Sub Header */}
          <div className="flex min-h-[48px] items-center gap-2 overflow-x-auto whitespace-nowrap px-3 pb-3 text-[13px] text-white/82 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-4 lg:px-5 [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setIsAllMenuOpen(!isAllMenuOpen)}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-2 font-black transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80 ${isAllMenuOpen ? 'border-cyan-300/30 bg-cyan-300/[0.14] text-cyan-100' : 'border-white/10 bg-white/[0.07] text-white hover:-translate-y-0.5 hover:bg-white/[0.14]'}`}
            >
              <Menu size={18} /> All
            </button>
            {navItems.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => triggerSearch(item)}
                className="shrink-0 rounded-full px-3 py-2 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80"
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => triggerSearch('Amazon Prime')}
              className="flex shrink-0 items-center rounded-full px-3 py-2 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80"
            >
              Prime <ChevronDown size={14} className="ml-1 text-white/45" />
            </button>
            <button 
              type="button" 
              onClick={() => triggerSearch('Electronics')}
              className="shrink-0 rounded-full px-3 py-2 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80"
            >
              Electronics
            </button>
            <button 
              type="button" 
              onClick={() => triggerSearch('Customer Service')}
              className="shrink-0 rounded-full px-3 py-2 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80"
            >
              Customer Service
            </button>
            <button
              type="button"
              onClick={() => {
                setIsWalletOpen((current) => !current)
                setIsOrdersOpen(false)
              }}
              className="shrink-0 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-2 font-black text-cyan-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300/[0.14] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80"
            >
              Quicky Wallet
            </button>
            {/* Quicky Chat Trigger integrated in subnav */}
            <div className="ml-auto hidden shrink-0 items-center pl-3 sm:flex">
              <button
                onClick={onChatOpen}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#febd69] via-[#ff9f43] to-[#00a8e1] px-4 py-2 text-[13px] font-black text-slate-950 shadow-[0_12px_34px_rgba(254,189,105,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(0,168,225,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80"
              >
                <MessageSquareText size={18} className="stroke-[2.5]" />
                <span>Ask Quicky</span>
              </button>
            </div>
          </div>

          {/* New "All Menu" Dropdown */}
          {isAllMenuOpen && (
            <div className="absolute left-4 top-[calc(100%-4px)] z-[100] mt-2 w-[280px] rounded-[24px] border border-white/15 bg-white/95 p-3 text-slate-950 shadow-[0_28px_90px_rgba(2,6,23,0.32)] backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200 sm:left-6">
              <div className="mb-2 px-3 pt-2 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                Shop by Category
              </div>
              <div className="flex flex-col space-y-1">
                {allMenuCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => triggerSearch(cat)}
                    className="rounded-[14px] px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#c45500]"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
      <div aria-hidden="true" className="h-[160px] sm:h-[150px]" />

      {/* CENTERED WALLET UI WITH PAYMENT FLOW */}
      {isWalletOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[360px] overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#131B2A] to-[#0C121D] p-6 shadow-[0_32px_96px_rgba(0,0,0,0.8)] transition-all duration-300">
            
            {/* Subtle ambient glow behind the header */}
            <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-cyan-500/20 blur-[60px]" />

            {/* --- VIEW: WALLET HOME --- */}
            {walletView === 'wallet' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20">
                        <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      </span>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400">Quicky Wallet</p>
                    </div>
                    
                    <p className="mt-5 text-sm font-medium text-slate-400">Available Balance</p>
                    <h3 className="mt-1 text-4xl font-black tracking-tight text-white">
                      ₹{walletBalance.toLocaleString('en-IN')}
                    </h3>
                  </div>
                  
                  <button 
                    onClick={closeWallet} 
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="relative mt-8">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Quick Add Money</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[200, 500, 1000, 2000].map((amount) => (
                      <button 
                        key={amount} 
                        onClick={() => handleWalletAmountClick(amount)} 
                        className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/10"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 transition-colors group-hover:text-cyan-300">
                          Add
                        </p>
                        <p className="mt-1 text-xl font-black text-white">
                          ₹{amount}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-300">
                  Add money to unlock <span className="font-bold text-white">Quick Buy</span> for instant, one-tap checkouts.
                </div>
              </div>
            )}

            {/* --- VIEW: PAYMENT METHODS --- */}
            {walletView === 'payment' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6 flex items-center justify-between">
                  <button 
                    onClick={() => setWalletView('wallet')}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <p className="text-sm font-bold text-white">Payment Method</p>
                  <div className="w-8" /> {/* Spacer for centering */}
                </div>

                <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Amount to Pay</p>
                  <p className="mt-1 text-3xl font-black text-white">₹{walletSelectedAmount}</p>
                </div>

                <div className="space-y-3">
                  <button onClick={() => processWalletPayment('UPI')} className="flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                      <Smartphone size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">UPI</p>
                      <p className="text-xs text-slate-400">Google Pay, PhonePe, Paytm</p>
                    </div>
                  </button>

                  <button onClick={() => processWalletPayment('Card')} className="flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Credit / Debit Card</p>
                      <p className="text-xs text-slate-400">Visa, Mastercard, RuPay</p>
                    </div>
                  </button>

                  <button onClick={() => processWalletPayment('NetBanking')} className="flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                      <Building2 size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-white">Net Banking</p>
                      <p className="text-xs text-slate-400">All Indian Banks</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* --- VIEW: PROCESSING --- */}
            {walletView === 'processing' && (
              <div className="flex h-[400px] flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                <Loader2 size={48} className="animate-spin text-cyan-400" />
                <p className="mt-6 text-lg font-bold text-white">Processing Payment</p>
                <p className="mt-2 text-sm text-slate-400">Please do not close this window</p>
              </div>
            )}

            {/* --- VIEW: SUCCESS --- */}
            {walletView === 'success' && (
              <div className="flex h-[400px] flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 size={40} />
                </div>
                <p className="mt-6 text-2xl font-black text-white">₹{walletSelectedAmount} Added!</p>
                <p className="mt-2 text-sm text-slate-400">Your wallet balance has been updated.</p>
              </div>
            )}

          </div>
        </div>
      )}
      
      {/* Orders Drawer */}
      {isOrdersOpen && (
        <div className="fixed right-2 top-[92px] z-[70] w-[360px] rounded-[26px] border border-white/12 bg-[rgba(12,18,29,0.95)] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Returns & Orders</p>
              <h3 className="mt-1 text-lg font-black">Past confirmed orders</h3>
              <p className="mt-1 text-sm text-slate-300">Your recently placed orders stay here.</p>
            </div>
            <button onClick={() => setIsOrdersOpen(false)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {confirmedOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                No orders yet. Your checked-out carts will appear here.
              </div>
            ) : (
              confirmedOrders.slice(0, 5).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-sm font-bold text-white">Order {entry.id.replace('order_', '#')}</p>
                  <p className="mt-1 text-xs text-slate-400">₹{entry.totalCost.toLocaleString('en-IN')} • {entry.itemCount} items • {new Date(entry.createdAt).toLocaleDateString()}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{entry.address}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Dock */}
      <nav className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-between rounded-full border border-white/15 bg-[#0b111d]/86 px-2 py-2 text-white shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:hidden">
        <button type="button" onClick={() => router.push('/')} aria-label="Home" className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80">
          <Home size={20} />
        </button>
        <button type="button" onClick={() => searchInputRef.current?.focus()} aria-label="Focus search" className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80">
          <Search size={20} />
        </button>
        <button type="button" onClick={() => setIsCartOpen(true)} aria-label={`Open cart with ${cartTotalItems} items`} className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80">
          <ShoppingCart size={20} />
          <span className="absolute right-1 top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#febd69] px-1 text-[11px] font-black text-slate-950">
            {cartTotalItems}
          </span>
        </button>
        <button type="button" onClick={onChatOpen} aria-label="Ask Quicky" className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#febd69] to-[#00a8e1] text-slate-950 shadow-[0_10px_28px_rgba(254,189,105,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80">
          <MessageSquareText size={20} />
        </button>
        <button type="button" onClick={() => setIsAccountOpen(open => !open)} aria-label="Account" className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]/80">
          <User size={20} />
        </button>
      </nav>

      {/* Mobile Account Details Popup */}
      {isAccountOpen && (
        <div className="fixed inset-x-3 bottom-20 z-50 rounded-[28px] border border-white/15 bg-white/92 p-4 text-slate-950 shadow-[0_24px_80px_rgba(2,6,23,0.32)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 sm:hidden">
          {!userName ? (
            <div className="border-b border-slate-200 pb-4 text-center">
              <button
                onClick={() => setUserName('User')}
                className="mx-auto block w-full rounded-full border border-[#d49b2a] bg-[#febd69] py-2.5 text-sm font-black text-slate-950 shadow-[0_10px_24px_rgba(254,189,105,0.28)] transition-all duration-300 hover:bg-[#f3a847] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febd69]"
              >
                Sign in
              </button>
              <div className="mt-2 text-[11px] text-slate-500">
                New customer? <span className="cursor-pointer font-semibold text-cyan-700 hover:text-[#c45500] hover:underline">Start here.</span>
              </div>
            </div>
          ) : (
            <div className="border-b border-slate-200 pb-4 text-center">
              <p className="text-sm text-slate-700">Welcome back, <strong className="text-slate-950">{userName}</strong>!</p>
              <button
                onClick={() => setUserName('')}
                className="mt-1 cursor-pointer text-[12px] font-semibold text-cyan-700 hover:text-[#c45500] hover:underline"
              >
                Sign out
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
            <div>
              <h3 className="mb-2 font-black text-slate-950">Your Lists</h3>
              <ul className="space-y-1.5 text-[13px] text-slate-600">
                <li className="cursor-pointer hover:text-[#c45500] hover:underline">Create a Wish List</li>
                <li className="cursor-pointer hover:text-[#c45500] hover:underline">Baby Wish List</li>
              </ul>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <h3 className="mb-2 font-black text-slate-950">Your Account</h3>
              <ul className="space-y-1.5 text-[13px] text-slate-600">
                <li className="cursor-pointer hover:text-[#c45500] hover:underline">Your Orders</li>
                <li className="cursor-pointer hover:text-[#c45500] hover:underline">Your Wish List</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Premium Dark Glass Cart Side Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <button
            type="button"
            aria-label="Close cart drawer"
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsCartOpen(false)}
          />

          <aside className="relative flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-[linear-gradient(180deg,rgba(12,17,29,0.95),rgba(6,10,18,0.98))] text-white shadow-[-30px_0_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl animate-in slide-in-from-right duration-300 sm:m-4 sm:h-[calc(100%-2rem)] sm:rounded-[32px] sm:border">
            
            {/* Header */}
            <div className="relative shrink-0 border-b border-white/10 bg-white/[0.02] p-6">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#febd69]/10 blur-[40px]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#febd69]/20">
                      <ShoppingCart size={12} className="text-[#febd69]" />
                    </span>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#febd69]">Your Cart</p>
                  </div>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                    <span className="ml-1 text-base font-medium text-slate-400">.00</span>
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Close cart"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/[0.03] text-slate-500 shadow-inner">
                    <ShoppingCart size={40} className="opacity-50" />
                  </div>
                  <h3 className="mb-2 text-xl font-black tracking-tight text-white">Your cart is empty.</h3>
                  <p className="mb-8 max-w-[260px] text-sm leading-relaxed text-slate-400">
                    Looks like you haven't added anything to your cart yet. Discover something new!
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white/10"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="group relative flex gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]">
                      
                      {/* Image Container */}
                      <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-inner">
                        <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-200 group-hover:text-white">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-lg font-black text-white">
                          ₹{item.price.toLocaleString('en-IN')}.00
                        </p>
                        <p className="mt-1 text-xs font-semibold text-emerald-400">In stock • Ready to ship</p>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center rounded-full border border-white/10 bg-black/20 p-1">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              aria-label={`Decrease quantity`}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="flex min-w-[28px] items-center justify-center text-sm font-black text-white">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              aria-label={`Increase quantity`}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-xs font-bold text-red-400/80 transition-colors hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout Footer */}
            {cartItems.length > 0 && (
              <div className="shrink-0 border-t border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
                <button
                  onClick={openCheckout}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#ffd814] py-4 text-[15px] font-black text-slate-950 transition-all duration-300 hover:scale-[1.02] hover:bg-[#f7ca00] hover:shadow-[0_0_40px_rgba(255,216,20,0.3)]"
                >
                  <span className="relative z-10">Proceed to Checkout ({cartTotalItems} items)</span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
                </button>
                <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
                  Secure checkout powered by Quicky Pay
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md">
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(12,17,29,0.98),rgba(6,10,18,0.98))] text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Checkout</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">Amazon-style checkout</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition-colors hover:bg-white/[0.1] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid flex-1 overflow-hidden lg:grid-cols-[1.25fr_0.95fr]">
              <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
                {checkoutStep === 'review' && (
                  <div className="space-y-4">
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Review your cart</p>
                      <div className="mt-4 space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
                            <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl bg-white object-contain p-1" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-white">{item.name}</p>
                              <p className="text-xs text-slate-400">Qty {item.qty}</p>
                            </div>
                            <p className="text-sm font-black text-[#ffd814]">₹{(item.price * item.qty).toLocaleString('en-IN')}.00</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('address')}
                      className="w-full rounded-full bg-[#ffd814] py-3 text-sm font-black text-slate-950 transition-colors hover:bg-[#f7ca00]"
                    >
                      Continue to shipping address
                    </button>
                  </div>
                )}

                {checkoutStep === 'address' && (
                  <div className="space-y-4">
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Shipping address</p>
                      <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
                        <p className="text-sm font-black text-white">Deliver to Home</p>
                        <p className="mt-1 text-sm text-slate-300">A-14, Maple Residency, Andheri East, Mumbai, Maharashtra 400069</p>
                        <p className="mt-1 text-xs text-slate-400">Saved address selected</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('payment')}
                      className="w-full rounded-full bg-[#ffd814] py-3 text-sm font-black text-slate-950 transition-colors hover:bg-[#f7ca00]"
                    >
                      Ship to this address
                    </button>
                  </div>
                )}

                {checkoutStep === 'payment' && (
                  <div className="space-y-4">
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Payment method</p>
                      <div className="mt-3 space-y-2">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                          <p className="text-sm font-semibold text-white">Quicky Wallet</p>
                          <p className="text-xs text-cyan-200">{cartSubtotal.toLocaleString('en-IN')} available in wallet mode</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                          <p className="text-sm font-semibold text-white">UPI</p>
                          <p className="text-xs text-slate-400">Instant approval</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                          <p className="text-sm font-semibold text-white">Card ending 4821</p>
                          <p className="text-xs text-slate-400">Default payment method</p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('confirm')}
                      className="w-full rounded-full bg-[#ffd814] py-3 text-sm font-black text-slate-950 transition-colors hover:bg-[#f7ca00]"
                    >
                      Review order
                    </button>
                  </div>
                )}

                {checkoutStep === 'confirm' && (
                  <div className="space-y-4">
                    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Final review</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Place this order to your saved address. Quicky will confirm and return you to the main screen.
                      </p>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Order total</p>
                        <p className="mt-1 text-3xl font-black text-white">₹{cartSubtotal.toLocaleString('en-IN')}.00</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearCart()
                        setIsCheckoutOpen(false)
                        if (checkoutTimerRef.current) {
                          window.clearTimeout(checkoutTimerRef.current)
                        }
                        checkoutTimerRef.current = window.setTimeout(() => {
                          checkoutTimerRef.current = null
                        }, 7000)
                      }}
                      className="w-full rounded-full bg-[#ffd814] py-3 text-sm font-black text-slate-950 transition-colors hover:bg-[#f7ca00]"
                    >
                      Place order now
                    </button>
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
                        className={`rounded-2xl border px-3 py-3 text-sm font-bold ${active ? 'border-cyan-300/30 bg-cyan-300/[0.08] text-cyan-100' : 'border-white/10 bg-white/[0.03] text-slate-300'}`}
                      >
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">{index + 1}</span>
                        {step === 'review' ? 'Cart review' : step === 'address' ? 'Shipping address' : step === 'payment' ? 'Payment method' : 'Final review'}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  )
}