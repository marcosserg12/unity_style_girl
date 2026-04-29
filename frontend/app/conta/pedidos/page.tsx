'use client'

import { useEffect, useState } from 'react'
import Link                    from 'next/link'
import { Package, ChevronRight } from 'lucide-react'
import { ordersApi }           from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order }          from '@/lib/types'

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  paid:       'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-gray-100 text-gray-600',
}

export default function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.list()
      .then(({ data }) => setOrders(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-2 border-wine-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (orders.length === 0) return (
    <div className="text-center py-20">
      <Package size={48} className="text-gray-200 mx-auto mb-4" />
      <p className="font-serif text-xl text-gray-500 mb-2">Nenhum pedido ainda</p>
      <p className="font-sans text-sm text-gray-400 mb-6">Seus pedidos aparecerão aqui assim que você realizar uma compra.</p>
      <Link href="/produtos" className="btn-primary inline-flex">Começar a Comprar</Link>
    </div>
  )

  return (
    <div>
      <h2 className="font-serif text-2xl text-gray-800 mb-6 font-light">Meus Pedidos</h2>
      <div className="space-y-4">
        {orders.map(order => (
          <Link
            key={order.id}
            href={`/conta/pedidos/${order.id}`}
            className="block bg-white shadow-card hover:shadow-card-hover p-5 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-sans text-xs text-gray-400 uppercase tracking-wider">Pedido</span>
                <p className="font-serif text-gray-800 font-medium">{order.order_number}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {order.status_label}
                </span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-wine-900 transition-colors" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-sans text-xs text-gray-400">{formatDate(order.created_at)}</p>
              <p className="font-serif text-wine-900 font-semibold">{formatPrice(order.total)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
