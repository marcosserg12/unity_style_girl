'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

const FAQS = [
  {
    category: 'Pedidos',
    items: [
      { q: 'Como faço um pedido?',                     a: 'Navegue pelo catálogo, escolha o produto e o tamanho, adicione ao carrinho e finalize a compra. É simples e rápido!' },
      { q: 'Posso alterar ou cancelar meu pedido?',   a: 'Sim, pedidos podem ser alterados ou cancelados antes da postagem. Entre em contato pelo WhatsApp (61) 98239-5045 o mais rápido possível após a compra.' },
      { q: 'Como sei se meu pedido foi confirmado?',  a: 'Você receberá uma confirmação pelo WhatsApp assim que o pagamento for aprovado.' },
      { q: 'Posso comprar sem criar conta?',          a: 'Sim! Você pode finalizar a compra como visitante. Criar uma conta é opcional, mas facilita o acompanhamento de pedidos.' },
    ],
  },
  {
    category: 'Pagamento',
    items: [
      { q: 'Quais formas de pagamento são aceitas?',  a: 'Aceitamos PIX e cartão de crédito em até 6x. O parcelamento pode ter juros dependendo do valor e da operadora.' },
      { q: 'O pagamento é seguro?',                   a: 'Sim. Utilizamos tecnologia SSL e gateways de pagamento certificados. Seus dados nunca são armazenados em nossos servidores.' },
      { q: 'Em quantas vezes posso parcelar?',        a: 'Em até 6x no cartão de crédito. O parcelamento pode ter juros — o valor final é apresentado no checkout.' },
    ],
  },
  {
    category: 'Entrega',
    items: [
      { q: 'Onde vocês entregam?',                    a: 'No momento entregamos apenas em Brasília e DF via Uber Flash. Para outras cidades, entre em contato pelo WhatsApp para verificarmos uma solução.' },
      { q: 'Qual o prazo de entrega?',                a: 'Via Uber Flash a entrega é feita no mesmo dia ou no dia combinado. Para retirada, agendamos o horário que for melhor para você.' },
      { q: 'Como funciona o Uber Flash?',             a: 'Após a confirmação do pagamento combinamos o horário de entrega via WhatsApp e enviamos pelo Uber Flash. Você acompanha em tempo real.' },
      { q: 'Posso retirar pessoalmente?',             a: 'Sim! Retirada gratuita em Brasília — é só combinar o horário pelo WhatsApp (61) 98239-5045.' },
    ],
  },
  {
    category: 'Trocas e Devoluções',
    items: [
      { q: 'Qual o prazo para trocar?',               a: 'Você tem 7 dias corridos após o recebimento para solicitar a troca ou devolução.' },
      { q: 'Como solicito a troca?',                  a: 'Entre em contato via WhatsApp (61) 98239-5045 informando o número do pedido e o motivo da troca.' },
      { q: 'O frete da troca é por minha conta?',    a: 'Em caso de troca por tamanho, o frete de devolução é por conta do cliente. Em caso de defeito, nós cobrimos o frete.' },
      { q: 'Posso trocar por outro produto?',        a: 'Sim, desde que o valor seja equivalente. Caso seja maior, você paga a diferença. Se for menor, geramos um crédito na sua conta.' },
    ],
  },
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-cream-100/50 transition-colors group"
      >
        <span className="font-sans text-sm font-semibold text-gray-800 group-hover:text-wine-900 transition-colors pr-4">
          {q}
        </span>
        <ChevronDown
          size={16}
          className={`text-wine-900 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="font-sans text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FaqPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-cream-100 border-b border-cream-300 py-14">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="font-script text-wine-900 text-2xl mb-1">tire suas dúvidas</p>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 font-light">Perguntas Frequentes</h1>
          <div className="flex items-center gap-3 justify-center mt-3">
            <span className="flex-1 max-w-12 h-px bg-wine-900 opacity-30" />
            <span className="font-sans text-[9px] text-gray-400 tracking-[0.28em] uppercase">Unity Girl Style</span>
            <span className="flex-1 max-w-12 h-px bg-wine-900 opacity-30" />
          </div>
          <p className="font-sans text-sm text-gray-500 mt-4">
            Não encontrou sua resposta?{' '}
            <Link href="/contato" className="text-wine-900 font-semibold hover:underline">Fale conosco</Link>
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 lg:px-8 py-14 space-y-10">
        {FAQS.map(({ category, items }) => (
          <div key={category}>
            <h2 className="font-serif text-xl text-gray-800 font-light mb-3 flex items-center gap-3">
              {category}
              <span className="flex-1 h-px bg-gray-100" />
            </h2>
            <div className="bg-white border border-gray-100 shadow-sm">
              {items.map(item => (
                <AccordionItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        <div className="bg-wine-900 text-cream-100 p-8 text-center">
          <p className="font-script text-gold-400 text-2xl mb-2">ainda com dúvidas?</p>
          <p className="font-serif text-lg font-light mb-4">Estamos aqui para ajudar</p>
          <a
            href="https://wa.me/5561982395045"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gold-400 text-wine-950 font-sans font-bold text-xs tracking-widest uppercase px-6 py-3 hover:bg-gold-300 transition-colors"
          >
            Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </>
  )
}
