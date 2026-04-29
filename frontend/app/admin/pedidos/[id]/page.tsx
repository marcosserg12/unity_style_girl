'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Package, User, MapPin, CreditCard,
  Calendar, CheckCircle2, XCircle, AlertTriangle, X,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-700' },
  paid:       { label: 'Pago',        color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processando', color: 'bg-purple-100 text-purple-700' },
  shipped:    { label: 'Enviado',     color: 'bg-indigo-100 text-indigo-700' },
  delivered:  { label: 'Entregue',    color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Cancelado',   color: 'bg-red-100 text-red-700' },
}

const PAYMENT_LABEL: Record<string, string> = {
  pix:         'PIX',
  credit_card: 'Cartão de Crédito',
  mercado_pago:'Mercado Pago',
}

export default function OrderDetailPage() {
  const router      = useRouter()
  const { id }      = useParams()
  const [order, setOrder]           = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [updating, setUpdating]     = useState(false)
  const [cancelModal, setCancelModal] = useState(false)

  async function fetchOrder() {
    try {
      const { data } = await api.get(`/admin/orders/${id}`)
      setOrder(data)
    } catch {
      toast.error('Pedido não encontrado.')
      router.push('/admin/pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrder() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(status: string) {
    setUpdating(true)
    try {
      const { data } = await api.patch(`/admin/orders/${id}/status`, { status })
      setOrder(data.order)
      toast.success(status === 'delivered' ? 'Pedido confirmado como entregue!' : 'Pedido cancelado.')
    } catch {
      toast.error('Erro ao atualizar o pedido.')
    } finally {
      setUpdating(false)
      setCancelModal(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-gray-400 font-sans">Carregando...</div>
  if (!order)  return null

  const s           = STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
  const addr        = order.shipping_address ?? {}
  const canAct      = !['delivered', 'cancelled', 'refunded'].includes(order.status)
  const daysOld     = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 86_400_000)
  const nearExpiry  = order.status === 'pending' && daysOld >= 3

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/pedidos" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-serif text-2xl text-gray-800 font-medium">
                Pedido #{order.order_number}
              </h2>
              <span className={clsx('px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest', s.color)}>
                {order.status_label ?? s.label}
              </span>
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-1">
              <Calendar size={14} /> {formatDate(order.created_at)}
              {daysOld > 0 && <span className="text-gray-400">({daysOld} dia{daysOld > 1 ? 's' : ''})</span>}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        {canAct && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCancelModal(true)}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-red-300 text-red-600 hover:bg-red-50 font-sans font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
            >
              <XCircle size={15} /> Cancelar Pedido
            </button>
            <button
              onClick={() => updateStatus('delivered')}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-sans font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={15} /> Confirmar Entrega
            </button>
          </div>
        )}
      </div>

      {/* Aviso pedido quase vencendo */}
      {nearExpiry && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-5 py-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="font-sans text-sm text-amber-800">
            <strong>Atenção:</strong> este pedido está pendente há {daysOld} dias. Será cancelado automaticamente em{' '}
            <strong>{4 - daysOld} dia{4 - daysOld > 1 ? 's' : ''}</strong> caso não seja confirmado.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Itens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2 text-gray-800 font-medium">
              <Package size={18} /> Itens do Pedido
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item: any) => {
                const snap = item.product_snapshot ?? {}
                return (
                  <div key={item.id} className="p-6 flex items-center gap-4">
                    <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden shrink-0">
                      {snap.image_url ? (
                        <Image src={snap.image_url} alt={snap.name ?? ''} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{snap.name}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        {snap.size  && <p className="text-xs text-gray-400">Tamanho: {snap.size}</p>}
                        {snap.color && <p className="text-xs text-gray-400">Cor: {snap.color}</p>}
                        {snap.sku   && <p className="text-xs text-gray-400">SKU: {snap.sku}</p>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Qtd: <strong>{item.quantity}</strong></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-wine-900">{formatPrice(item.unit_price)}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">unid.</p>
                      <p className="text-sm font-bold text-gray-700 mt-1">{formatPrice(item.total_price)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="bg-gray-50/50 p-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-800 font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Frete</span>
                <span className="text-gray-800 font-medium">
                  {order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'A combinar'}
                </span>
              </div>
              <div className="flex justify-between text-lg border-t border-gray-100 pt-3">
                <span className="font-serif text-gray-800 font-bold">Total</span>
                <span className="font-serif text-wine-900 font-bold">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel lateral */}
        <div className="space-y-6">

          {/* Cliente */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-serif text-lg font-medium text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
              <User size={18} /> Cliente
            </h3>
            <p className="text-sm font-bold text-gray-800">{order.user?.name ?? addr.recipient_name ?? '—'}</p>
            {order.user?.email && <p className="text-sm text-gray-500">{order.user.email}</p>}
            {(order.user?.phone || addr.whatsapp) && (
              <p className="text-sm text-gray-500">{order.user?.phone ?? addr.whatsapp}</p>
            )}
          </div>

          {/* Entrega */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-serif text-lg font-medium text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
              <MapPin size={18} /> Entrega
            </h3>
            {addr.street ? (
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-800">{addr.street}, {addr.number}</p>
                {addr.complement && <p>{addr.complement}</p>}
                <p>{addr.neighborhood}</p>
                <p>{addr.city} — {addr.state}</p>
                {addr.zip_code && <p>CEP: {addr.zip_code}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Entrega combinada via WhatsApp</p>
            )}
            {addr.whatsapp && (
              <p className="text-sm text-gray-500 font-medium">WhatsApp: {addr.whatsapp}</p>
            )}
          </div>

          {/* Pagamento */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <h3 className="font-serif text-lg font-medium text-gray-800 border-b border-gray-50 pb-3 flex items-center gap-2">
              <CreditCard size={18} /> Pagamento
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Método</span>
              <span className="font-bold text-gray-800">
                {PAYMENT_LABEL[order.payment_method] ?? order.payment_method ?? '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className={clsx('font-bold', order.payment_status === 'paid' ? 'text-green-700' : 'text-yellow-700')}>
                {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de cancelamento */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCancelModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center text-center gap-5">
            <button
              onClick={() => setCancelModal(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-600" />
            </div>

            <div>
              <h3 className="font-serif text-xl text-gray-800 font-medium mb-2">Cancelar pedido?</h3>
              <p className="font-sans text-sm text-gray-500 leading-relaxed">
                Tem certeza que deseja cancelar o pedido{' '}
                <strong className="text-gray-700">#{order.order_number}</strong>?
                <br />
                O estoque de todos os itens será restaurado automaticamente.
              </p>
            </div>

            <div className="w-full flex flex-col gap-3 mt-2">
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={updating}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-sans font-bold text-xs tracking-widest uppercase py-3.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {updating ? 'Cancelando...' : <><XCircle size={15} /> Sim, cancelar pedido</>}
              </button>
              <button
                onClick={() => setCancelModal(false)}
                className="font-sans text-sm text-gray-500 hover:text-gray-800 transition-colors py-1"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
