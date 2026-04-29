'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Check } from 'lucide-react'

export default function Newsletter() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [done,    setDone]    = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setDone(true) }, 1000)
  }

  return (
    <section className="bg-wine-950 py-12 md:py-28 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-wine-900/30 blur-3xl" />
        <div className="absolute -top-10 -right-10 w-64 h-64 border border-gold-400/10 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 border border-gold-400/10 rounded-full" />
        <div className="absolute top-8 left-8 w-px h-16 bg-gold-400/20" />
        <div className="absolute top-8 left-8 h-px w-16 bg-gold-400/20" />
        <div className="absolute bottom-8 right-8 w-px h-16 bg-gold-400/20" />
        <div className="absolute bottom-8 right-8 h-px w-16 bg-gold-400/20" />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 text-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-7"
        >
          <div className="w-14 h-14 border border-gold-400/40 flex items-center justify-center">
            <Mail size={22} className="text-gold-400" strokeWidth={1.2} />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <p className="font-script text-gold-400 text-2xl mb-1">exclusivo</p>
          <h2 className="font-serif text-cream-100 text-3xl md:text-4xl font-light mb-4">
            Fique por dentro das novidades
          </h2>
          <p className="font-sans text-cream-100/50 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
            Receba em primeira mão lançamentos, promoções exclusivas e dicas de moda direto no seu e-mail.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          {done ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-14 h-14 bg-gold-400 flex items-center justify-center">
                <Check size={24} className="text-wine-950" strokeWidth={2.5} />
              </div>
              <p className="font-serif text-cream-100 text-xl">Cadastrado com sucesso!</p>
              <p className="font-sans text-cream-100/50 text-sm">Em breve você receberá nossas novidades.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              {/* Name */}
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="flex-1 bg-white/5 border border-white/15 px-4 py-3.5 font-sans text-sm text-cream-100 placeholder:text-cream-100/30 focus:outline-none focus:border-gold-400 transition-colors duration-200"
              />
              {/* Email */}
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/5 border border-white/15 px-4 py-3.5 font-sans text-sm text-cream-100 placeholder:text-cream-100/30 focus:outline-none focus:border-gold-400 transition-colors duration-200"
              />
              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="shrink-0 bg-gold-400 hover:bg-gold-500 text-wine-950 px-7 py-3.5 font-sans text-[11px] font-bold tracking-[0.25em] uppercase transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-wine-950/30 border-t-wine-950 rounded-full animate-spin" />
                ) : (
                  <>Cadastrar <ArrowRight size={13} /></>
                )}
              </button>
            </form>
          )}
        </motion.div>

        {/* Privacy note */}
        {!done && (
          <p className="font-sans text-[10px] text-cream-100/25 mt-5 tracking-wider">
            Sem spam. Cancele quando quiser.
          </p>
        )}
      </div>
    </section>
  )
}
