'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Eye,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
  X,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  pending:    { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-700', icon: Clock       },
  paid:       { label: 'Pago',        color: 'bg-blue-100 text-blue-700',    icon: CheckCircle2 },
  processing: { label: 'Processando', color: 'bg-purple-100 text-purple-700', icon: Package     },
  shipped:    { label: 'Enviado',     color: 'bg-indigo-100 text-indigo-700', icon: Truck        },
  delivered:  { label: 'Entregue',    color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
  cancelled:  { label: 'Cancelado',   color: 'bg-red-100 text-red-700',      icon: XCircle      },
}

const TERMINAL = ['delivered', 'cancelled', 'refunded']

export default function AdminOrdersPage() {
  const [orders, setOrders]             = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [status, setStatus]             = useState('')
  const [page, setPage]                 = useState(1)
  const [meta, setMeta]                 = useState<any>(null)
  const [updatingId, setUpdatingId]     = useState<number | null>(null)
  const [cancelTarget, setCancelTarget] = useState<any>(null)

  async function fetchOrders() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/orders', {
        params: { page, search, status, per_page: 20 },
      })
      setOrders(data.data)
      setMeta(data)
    } catch {
      toast.error('Erro ao carregar pedidos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [page, status]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusUpdate(orderId: number, newStatus: string) {
    setUpdatingId(orderId)
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
      toast.success(newStatus === 'delivered' ? 'Pedido confirmado como entregue!' : 'Status atualizado!')
      setCancelTarget(null)
      fetchOrders()
    } catch {
      toast.error('Erro ao atualizar status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-gray-800 font-medium">Pedidos</h2>
          <p className="text-gray-500 text-sm mt-1">Acompanhe e gerencie as vendas da loja.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nº do pedido ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-wine-900 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-4 py-2 focus:outline-none focus:border-wine-900"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_MAP).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            onClick={fetchOrders}
            className="bg-wine-900 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">Pedido</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">Cliente</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">Data</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Carregando pedidos...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Nenhum pedido encontrado.</td>
                </tr>
              ) : (
                orders.map((order) => {
                  const s         = STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600', icon: Clock }
                  const StatusIcon = s.icon
                  const canAct    = !TERMINAL.includes(order.status)

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-800">#{order.order_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800">{order.user?.name}</span>
                          <span className="text-[10px] text-gray-400">{order.user?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <select
                            value={order.status}
                            disabled={!canAct || updatingId === order.id}
                            onChange={(e) => {
                              const newStatus = e.target.value
                              if (newStatus === 'cancelled') {
                                setCancelTarget(order)
                              } else {
                                handleStatusUpdate(order.id, newStatus)
                              }
                            }}
                            className={clsx(
                              'text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border-none cursor-pointer outline-none transition-all disabled:cursor-default',
                              s.color,
                            )}
                          >
                            {Object.entries(STATUS_MAP).map(([val, { label }]) => (
                              <option key={val} value={val} className="bg-white text-gray-800">{label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-wine-900">{formatPrice(order.total)}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {canAct && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                disabled={updatingId !== null}
                                title="Confirmar entrega"
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => setCancelTarget(order)}
                                disabled={updatingId !== null}
                                title="Cancelar pedido"
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="p-2 text-gray-400 hover:text-wine-900 hover:bg-wine-50 rounded-lg inline-flex items-center gap-1 transition-all"
                          >
                            <Eye size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Ver</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              Mostrando {meta.from} até {meta.to} de {meta.total} pedidos
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-gray-700 px-3">{page} / {meta.last_page}</span>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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
                onClick={() => handleStatusUpdate(cancelTarget.id, 'cancelled')}
                disabled={updatingId !== null}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs tracking-widest uppercase py-3.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {updatingId !== null ? 'Cancelando...' : <><XCircle size={15} /> Sim, cancelar pedido</>}
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
