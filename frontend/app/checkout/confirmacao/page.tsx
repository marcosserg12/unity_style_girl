'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, CheckCircle2, Package, ShoppingBag } from 'lucide-react'

interface ConfirmData {
  orderNumber: string
  waUrl:       string
  waText:      string
}

export default function ConfirmacaoPage() {
  const [data, setData] = useState<ConfirmData | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('ug_checkout_confirm')
    if (raw) {
      setData(JSON.parse(raw))
      sessionStorage.removeItem('ug_checkout_confirm')
    }
  }, [])

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-5">
      <ShoppingBag size={48} className="text-gray-200" />
      <p className="font-serif text-xl text-gray-500">Nenhum pedido encontrado.</p>
      <Link href="/produtos" className="btn-primary">Ver produtos</Link>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-5 py-14">

      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4" />
        <p className="font-script text-wine-900 text-3xl leading-none mb-1">obrigada!</p>
        <h1 className="font-serif text-2xl text-gray-800 font-light">
          {data.orderNumber ? `Pedido ${data.orderNumber} registrado` : 'Pedido registrado com sucesso'}
        </h1>
        <p className="font-sans text-sm text-gray-500 mt-3 leading-relaxed">
          Agora é só enviar a mensagem abaixo para nossa equipe. Clique no botão verde e o WhatsApp já abre com tudo preenchido.
        </p>
      </div>

      {/* Prévia da mensagem */}
      <div className="bg-[#f0f4f0] border border-gray-200 mb-6">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-[#e8ede8]">
          <MessageCircle size={14} className="text-[#25D366]" />
          <span className="font-sans text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Mensagem que será enviada
          </span>
        </div>
        <pre className="px-4 py-4 font-sans text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {data.waText}
        </pre>
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-3">
        <a
          href={data.waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-sans font-bold text-sm tracking-widest uppercase py-4 flex items-center justify-center gap-2.5 transition-colors shadow-sm"
        >
          <MessageCircle size={18} /> Enviar pelo WhatsApp
        </a>

        {data.orderNumber && (
          <Link
            href="/conta/pedidos"
            className="w-full border-2 border-wine-900 text-wine-900 hover:bg-wine-900 hover:text-cream-100 font-sans font-bold text-xs tracking-widest uppercase py-3.5 flex items-center justify-center gap-2 transition-colors"
          >
            <Package size={15} /> Ver em Meus Pedidos
          </Link>
        )}

        <div className="bg-amber-50 border border-amber-200 px-4 py-3 mt-1">
          <p className="font-sans text-xs text-amber-800 leading-relaxed text-center">
            <strong>Não conseguiu enviar agora?</strong> Sem problema — acesse{' '}
            <Link href="/conta/pedidos" className="underline font-semibold">Meus Pedidos</Link>{' '}
            e clique em <em>"Reenviar pelo WhatsApp"</em> a qualquer momento.
          </p>
        </div>

        <Link
          href="/produtos"
          className="text-center font-sans text-xs text-gray-400 hover:text-wine-900 transition-colors py-2"
        >
          Continuar comprando
        </Link>
      </div>

    </div>
  )
}
