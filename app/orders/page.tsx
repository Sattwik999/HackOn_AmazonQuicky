'use client'

import { useEffect, useState } from 'react'
import { db, type Order } from '@/lib/database'
import { Package, Truck, CheckCircle, XCircle, Clock, ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = db.getCurrentUserId()
    const userOrders = db.getUserOrders(userId)
    setOrders(userOrders)
    setLoading(false)
  }, [])

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-400" size={20} />
      case 'confirmed':
        return <CheckCircle className="text-blue-400" size={20} />
      case 'shipped':
        return <Truck className="text-purple-400" size={20} />
      case 'delivered':
        return <CheckCircle className="text-green-400" size={20} />
      case 'cancelled':
        return <XCircle className="text-red-400" size={20} />
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-200 border-yellow-500/20'
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-200 border-blue-500/20'
      case 'shipped':
        return 'bg-purple-500/10 text-purple-200 border-purple-500/20'
      case 'delivered':
        return 'bg-green-500/10 text-green-200 border-green-500/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-200 border-red-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <Package className="mx-auto mb-4 animate-bounce text-cyan-400" size={48} />
          <p className="text-slate-300">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">Your Orders</h1>
            <p className="text-sm text-slate-400">Track and manage your purchases</p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <Package className="mx-auto mb-4 text-slate-600" size={64} />
            <h2 className="mb-2 text-xl font-bold text-white">No orders yet</h2>
            <p className="mb-6 text-slate-400">Start shopping with Quicky to see your orders here</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#ffd814] px-6 py-3 font-bold text-slate-950 transition-transform hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] backdrop-blur-sm transition-all hover:border-white/20"
              >
                {/* Order Header */}
                <div className="border-b border-white/10 bg-white/5 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">Order ID: {order.id}</p>
                      <p className="text-sm text-slate-400">Placed on {formatDate(order.orderedAt)}</p>
                      {order.trackingId && (
                        <p className="text-sm text-slate-400">Tracking: {order.trackingId}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">{formatCurrency(order.totalAmount)}</p>
                      <p className="text-xs text-slate-400">{order.items.length} items</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-5">
                  <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={`${order.id}_${idx}`}
                        className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-16 w-16 rounded-xl bg-white object-contain p-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-bold text-white">{item.title}</p>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-cyan-300">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <MapPin size={14} />
                      Delivery Address
                    </div>
                    <p className="text-sm font-semibold text-white">{order.deliveryAddress.type.toUpperCase()}</p>
                    <p className="text-sm text-slate-300">
                      {order.deliveryAddress.addressLine1}
                      {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                    </p>
                    <p className="text-sm text-slate-300">
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
