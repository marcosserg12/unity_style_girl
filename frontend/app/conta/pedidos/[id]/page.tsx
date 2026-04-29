'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, MapPin, CreditCard, ShoppingBag, MessageCircle } from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { buildWaMessage } from '@/lib/buildWaMessage'
import type { Order } from '@/lib/types'

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5561982395045'

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  paid:       'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  refunded:   'bg-gray-100 text-gray-600',
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  mercado_pago: 'Mercado Pago',
  credit_card:  'Cartão de Crédito',
  debit_card:   'Cartão de Débito',
  pix:          'PIX',
  boleto:       'Boleto',
}

export default function OrderDetailPage() {
  const { id }              = useParams<{ id: string }>()
  const router              = useRouter()
  const [order, setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('ug_token')
    if (!token) { router.push('/login?next=/conta/pedidos'); return }

    ordersApi.detail(Number(id))
      .then(({ data }) => setOrder(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-2 border-wine-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !order) return (
    <div className="text-center py-20">
      <Package size={48} className="text-gray-200 mx-auto mb-4" />
      <p className="font-serif text-xl text-gray-500 mb-2">Pedido não encontrado</p>
      <Link href="/conta/pedidos" className="btn-outline inline-flex mt-4">
        Ver todos os pedidos
      </Link>
    </div>
  )

  const addr = order.shipping_address

  return (
    <div className="space-y-6">
      {/* Voltar */}
      <Link
        href="/conta/pedidos"
        className="inline-flex items-center gap-2 font-sans text-sm text-gray-500 hover:text-wine-900 transition-colors"
      >
        <ArrowLeft size={16} /> Voltar aos pedidos
      </Link>

      {/* Cabeçalho do pedido */}
      <div className="bg-white shadow-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-sans text-xs text-gray-400 uppercase tracking-wider mb-0.5">Pedido</p>
            <p className="font-serif text-2xl text-gray-800 font-light">{order.order_number}</p>
            <p className="font-sans text-sm text-gray-400 mt-1">{formatDate(order.created_at)}</p>
          </div>
          <span className={`badge text-sm px-4 py-1.5 ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {order.status_label}
          </span>
        </div>

        {/* Botão de reenvio via WhatsApp */}
        {order.status === 'pending' && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="font-sans text-xs text-gray-400 mb-3">
              Não conseguiu enviar a mensagem? Clique abaixo para reenviar o pedido pelo WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${buildWaMessage(
                (order.items ?? []).map(i => ({
                  product_name: i.product_snapshot.name,
                  size:         i.product_snapshot.size,
                  color:        i.product_snapshot.color,
                  quantity:     i.quantity,
                  unit_price:   i.unit_price,
                })),
                order.total,
                (order.shipping_address as any)?.recipient_name ?? '',
                (order.shipping_address as any)?.whatsapp ?? '',
                (order.payment_method === 'pix' ? 'pix' : order.payment_method === 'credit_card' ? 'credit_card' : '') as any,
                order.order_number,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white font-sans font-bold text-xs tracking-widest uppercase px-5 py-3 transition-colors"
            >
              <MessageCircle size={15} /> Reenviar pedido pelo WhatsApp
            </a>
          </div>
        )}
      </div>

      {/* Itens */}
      <div className="bg-white shadow-card">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <ShoppingBag size={16} className="text-wine-900" />
          <h2 className="font-serif text-lg text-gray-800">Itens do Pedido</h2>
        </div>
        <ul className="divide-y divide-gray-50">
          {(order.items ?? []).map(item => (
            <li key={item.id} className="flex gap-4 px-6 py-4">
              <div className="relative w-16 h-20 shrink-0 bg-cream-200 overflow-hidden">
                {item.product_snapshot.image_url ? (
                  <Image
                    src={item.product_snapshot.image_url}
                    alt={item.product_snapshot.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={20} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm text-gray-800 font-medium leading-snug">
                  {item.product_snapshot.name}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  {item.product_snapshot.size  && <p className="font-sans text-xs text-gray-400">Tam: {item.product_snapshot.size}</p>}
                  {item.product_snapshot.color && <p className="font-sans text-xs text-gray-400">Cor: {item.product_snapshot.color}</p>}
                  <p className="font-sans text-xs text-gray-400">SKU: {item.product_snapshot.sku}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-sans text-xs text-gray-500">{item.quantity}× {formatPrice(item.unit_price)}</p>
                  <p className="font-serif text-sm text-wine-900 font-semibold">{formatPrice(item.total_price)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Endereço de entrega */}
        <div className="bg-white shadow-card">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <MapPin size={16} className="text-wine-900" />
            <h2 className="font-serif text-lg text-gray-800">Endereço de Entrega</h2>
          </div>
          <div className="px-6 py-4 font-sans text-sm text-gray-600 space-y-1">
            {addr?.recipient_name && <p className="font-semibold text-gray-800">{addr.recipient_name}</p>}
            <p>{addr?.street}, {addr?.number}{addr?.complement ? `, ${addr.complement}` : ''}</p>
            <p>{addr?.neighborhood}</p>
            <p>{addr?.city} – {addr?.state}</p>
            <p>{addr?.zip_code}</p>
            {(addr as any)?.whatsapp && (
              <p className="text-gray-400 pt-1">WhatsApp: {(addr as any).whatsapp}</p>
            )}
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="bg-white shadow-card">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <CreditCard size={16} className="text-wine-900" />
            <h2 className="font-serif text-lg text-gray-800">Pagamento</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between font-sans text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between font-sans text-sm text-gray-500">
              <span>Frete</span>
              <span>{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : <span className="text-green-700">A combinar</span>}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between font-sans text-sm text-green-700">
                <span>Desconto</span>
                <span>– {formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-serif text-lg font-semibold pt-3 border-t border-gray-100">
              <span>Total</span>
              <span className="text-wine-900">{formatPrice(order.total)}</span>
            </div>
            {order.payment_method && (
              <p className="font-sans text-xs text-gray-400 pt-1">
                Método: {PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
