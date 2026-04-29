'use client'

import { motion } from 'framer-motion'

export default function AboutSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Elemento Decorativo de Fundo */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-cream-100/50 -skew-x-12 translate-x-1/2" />
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-script text-wine-900/40 text-4xl mb-4">Unity Girl Style</p>
          <h2 className="font-serif text-wine-900 text-4xl md:text-5xl font-light mb-10 tracking-tight">
            A Essência do Nosso Estilo
          </h2>
          <div className="w-16 h-px bg-gold-400 mx-auto mb-10" />
          <p className="font-sans text-gray-700 text-lg md:text-xl leading-relaxed mb-6 font-light">
            A UNITY nasceu do desejo de criar algo único. Acreditamos que a forma de se vestir é uma extensão da sua identidade — e cada peça que escolhemos carrega isso.
          </p>
          <p className="font-sans text-gray-500 text-base leading-relaxed mb-12 italic">
            Cada detalhe está sendo pensado com muito cuidado para entregar estilo, confiança e personalidade em cada escolha.
          </p>
          <p className="font-script text-wine-900/60 text-2xl">O começo de tudo. ♡</p>
        </motion.div>
      </div>
    </section>
  )
}
