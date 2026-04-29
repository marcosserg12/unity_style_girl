'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, MessageCircle, Package } from 'lucide-react'
import { Suspense } from 'react'

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5500000000000'

function PendingContent() {
  const params   = useSearchParams()
  const orderRef = params.get('external_reference') ?? ''

  const waMessage = encodeURIComponent(
    `Olá! Fiz o pagamento do pedido *${orderRef}* e ele está em processamento. Tudo certo?`
  )
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMessage}`

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-16">
      <div className="max-w-md w-full text-center">

        <div className="w-24 h-24 bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center mx-auto mb-6 rounded-full">
          <Clock size={44} className="text-yellow-600" />
        </div>

        <h1 className="font-serif text-2xl text-gray-800 font-light mb-3">Pagamento em Processamento</h1>

        {orderRef && (
          <div className="bg-cream-100 border border-cream-300 px-5 py-3 mb-6 inline-block">
            <p className="font-sans text-xs text-gray-500 uppercase tracking-wider mb-0.5">Seu pedido</p>
            <p className="font-sans text-lg font-bold text-wine-900">{orderRef}</p>
          </div>
        )}

        <p className="font-sans text-sm text-gray-500 mb-2 leading-relaxed">
          Seu pagamento está sendo processado. Pode levar até <strong>2 dias úteis</strong> para ser confirmado (comum em boletos).
        </p>
        <p className="font-sans text-sm text-gray-400 mb-8">
          Assim que confirmarmos, entraremos em contato para combinar a entrega.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-sans font-bold text-sm tracking-wider uppercase py-4 flex items-center justify-center gap-3 transition-colors"
          >
            <MessageCircle size={18} /> Falar no WhatsApp
          </a>

          <Link href="/conta/pedidos" className="btn-outline flex items-center gap-2 justify-center">
            <Package size={15} /> Ver meus pedidos
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPendentePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-wine-900/20 border-t-wine-900 rounded-full animate-spin" />
      </div>
    }>
      <PendingContent />
    </Suspense>
  )
}
