import type { Metadata } from 'next'
import { Truck, Clock, MapPin, ShieldCheck, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Entrega e Frete',
  description: 'Entregamos em Brasília e DF via Uber Flash ou retire no local. Saiba como funciona.',
}

const modalities = [
  {
    icon: Zap,
    name: 'Uber Flash',
    subtitle: 'Entrega Rápida',
    desc: 'Entregamos via Uber Flash dentro de Brasília e DF. Combinamos o horário pelo WhatsApp antes de enviar.',
    highlight: true,
  },
  {
    icon: MapPin,
    name: 'Retirada',
    subtitle: 'Brasília — DF',
    desc: 'Retire gratuitamente em nosso ponto de atendimento em Brasília. Agendamos pelo WhatsApp.',
    highlight: false,
  },
]

const faqs = [
  { q: 'Vocês entregam fora de Brasília?',   a: 'No momento atendemos apenas Brasília e entorno (DF). Para outras cidades, entre em contato pelo WhatsApp para verificarmos uma solução.' },
  { q: 'Como funciona o Uber Flash?',         a: 'Após a confirmação do pagamento combinamos o horário de coleta/entrega via WhatsApp. O pedido é enviado pelo aplicativo Uber Flash e você acompanha em tempo real.' },
  { q: 'Qual o prazo de entrega?',            a: 'Via Uber Flash a entrega é feita no mesmo dia ou no dia combinado. Para retirada, agendamos o horário que for melhor para você.' },
  { q: 'Tem custo de entrega?',               a: 'O custo do Uber Flash é calculado pelo aplicativo com base na distância. Para retirada no local não há nenhum custo.' },
]

export default function EntregaPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-cream-100 border-b border-cream-300 py-14">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="font-script text-wine-900 text-2xl mb-1">rápido e próximo</p>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 font-light">Entrega e Frete</h1>
          <div className="flex items-center gap-3 justify-center mt-3">
            <span className="flex-1 max-w-12 h-px bg-wine-900 opacity-30" />
            <span className="font-sans text-[9px] text-gray-400 tracking-[0.28em] uppercase">Unity Girl Style</span>
            <span className="flex-1 max-w-12 h-px bg-wine-900 opacity-30" />
          </div>
          <p className="font-sans text-sm text-gray-500 mt-4 max-w-xl mx-auto leading-relaxed">
            Por enquanto entregamos apenas em <strong>Brasília e DF</strong> via Uber Flash ou retire pessoalmente — rápido, prático e sem complicação.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-14 space-y-14">

        {/* Banner área de atendimento */}
        <div className="bg-wine-900 text-cream-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-gold-400 flex items-center justify-center shrink-0">
            <Truck size={22} className="text-wine-950" />
          </div>
          <div>
            <p className="font-serif text-xl font-light">Atendemos Brasília e DF</p>
            <p className="font-sans text-sm text-cream-100/70 mt-0.5">Entrega via <strong className="text-cream-100">Uber Flash</strong> ou retirada combinada pelo WhatsApp — sem espera de Correios.</p>
          </div>
        </div>

        {/* Modalidades */}
        <div>
          <h2 className="font-serif text-2xl text-gray-800 font-light mb-6">Como Funciona</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {modalities.map(({ icon: Icon, name, subtitle, desc, highlight }) => (
              <div
                key={name}
                className={`p-8 border ${highlight ? 'border-wine-900 bg-cream-100' : 'border-gray-100 bg-white'}`}
              >
                <div className={`w-10 h-10 flex items-center justify-center mb-4 ${highlight ? 'bg-wine-900' : 'bg-cream-200'}`}>
                  <Icon size={18} className={highlight ? 'text-cream-100' : 'text-wine-900'} />
                </div>
                <p className="font-serif text-xl text-gray-800 mb-1">{name}</p>
                <p className="font-sans text-[10px] text-wine-900 font-bold tracking-widest uppercase mb-3">{subtitle}</p>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Passo a passo */}
        <div className="bg-wine-900 text-cream-100 p-8">
          <h2 className="font-serif text-xl font-light mb-6 text-center">Como Pedir</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { step: '01', label: 'Finalize o pedido',  desc: 'Escolha suas peças e conclua o pagamento normalmente pelo site.' },
              { step: '02', label: 'Combinamos tudo',    desc: 'Entramos em contato pelo WhatsApp para agendar a entrega ou retirada.' },
              { step: '03', label: 'Receba ou retire',   desc: 'Via Uber Flash ou no local combinado — rápido e sem burocracia.' },
            ].map(({ step, label, desc }) => (
              <div key={step}>
                <p className="font-script text-gold-400 text-3xl mb-1">{step}</p>
                <p className="font-serif text-cream-100 text-base mb-1">{label}</p>
                <p className="font-sans text-cream-100/60 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-serif text-2xl text-gray-800 font-light mb-6">Dúvidas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-white border border-gray-100 p-5">
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-wine-900 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-gray-800 mb-1">{q}</p>
                    <p className="font-sans text-sm text-gray-500 leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-cream-100 border border-cream-300">
          <ShieldCheck size={20} className="text-wine-900 shrink-0" />
          <p className="font-sans text-sm text-gray-600">
            Dúvidas? Fale conosco pelo WhatsApp{' '}
            <a href="https://wa.me/5561982395045" className="text-wine-900 font-semibold hover:underline">
              (61) 98239-5045
            </a>
            {' '}— respondemos rapidinho.
          </p>
        </div>
      </div>
    </>
  )
}
