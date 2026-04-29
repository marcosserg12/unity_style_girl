import type { Metadata } from 'next'
import { RefreshCw, CheckCircle, XCircle, Clock, Package, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Troca e Devolução',
  description: 'Conheça nossa política de trocas e devoluções. Troca fácil em até 7 dias.',
}

const items = [
  {
    icon: Clock,
    title: 'Prazo para Troca',
    text: 'Você tem até 7 dias corridos após o recebimento do produto para solicitar a troca ou devolução, conforme o Código de Defesa do Consumidor.',
  },
  {
    icon: Package,
    title: 'Como Solicitar',
    text: 'Entre em contato via WhatsApp (61) 98239-5045 ou pelo e-mail unitygirlstyle@gmail.com informando o número do pedido, o produto e o motivo da troca.',
  },
  {
    icon: CheckCircle,
    title: 'Condições para Troca',
    text: 'O produto deve estar sem uso, com etiquetas originais intactas, na embalagem original e sem sinais de desgaste, lavagem ou perfume.',
  },
  {
    icon: RefreshCw,
    title: 'Troca por Outro Tamanho',
    text: 'Trocas por tamanho diferente são realizadas sujeitas à disponibilidade em estoque. Caso o tamanho desejado não esteja disponível, oferecemos crédito ou reembolso.',
  },
  {
    icon: XCircle,
    title: 'Itens Não Elegíveis',
    text: 'Não aceitamos troca de itens em promoção acima de 30% de desconto, peças íntimas (body e lingerie) por questões de higiene, e produtos com danos causados pelo cliente.',
  },
  {
    icon: AlertCircle,
    title: 'Produto com Defeito',
    text: 'Em caso de defeito de fabricação, a troca é gratuita e o frete de devolução fica por nossa conta. Entre em contato imediatamente após identificar o problema.',
  },
]

export default function PoliticaDeTrocaPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-cream-100 border-b border-cream-300 py-14">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="font-script text-wine-900 text-2xl mb-1">transparência</p>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 font-light">Política de Troca e Devolução</h1>
          <div className="flex items-center gap-3 justify-center mt-3">
            <span className="flex-1 max-w-12 h-px bg-wine-900 opacity-30" />
            <span className="font-sans text-[9px] text-gray-400 tracking-[0.28em] uppercase">Unity Girl Style</span>
            <span className="flex-1 max-w-12 h-px bg-wine-900 opacity-30" />
          </div>
          <p className="font-sans text-sm text-gray-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Queremos que você ame cada peça. Se precisar trocar, estamos aqui para ajudar — rápido e sem complicação.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-14">
        <div className="grid md:grid-cols-2 gap-6">
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-cream-200 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-wine-900" />
                </div>
                <h2 className="font-serif text-gray-800 text-lg font-light">{title}</h2>
              </div>
              <p className="font-sans text-sm text-gray-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-12 bg-wine-900 text-cream-100 p-8">
          <h2 className="font-serif text-xl font-light mb-6 text-center">Como funciona o processo</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { step: '01', label: 'Solicite', desc: 'Entre em contato via WhatsApp ou e-mail em até 7 dias.' },
              { step: '02', label: 'Envie',    desc: 'Enviaremos o endereço para devolução. Embale bem o produto.' },
              { step: '03', label: 'Receba',   desc: 'Após receber e avaliar, enviamos a troca ou o reembolso.' },
            ].map(({ step, label, desc }) => (
              <div key={step}>
                <p className="font-script text-gold-400 text-3xl mb-1">{step}</p>
                <p className="font-serif text-cream-100 text-base mb-1">{label}</p>
                <p className="font-sans text-cream-100/60 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="font-sans text-xs text-gray-400 text-center mt-8">
          Dúvidas? Fale conosco pelo WhatsApp{' '}
          <a href="https://wa.me/5561982395045" className="text-wine-900 font-semibold hover:underline">
            (61) 98239-5045
          </a>
          {' '}— respondemos em até 24h úteis.
        </p>
      </div>
    </>
  )
}
