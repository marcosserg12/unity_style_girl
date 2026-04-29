'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, MessageCircle, Package } from 'lucide-react'
import { Suspense } from 'react'

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5500000000000'

function SuccessContent() {
  const params = useSearchParams()
  const orderRef   = params.get('external_reference') ?? ''
  const paymentId  = params.get('payment_id') ?? ''
  const status     = params.get('status') ?? 'approved'

  const waMessage = encodeURIComponent(
    `Olá! Acabei de pagar o pedido *${orderRef}* pelo Mercado Pago. Gostaria de combinar a entrega. 😊`
  )
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMessage}`

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-16">
      <div className="max-w-md w-full text-center">

        <div className="w-24 h-24 bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6 rounded-full">
          <CheckCircle size={44} className="text-green-600" />
        </div>

        <p className="font-script text-wine-900 text-3xl mb-1">obrigada!</p>
        <h1 className="font-serif text-2xl text-gray-800 font-light mb-3">Pagamento Confirmado</h1>

        {orderRef && (
          <div className="bg-cream-100 border border-cream-300 px-5 py-3 mb-6 inline-block">
            <p className="font-sans text-xs text-gray-500 uppercase tracking-wider mb-0.5">Seu pedido</p>
            <p className="font-sans text-lg font-bold text-wine-900">{orderRef}</p>
          </div>
        )}

        <p className="font-sans text-sm text-gray-500 mb-8 leading-relaxed">
          Seu pagamento foi aprovado! Agora é só combinar a entrega com a gente pelo WhatsApp.
        </p>

        {/* WhatsApp CTA */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-sans font-bold text-sm tracking-wider uppercase py-4 flex items-center justify-center gap-3 transition-colors mb-3"
        >
          <MessageCircle size={18} />
          Combinar Entrega pelo WhatsApp
        </a>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <Link href="/conta/pedidos" className="btn-outline flex items-center gap-2 justify-center">
            <Package size={15} /> Ver meus pedidos
          </Link>
          <Link href="/produtos" className="btn-outline">
            Continuar comprando
          </Link>
        </div>

        <p className="font-sans text-[10px] text-gray-400 mt-6">
          ID do pagamento: {paymentId}
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-wine-900/20 border-t-wine-900 rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
