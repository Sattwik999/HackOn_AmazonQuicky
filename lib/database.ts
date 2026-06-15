// Simple database implementation using localStorage and IndexedDB
// For production, replace with PostgreSQL, MongoDB, or Firebase

export interface User {
  id: string
  name: string
  email?: string
  phone?: string
  addresses: Address[]
  preferences: UserPreferences
  createdAt: string
  lastActive: string
}

export interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface UserPreferences {
  dietaryRestrictions: string[]
  favoriteCategories: string[]
  budgetRange: { min: number; max: number } | null
  preferredBrands: string[]
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: string
  deliveryAddress: Address
  orderedAt: string
  deliveredAt?: string
  trackingId?: string
}

export interface OrderItem {
  productId: string
  title: string
  quantity: number
  price: number
  image: string
}

export interface ShoppingContext {
  id: string
  userId: string
  query: string
  intent: string
  items: string[]
  budget: number | null
  timestamp: string
  converted: boolean // whether it resulted in an order
}

class DatabaseService {
  private readonly USERS_KEY = 'quicky_users'
  private readonly ORDERS_KEY = 'quicky_orders'
  private readonly CONTEXTS_KEY = 'quicky_contexts'
  private readonly CURRENT_USER_KEY = 'quicky_current_user'

  // User Management
  getCurrentUserId(): string {
    if (typeof window === 'undefined') return 'guest'
    let userId = localStorage.getItem(this.CURRENT_USER_KEY)
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(this.CURRENT_USER_KEY, userId)
      this.createUser(userId)
    }
    return userId
  }

  createUser(userId: string): User {
    const user: User = {
      id: userId,
      name: 'Guest User',
      addresses: [],
      preferences: {
        dietaryRestrictions: [],
        favoriteCategories: [],
        budgetRange: null,
        preferredBrands: [],
      },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    }
    
    const users = this.getUsers()
    users[userId] = user
    this.saveUsers(users)
    return user
  }

  getUser(userId?: string): User | null {
    const id = userId || this.getCurrentUserId()
    const users = this.getUsers()
    return users[id] || null
  }

  updateUser(userId: string, updates: Partial<User>): User {
    const users = this.getUsers()
    const user = users[userId]
    if (!user) throw new Error('User not found')
    
    users[userId] = { ...user, ...updates, lastActive: new Date().toISOString() }
    this.saveUsers(users)
    return users[userId]
  }

  addAddress(userId: string, address: Omit<Address, 'id'>): Address {
    const user = this.getUser(userId)
    if (!user) throw new Error('User not found')

    const newAddress: Address = {
      ...address,
      id: `addr_${Date.now()}`,
    }

    // If this is the first address or marked as default, set it as default
    if (user.addresses.length === 0 || newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false)
    }

    user.addresses.push(newAddress)
    this.updateUser(userId, { addresses: user.addresses })
    return newAddress
  }

  getDefaultAddress(userId: string): Address | null {
    const user = this.getUser(userId)
    return user?.addresses.find(addr => addr.isDefault) || user?.addresses[0] || null
  }

  // Order Management
  createOrder(userId: string, items: OrderItem[], deliveryAddress: Address, paymentMethod: string = 'wallet'): Order {
    const order: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      items,
      totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'confirmed',
      paymentMethod,
      deliveryAddress,
      orderedAt: new Date().toISOString(),
      trackingId: `TRK${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
    }

    const orders = this.getOrders()
    orders.push(order)
    this.saveOrders(orders)
    return order
  }

  getUserOrders(userId: string): Order[] {
    const orders = this.getOrders()
    return orders
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime())
  }

  getOrder(orderId: string): Order | null {
    const orders = this.getOrders()
    return orders.find(order => order.id === orderId) || null
  }

  updateOrderStatus(orderId: string, status: Order['status']): Order {
    const orders = this.getOrders()
    const orderIndex = orders.findIndex(order => order.id === orderId)
    if (orderIndex === -1) throw new Error('Order not found')

    orders[orderIndex].status = status
    if (status === 'delivered') {
      orders[orderIndex].deliveredAt = new Date().toISOString()
    }

    this.saveOrders(orders)
    return orders[orderIndex]
  }

  // Shopping Context Management
  saveContext(userId: string, query: string, intent: string, items: string[], budget: number | null): ShoppingContext {
    const context: ShoppingContext = {
      id: `ctx_${Date.now()}`,
      userId,
      query,
      intent,
      items,
      budget,
      timestamp: new Date().toISOString(),
      converted: false,
    }

    const contexts = this.getContexts()
    contexts.push(context)
    // Keep only last 50 contexts per user
    const userContexts = contexts.filter(c => c.userId === userId).slice(-50)
    const otherContexts = contexts.filter(c => c.userId !== userId)
    this.saveContexts([...otherContexts, ...userContexts])
    
    return context
  }

  getUserContexts(userId: string, limit: number = 10): ShoppingContext[] {
    const contexts = this.getContexts()
    return contexts
      .filter(ctx => ctx.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  markContextConverted(contextId: string): void {
    const contexts = this.getContexts()
    const context = contexts.find(c => c.id === contextId)
    if (context) {
      context.converted = true
      this.saveContexts(contexts)
    }
  }

  // Analytics
  getUserStats(userId: string) {
    const orders = this.getUserOrders(userId)
    const contexts = this.getUserContexts(userId, 100)

    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
      conversionRate: contexts.length > 0 ? (contexts.filter(c => c.converted).length / contexts.length) * 100 : 0,
      favoriteCategories: this.extractFavoriteCategories(contexts),
      recentOrders: orders.slice(0, 5),
    }
  }

  private extractFavoriteCategories(contexts: ShoppingContext[]): string[] {
    const categoryCount: Record<string, number> = {}
    contexts.forEach(ctx => {
      ctx.items.forEach(item => {
        const category = item.split(' ')[0].toLowerCase()
        categoryCount[category] = (categoryCount[category] || 0) + 1
      })
    })
    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category]) => category)
  }

  // Storage helpers
  private getUsers(): Record<string, User> {
    if (typeof window === 'undefined') return {}
    const data = localStorage.getItem(this.USERS_KEY)
    return data ? JSON.parse(data) : {}
  }

  private saveUsers(users: Record<string, User>): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  private getOrders(): Order[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.ORDERS_KEY)
    return data ? JSON.parse(data) : []
  }

  private saveOrders(orders: Order[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders))
  }

  private getContexts(): ShoppingContext[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(this.CONTEXTS_KEY)
    return data ? JSON.parse(data) : []
  }

  private saveContexts(contexts: ShoppingContext[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.CONTEXTS_KEY, JSON.stringify(contexts))
  }

  // Clear all data (for testing)
  clearAllData(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.USERS_KEY)
    localStorage.removeItem(this.ORDERS_KEY)
    localStorage.removeItem(this.CONTEXTS_KEY)
  }
}

// Singleton instance
export const db = new DatabaseService()
