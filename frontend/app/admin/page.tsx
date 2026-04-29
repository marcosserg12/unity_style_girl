'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Edit,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface Stats {
  total_products:  number
  total_orders:    number
  total_customers: number
  recent_orders:   any[]
  low_stock:       any[]
}

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pendente',    color: 'text-yellow-600' },
  paid:       { label: 'Pago',        color: 'text-blue-600' },
  processing: { label: 'Processando', color: 'text-purple-600' },
  shipped:    { label: 'Enviado',     color: 'text-indigo-600' },
  delivered:  { label: 'Entregue',    color: 'text-green-600' },
  cancelled:  { label: 'Cancelado',   color: 'text-red-600' },
  refunded:   { label: 'Reembolsado', color: 'text-gray-500' },
}

export default function DashboardPage() {
  const [stats, setStats]               = useState<Stats | null>(null)
  const [loading, setLoading]           = useState(true)
  const [updating, setUpdating]         = useState<number | null>(null)
  const [cancelTarget, setCancelTarget] = useState<any>(null)

  async function loadStats() {
    try {
      const { data } = await api.get('/admin/dashboard')
      setStats(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStats() }, [])

  async function updateOrderStatus(orderId: number, newStatus: string) {
    setUpdating(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
      toast.success(newStatus === 'delivered' ? 'Pedido confirmado como entregue!' : 'Pedido cancelado.')
      setCancelTarget(null)
      const { data } = await api.get('/admin/dashboard')
      setStats(data)
    } catch {
      toast.error('Erro ao atualizar o pedido.')
    } finally {
      setUpdating(null)
    }
  }

  const cards = [
    { label: 'Produtos',    value: stats?.total_products  ?? 0, icon: Package,    color: 'bg-blue-500'   },
    { label: 'Pedidos',     value: stats?.total_orders    ?? 0, icon: ShoppingBag, color: 'bg-green-500'  },
    { label: 'Clientes',    value: stats?.total_customers ?? 0, icon: Users,       color: 'bg-purple-500' },
    { label: 'Crescimento', value: '+12%',                      icon: TrendingUp,  color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-5 md:space-y-8">
      <div>
        <h2 className="font-serif text-xl md:text-2xl text-gray-800 font-medium">Dashboard</h2>
        <p className="text-gray-500 text-xs md:text-sm mt-1">Bem-vinda de volta ao centro de controle da Unity Girl Style.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 md:gap-4">
            <div className={`w-10 h-10 md:w-12 md:h-12 ${card.color} text-white rounded-lg flex items-center justify-center shadow-lg shrink-0`}>
              <card.icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-400 truncate">{card.label}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800">{loading ? '...' : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Orders */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="font-serif text-lg font-medium text-gray-800">Pedidos Recentes</h3>
            <Link href="/admin/pedidos" className="text-wine-900 text-sm font-bold uppercase tracking-wider hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="overflow-y-auto max-h-[340px] space-y-1 pr-1 ">
            {loading ? (
              <p className="text-gray-400 text-center py-8">Carregando...</p>
            ) : (stats?.recent_orders?.length ?? 0) === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhum pedido recente.</p>
            ) : (
              stats?.recent_orders.map((order: any) => {
                const s      = ORDER_STATUS[order.status] ?? { label: order.status_label ?? order.status, color: 'text-gray-500' }
                const canAct = !['delivered', 'cancelled', 'refunded'].includes(order.status)
                return (
                  <div key={order.id} className="flex items-center gap-2 md:gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="w-8 h-8 md:w-9 md:h-9 bg-cream-200 rounded-full flex items-center justify-center text-wine-900 text-[10px] md:text-xs font-bold shrink-0 hover:bg-wine-900 hover:text-white transition-colors"
                    >
                      #{order.order_number ?? order.id}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-bold text-gray-800 truncate">{order.user?.name ?? '—'}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] text-gray-400">{formatDate(order.created_at)}</p>
                        <span className={clsx('text-[10px] font-bold uppercase tracking-widest md:hidden', s.color)}>
                          {order.status_label ?? s.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <p className="text-sm font-bold text-gray-800">{formatPrice(order.total)}</p>
                      <span className={clsx('text-[10px] font-bold uppercase tracking-widest', s.color)}>
                        {order.status_label ?? s.label}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-800 shrink-0 md:hidden">{formatPrice(order.total)}</p>
                    {canAct && (
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          disabled={updating !== null}
                          title="Confirmar entrega"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-40"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <button
                          onClick={() => setCancelTarget(order)}
                          disabled={updating !== null}
                          title="Cancelar pedido"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h3 className="font-serif text-lg font-medium text-gray-800">Alertas de Estoque</h3>
              {!loading && (stats?.low_stock?.length ?? 0) > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stats!.low_stock.length}
                </span>
              )}
            </div>
            <Link
              href="/admin/produtos"
              className="text-wine-900 text-xs font-bold uppercase tracking-wider hover:underline"
            >
              Ver produtos
            </Link>
          </div>

          <div className="overflow-y-auto max-h-[340px] divide-y divide-gray-50 ">
            {loading ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">Carregando...</div>
            ) : (stats?.low_stock?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 text-green-500">
                <CheckCircle2 size={36} />
                <p className="text-sm font-medium text-green-600">Estoque em dia!</p>
                <p className="text-xs text-gray-400">Nenhuma variante com 2 ou menos unidades.</p>
              </div>
            ) : (
              stats!.low_stock.map((item: any) => {
                const isOut    = item.stock === 0
                const urgency  = isOut
                  ? { bg: 'bg-red-50',    badge: 'bg-red-100 text-red-700',    icon: 'text-red-500',    label: 'Esgotado' }
                  : { bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-500', label: 'Crítico' }

                return (
                  <div key={item.variant_id} className={`flex items-center gap-3 px-5 py-3.5 ${urgency.bg}`}>
                    {/* Imagem */}
                    <div className="relative w-10 h-14 rounded overflow-hidden bg-gray-100 shrink-0 shadow-sm">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={14} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[item.color, item.size].filter(Boolean).join(' · ')}
                      </p>
                    </div>

                    {/* Badge + ação */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${urgency.badge}`}>
                          {urgency.label}
                        </span>
                        <p className={`text-sm font-bold mt-0.5 ${urgency.icon}`}>
                          {item.stock === 0 ? '— un.' : `${item.stock} un.`}
                        </p>
                      </div>
                      <Link
                        href={`/admin/produtos/${item.product_id}/editar`}
                        className="p-1.5 text-gray-400 hover:text-wine-900 hover:bg-white rounded-lg transition-all"
                        title="Editar produto"
                      >
                        <Edit size={15} />
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmação de cancelamento */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCancelTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center text-center gap-5">
            <button onClick={() => setCancelTarget(null)} className="absolute top-4 right-4 text-gray-300 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-gray-800 font-medium mb-2">Cancelar pedido?</h3>
              <p className="font-sans text-sm text-gray-500 leading-relaxed">
                Tem certeza que deseja cancelar o pedido{' '}
                <strong className="text-gray-700">#{cancelTarget.order_number}</strong>?
                <br />
                O estoque de todos os itens será restaurado automaticamente.
              </p>
            </div>
            <div className="w-full flex flex-col gap-3 mt-2">
              <button
                onClick={() => updateOrderStatus(cancelTarget.id, 'cancelled')}
                disabled={updating !== null}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs tracking-widest uppercase py-3.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {updating !== null ? 'Cancelando...' : <><XCircle size={15} /> Sim, cancelar pedido</>}
              </button>
              <button onClick={() => setCancelTarget(null)} className="font-sans text-sm text-gray-500 hover:text-gray-800 transition-colors py-1">
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
