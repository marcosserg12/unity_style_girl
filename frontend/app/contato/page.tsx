'use client'

import { useState } from 'react'
import { Instagram, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

const channels = [
  {
    icon: Phone,
    label: 'WhatsApp',
    value: '(61) 98239-5045',
    desc: 'Seg – Sex, 9h às 18h',
    href: 'https://wa.me/5561982395045',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@useunitygirl',
    desc: 'DM aberta para atendimento',
    href: 'https://instagram.com/useunitygirl',
  },
  {
    icon: Mail,
    label: 'E-mail',
    value: 'unitygirlstyle@gmail.com',
    desc: 'Respondemos em até 24h úteis',
    href: 'mailto:unitygirlstyle@gmail.com',
  },
  {
    icon: MapPin,
    label: 'Localização',
    value: 'Brasília — DF',
    desc: 'Retirada mediante agendamento',
    href: null,
  },
]

export default function ContatoPage() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  return (
    <>
      {/* Hero */}
      <div className="bg-cream-100 border-b border-cream-300 py-14">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="font-script text-wine-900 text-2xl mb-1">fale com a gente</p>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 font-light">Contato</h1>
          <div className="flex items-center gap-3 justify-center mt-3">
            <span className="flex-1 max-w-12 h-px bg-wine-900 opacity-30" />
            <span className="font-sans text-[9px] text-gray-400 tracking-[0.28em] uppercase">Unity Girl Style</span>
            <span className="flex-1 max-w-12 h-px bg-wine-900 opacity-30" />
          </div>
          <p className="font-sans text-sm text-gray-500 mt-4">
            Estamos aqui para ajudar. Escolha o canal que preferir.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Canais */}
          <div>
            <h2 className="font-serif text-2xl text-gray-800 font-light mb-6">Nossos Canais</h2>
            <div className="space-y-4 mb-8">
              {channels.map(({ icon: Icon, label, value, desc, href }) => (
                <div key={label} className="flex items-start gap-4 p-5 bg-white border border-gray-100 hover:border-wine-900/20 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 bg-cream-200 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-wine-900" />
                  </div>
                  <div>
                    <p className="font-sans text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="font-sans text-sm font-semibold text-wine-900 hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-sans text-sm font-semibold text-gray-700">{value}</p>
                    )}
                    <p className="font-sans text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-wine-900 text-cream-100 p-6">
              <p className="font-script text-gold-400 text-xl mb-1">atendimento rápido</p>
              <p className="font-serif text-base font-light mb-3">Prefere resolver na hora?</p>
              <a
                href="https://wa.me/5561982395045"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold-400 text-wine-950 font-sans font-bold text-xs tracking-widest uppercase px-5 py-3 hover:bg-gold-300 transition-colors"
              >
                <Phone size={14} /> Chamar no WhatsApp
              </a>
            </div>
          </div>

          {/* Formulário */}
          <div>
            <h2 className="font-serif text-2xl text-gray-800 font-light mb-6">Envie uma Mensagem</h2>

            {sent ? (
              <div className="bg-cream-100 border border-cream-300 p-10 text-center">
                <div className="w-14 h-14 bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CheckCircle size={28} className="text-wine-900" />
                </div>
                <p className="font-serif text-xl text-gray-800 font-light mb-2">Mensagem enviada!</p>
                <p className="font-sans text-sm text-gray-500">Respondemos em até 24h úteis. Obrigada pelo contato!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Nome</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full border border-gray-200 px-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-wine-900 transition-colors bg-white"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Telefone</label>
                    <input
                      type="tel"
                      required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-gray-200 px-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-wine-900 transition-colors bg-white"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Assunto</label>
                  <select
                    required
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full border border-gray-200 px-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-wine-900 transition-colors bg-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="pedido">Dúvida sobre pedido</option>
                    <option value="troca">Troca ou devolução</option>
                    <option value="produto">Informações sobre produto</option>
                    <option value="pagamento">Pagamento</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Mensagem</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full border border-gray-200 px-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-wine-900 transition-colors bg-white resize-none"
                    placeholder="Como podemos ajudar?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-wine-900 hover:bg-wine-800 text-cream-100 font-sans font-bold text-xs tracking-widest uppercase py-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-cream-100/30 border-t-cream-100 rounded-full animate-spin" />
                  ) : (
                    <><Send size={14} /> Enviar mensagem</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
