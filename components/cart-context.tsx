'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  qty: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  addManyToCart: (items: CartItem[]) => void
  removeFromCart: (id: string) => void
  updateQty: (id: string, delta: number) => void
  clearCart: () => void
  cartTotalItems: number
  cartSubtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = (newItem: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === newItem.id)
      if (existing) {
        return prev.map(item => item.id === newItem.id ? { ...item, qty: item.qty + newItem.qty } : item)
      }
      return [...prev, newItem]
    })
  }

  const addManyToCart = (items: CartItem[]) => {
    items.forEach(addToCart)
  }

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta
        return newQty > 0 ? { ...item, qty: newQty } : item
      }
      return item
    }))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.qty, 0)
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, addManyToCart, removeFromCart, updateQty, clearCart, cartTotalItems, cartSubtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
