'use client'

import { motion } from 'framer-motion'
import { Truck, ShieldCheck, MessageCircle } from 'lucide-react'

const ITEMS = [
  {
    icon: Truck,
    title: 'Frete para Brasília',
    desc: 'Entregamos em Brasília e DF',
    detail: 'Consulte condições no checkout',
  },
  {
    icon: ShieldCheck,
    title: 'Compra Segura',
    desc: 'Seus dados 100% protegidos',
    detail: 'Pagamento criptografado',
  },
  {
    icon: MessageCircle,
    title: 'Atendimento',
    desc: 'Segunda a Sábado',
    detail: '(61) 98239-5045',
  },
]

export default function TrustBar() {
  return (
    <section className="bg-cream-100 border-y border-cream-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-y sm:divide-y-0 divide-cream-300">
          {ITEMS.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex items-center gap-3 px-4 py-4 md:px-8 md:py-9 hover:bg-white transition-colors duration-300 cursor-default"
              >
                {/* Icon */}
                <div className="shrink-0 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center border border-wine-900/15 group-hover:border-wine-900/40 group-hover:bg-wine-900 transition-all duration-300">
                  <Icon
                    size={16}
                    strokeWidth={1.4}
                    className="text-wine-900 md:size-[20px] group-hover:text-cream-100 transition-colors duration-300"
                  />
                </div>

                {/* Text */}
                <div className="min-w-0">
                  <p className="font-sans text-[9px] md:text-[11px] font-bold tracking-[0.1em] md:tracking-[0.18em] uppercase text-wine-900 mb-0.5">
                    {item.title}
                  </p>
                  <p className="font-serif text-gray-700 text-xs md:text-base leading-tight">
                    {item.desc}
                  </p>
                  <p className="hidden md:block font-sans text-[10px] text-gray-400 tracking-wider mt-0.5">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
