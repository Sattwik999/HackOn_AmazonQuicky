'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CartItem } from '@/components/cart-context'
import type { QuickySchedule, QuickySubscription } from '@/lib/quicky'

export interface QuickyUserProfile {
  name?: string
  householdSize?: number
  dietaryPreferences: string[]
  defaultBudget?: number
}

export interface QuickyShoppingHistoryEntry {
  id: string
  query: string
  totalCost: number
  createdAt: string
}

export interface QuickyConfirmedOrder {
  id: string
  createdAt: string
  totalCost: number
  itemCount: number
  status: 'confirmed' | 'delivering' | 'delivered'
  address: string
  paymentMethod: string
  cartItems: CartItem[]
}

export interface QuickyBudgetProfile {
  monthlyLimit?: number
  preferredCartTier: 'economy' | 'balanced' | 'premium'
  averageOrderValue: number
}

interface SaveSubscriptionInput {
  item: CartItem
  schedule: QuickySchedule
}

interface RecordOrderInput {
  totalCost: number
  cartItems: CartItem[]
  address?: string
  paymentMethod?: string
}

interface QuickyContextValue {
  walletBalance: number
  subscriptions: QuickySubscription[]
  confirmedOrders: QuickyConfirmedOrder[]
  userProfile: QuickyUserProfile
  shoppingHistory: QuickyShoppingHistoryEntry[]
  budgetProfile: QuickyBudgetProfile
  favoriteCategories: string[]
  addFunds: (amount: number) => void
  spendWallet: (amount: number) => boolean
  saveSubscription: (input: SaveSubscriptionInput) => QuickySubscription
  recordOrder: (input: RecordOrderInput) => QuickyConfirmedOrder
  updateUserProfile: (profile: Partial<QuickyUserProfile>) => void
  rememberShoppingTrip: (entry: Omit<QuickyShoppingHistoryEntry, 'id' | 'createdAt'>) => void
  setFavoriteCategories: (categories: string[]) => void
}

const QuickyContext = createContext<QuickyContextValue | undefined>(undefined)

export function QuickyProvider({ children }: { children: ReactNode }) {
  const [walletBalance, setWalletBalance] = useState(5000)
  const [subscriptions, setSubscriptions] = useState<QuickySubscription[]>([])
  const [confirmedOrders, setConfirmedOrders] = useState<QuickyConfirmedOrder[]>([])
  const [userProfile, setUserProfile] = useState<QuickyUserProfile>({
    dietaryPreferences: [],
    householdSize: 4,
    defaultBudget: 1000,
  })
  const [shoppingHistory, setShoppingHistory] = useState<QuickyShoppingHistoryEntry[]>([])
  const [budgetProfile, setBudgetProfile] = useState<QuickyBudgetProfile>({
    preferredCartTier: 'balanced',
    averageOrderValue: 0,
  })
  const [favoriteCategories, setFavoriteCategoriesState] = useState<string[]>(['snacks', 'groceries'])

  const addFunds = (amount: number) => {
    if (amount <= 0) return
    setWalletBalance((current) => current + amount)
  }

  const spendWallet = (amount: number) => {
    let approved = false
    setWalletBalance((current) => {
      if (amount <= current) {
        approved = true
        return current - amount
      }
      return current
    })
    return approved
  }

  const saveSubscription = ({ item, schedule }: SaveSubscriptionInput) => {
    const nextSubscription: QuickySubscription = {
      id: `sub_${Date.now()}_${item.id}`,
      createdAt: new Date().toISOString(),
      schedule,
      totalCost: item.price * item.qty,
      cartItems: [item],
    }

    setSubscriptions((current) => [nextSubscription, ...current])
    return nextSubscription
  }

  const recordOrder = ({ totalCost, cartItems, address, paymentMethod }: RecordOrderInput) => {
    const nextOrder: QuickyConfirmedOrder = {
      id: `order_${Date.now()}_${confirmedOrders.length + 1}`,
      createdAt: new Date().toISOString(),
      totalCost,
      itemCount: cartItems.reduce((sum, item) => sum + item.qty, 0),
      status: 'confirmed',
      address: address || 'A-14, Maple Residency, Andheri East, Mumbai, Maharashtra 400069',
      paymentMethod: paymentMethod || 'Quicky Wallet',
      cartItems,
    }

    setConfirmedOrders((current) => [nextOrder, ...current])
    return nextOrder
  }

  const updateUserProfile = (profile: Partial<QuickyUserProfile>) => {
    setUserProfile((current) => ({
      ...current,
      ...profile,
      dietaryPreferences: profile.dietaryPreferences || current.dietaryPreferences,
    }))
  }

  const rememberShoppingTrip = (entry: Omit<QuickyShoppingHistoryEntry, 'id' | 'createdAt'>) => {
    const nextEntry: QuickyShoppingHistoryEntry = {
      ...entry,
      id: `trip_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    setShoppingHistory((current) => [nextEntry, ...current].slice(0, 20))
    setBudgetProfile((current) => {
      const orderCount = shoppingHistory.length + 1
      const averageOrderValue = Math.round(((current.averageOrderValue * shoppingHistory.length) + entry.totalCost) / orderCount)
      return { ...current, averageOrderValue }
    })
  }

  const setFavoriteCategories = (categories: string[]) => {
    setFavoriteCategoriesState([...new Set(categories.map((category) => category.trim()).filter(Boolean))].slice(0, 8))
  }

  const value = useMemo(
    () => ({
      walletBalance,
      subscriptions,
      confirmedOrders,
      userProfile,
      shoppingHistory,
      budgetProfile,
      favoriteCategories,
      addFunds,
      spendWallet,
      saveSubscription,
      recordOrder,
      updateUserProfile,
      rememberShoppingTrip,
      setFavoriteCategories,
    }),
    [budgetProfile, confirmedOrders, favoriteCategories, shoppingHistory, subscriptions, userProfile, walletBalance],
  )

  return <QuickyContext.Provider value={value}>{children}</QuickyContext.Provider>
}

export function useQuicky() {
  const context = useContext(QuickyContext)
  if (!context) {
    throw new Error('useQuicky must be used within a QuickyProvider')
  }
  return context
}
