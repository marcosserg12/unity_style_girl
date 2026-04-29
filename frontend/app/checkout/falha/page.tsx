'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, MessageCircle, ShoppingBag } from 'lucide-react'
import { Suspense } from 'react'

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5500000000000'

function FailureContent() {
  const params   = useSearchParams()
  const orderRef = params.get('external_reference') ?? ''

  const waMessage = encodeURIComponent(
    `Olá! Tive um problema ao pagar o pedido *${orderRef}*. Podem me ajudar?`
  )
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMessage}`

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-16">
      <div className="max-w-md w-full text-center">

        <div className="w-24 h-24 bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-6 rounded-full">
          <XCircle size={44} className="text-red-500" />
        </div>

        <h1 className="font-serif text-2xl text-gray-800 font-light mb-3">Pagamento não aprovado</h1>

        <p className="font-sans text-sm text-gray-500 mb-8 leading-relaxed">
          Houve um problema com seu pagamento. Você pode tentar novamente ou nos chamar no WhatsApp para ajuda.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="w-full bg-wine-900 hover:bg-wine-800 text-cream-100 font-sans font-bold text-xs tracking-widest uppercase py-4 flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingBag size={15} /> Tentar novamente
          </Link>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-sans font-bold text-sm tracking-wider uppercase py-4 flex items-center justify-center gap-3 transition-colors"
          >
            <MessageCircle size={18} /> Falar no WhatsApp
          </a>

          <Link href="/produtos" className="btn-outline flex items-center justify-center">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutFalhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-wine-900/20 border-t-wine-900 rounded-full animate-spin" />
      </div>
    }>
      <FailureContent />
    </Suspense>
  )
}
