import type { QuickySubscription } from '@/lib/quicky'

/*
Backend worker outline for recurring Quicky carts.

1. Cron entry point runs every hour:
   - load active subscriptions due within the current window
   - lock each subscription to avoid double-processing

2. For each due subscription:
   - fetch latest wallet balance from durable storage
   - fetch current product prices and stock
   - if walletBalance < subscription.totalCost:
       mark run as skipped_insufficient_funds
       notify the user in-app / email
       continue
   - create an order draft from subscription.cartItems
   - reserve wallet funds atomically
   - submit the order
   - set next_run_at based on schedule
   - persist an audit log row

3. On failure:
   - release any wallet reservation
   - increment retry_count with exponential backoff
   - emit monitoring events
*/

export function getNextRunAt(schedule: QuickySubscription['schedule'], from = new Date()) {
  const next = new Date(from)

  if (schedule === 'daily') {
    next.setDate(next.getDate() + 1)
    return next
  }

  if (schedule === 'every_7_days') {
    next.setDate(next.getDate() + 7)
    return next
  }

  if (schedule === 'every_14_days') {
    next.setDate(next.getDate() + 14)
    return next
  }

  next.setMonth(next.getMonth() + 1, 1)
  next.setHours(8, 0, 0, 0)
  return next
}
