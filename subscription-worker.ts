import type { CartItem } from '@/components/cart-context'
import type { QuickySubscription } from '@/lib/quicky'
import { getNextRunAt } from '@/lib/quicky-subscriptions'

export interface SubscriptionWorkerAdapters {
  getWalletBalance: (subscription: QuickySubscription) => Promise<number>
  reserveWallet: (subscription: QuickySubscription, amount: number) => Promise<boolean>
  releaseWalletReservation: (subscription: QuickySubscription, amount: number) => Promise<void>
  checkStock: (item: CartItem) => Promise<boolean>
  getLatestPrice: (item: CartItem) => Promise<number>
  createOrder: (subscription: QuickySubscription, items: CartItem[], totalCost: number) => Promise<{ orderId: string }>
  scheduleNextPurchase: (subscription: QuickySubscription, nextRunAt: Date) => Promise<void>
  notify?: (subscription: QuickySubscription, message: string) => Promise<void>
}

export interface SubscriptionRunResult {
  subscriptionId: string
  status: 'ordered' | 'skipped_insufficient_funds' | 'skipped_out_of_stock' | 'failed'
  orderId?: string
  totalCost?: number
  nextRunAt?: string
  message: string
}

export async function runSubscriptionPurchase(
  subscription: QuickySubscription,
  adapters: SubscriptionWorkerAdapters,
): Promise<SubscriptionRunResult> {
  const pricedItems: CartItem[] = []

  for (const item of subscription.cartItems) {
    const inStock = await adapters.checkStock(item)
    if (!inStock) {
      await adapters.notify?.(subscription, `${item.name} is out of stock. Quicky skipped this reorder.`)
      return {
        subscriptionId: subscription.id,
        status: 'skipped_out_of_stock',
        message: `${item.name} is out of stock.`,
      }
    }

    const latestPrice = await adapters.getLatestPrice(item)
    pricedItems.push({ ...item, price: latestPrice })
  }

  const totalCost = pricedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const walletBalance = await adapters.getWalletBalance(subscription)

  if (walletBalance < totalCost) {
    await adapters.notify?.(subscription, `Wallet needs ${totalCost} but has ${walletBalance}. Quicky skipped this reorder.`)
    return {
      subscriptionId: subscription.id,
      status: 'skipped_insufficient_funds',
      totalCost,
      message: 'Insufficient wallet balance.',
    }
  }

  const reserved = await adapters.reserveWallet(subscription, totalCost)
  if (!reserved) {
    return {
      subscriptionId: subscription.id,
      status: 'failed',
      totalCost,
      message: 'Wallet reservation failed.',
    }
  }

  try {
    const order = await adapters.createOrder(subscription, pricedItems, totalCost)
    const nextRunAt = getNextRunAt(subscription.schedule)
    await adapters.scheduleNextPurchase(subscription, nextRunAt)

    return {
      subscriptionId: subscription.id,
      status: 'ordered',
      orderId: order.orderId,
      totalCost,
      nextRunAt: nextRunAt.toISOString(),
      message: 'Subscription order created and next purchase scheduled.',
    }
  } catch (error) {
    await adapters.releaseWalletReservation(subscription, totalCost)
    return {
      subscriptionId: subscription.id,
      status: 'failed',
      totalCost,
      message: error instanceof Error ? error.message : 'Subscription purchase failed.',
    }
  }
}
