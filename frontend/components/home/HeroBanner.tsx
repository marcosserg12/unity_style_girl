'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Sparkles, Gift } from 'lucide-react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import type { Banner } from '@/lib/types'

const FALLBACK_BANNERS: Banner[] = [
  {
    id: 1,
    title: 'Nova Coleção',
    subtitle: 'Elegância e personalidade em cada detalhe da sua vida.',
    cta_text: 'Explorar Coleção',
    cta_link: '/produtos',
    desktop_url: '/images/hero-main.png',
    mobile_url:  '/images/hero-main.png',
    display_order: 0,
    show_badge: false, badge_label: null, badge_text: null, badge_subtext: null, disclaimer: null,
    text_position: 'left', eyebrow_text: null,
  },
  {
    id: 2,
    title: 'Promoção Especial',
    subtitle: 'Até 40% de desconto em peças selecionadas da coleção.',
    cta_text: 'Ver Promoções',
    cta_link: '/produtos?filter=sale',
    desktop_url: '/images/hero-main.png',
    mobile_url:  '/images/hero-main.png',
    display_order: 1,
    show_badge: false, badge_label: null, badge_text: null, badge_subtext: null, disclaimer: null,
    text_position: 'left', eyebrow_text: null,
  },
]

const PARTICLES = [
  { top: '18%', left: '7%',   size: 10, delay: 0,   dur: 7   },
  { top: '38%', left: '4%',   size: 7,  delay: 1.5, dur: 9   },
  { top: '68%', left: '9%',   size: 9,  delay: 0.8, dur: 8   },
  { top: '12%', right: '7%',  size: 8,  delay: 0.4, dur: 6   },
  { top: '52%', right: '5%',  size: 12, delay: 2,   dur: 10  },
  { top: '77%', right: '11%', size: 7,  delay: 1.2, dur: 7.5 },
]

interface Props { banners?: Banner[] }

export default function HeroBanner({ banners = FALLBACK_BANNERS }: Props) {
  const [current, setCurrent] = useState(0)
  const [busy, setBusy]       = useState(false)
  const total = banners.length

  const goTo = useCallback((i: number) => {
    if (busy || i === current) return
    setBusy(true)
    setTimeout(() => { setCurrent(i); setBusy(false) }, 300)
  }, [current, busy])

  const next = useCallback(() => goTo((current + 1) % total), [current, total, goTo])
  const prev = useCallback(() => goTo((current - 1 + total) % total), [current, total, goTo])

  useEffect(() => {
    if (total <= 1) return
    const t = setInterval(next, 6200)
    return () => clearInterval(t)
  }, [next, total])

  const b = banners[current]

  return (
    <section className="relative w-full overflow-hidden bg-wine-950" style={{ height: 'clamp(520px, 76vh, 750px)' }}>

      {/* Fundo animado */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <Image src={b.desktop_url} alt={b.title} fill priority quality={92} className="object-cover object-center" style={{ opacity: 0.55 }} />
          <div className={clsx('absolute inset-0', b.text_position === 'right' ? 'bg-gradient-to-l from-wine-950/93 via-wine-950/62 to-wine-950/18' : 'bg-gradient-to-r from-wine-950/93 via-wine-950/62 to-wine-950/18')} />
          <div className="absolute inset-0 bg-gradient-to-t from-wine-950/65 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Partículas */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none z-10"
          style={{ top: p.top, left: (p as any).left, right: (p as any).right }}
          animate={{ y: [0, -16, -5, 0], rotate: [0, 12, -7, 0], opacity: [0.2, 0.6, 0.3, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={p.size} className="text-gold-400" style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.8))' }} />
        </motion.div>
      ))}

      {/* Badge de promoção — configurável por slide */}
      {b.show_badge && (b.badge_text || b.badge_label) && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute top-6 right-6 md:top-8 md:right-10 z-30 hidden sm:flex"
        >
          <div className="bg-wine-900/90 backdrop-blur-sm border border-gold-400/30 px-4 py-3 max-w-[220px] text-right shadow-wine">
            {b.badge_label && (
              <div className="flex items-center justify-end gap-1.5 mb-1">
                <Gift size={11} className="text-gold-400" />
                <span className="font-sans text-[9px] font-bold tracking-[0.25em] uppercase text-gold-400">{b.badge_label}</span>
              </div>
            )}
            {b.badge_text && (
              <p className="font-serif text-cream-100 text-sm font-light leading-tight">{b.badge_text}</p>
            )}
            {b.badge_subtext && (
              <p className="font-sans text-[9px] text-cream-100/60 mt-0.5">{b.badge_subtext}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Conteúdo principal */}
      <div className="relative z-20 h-full flex items-center">
        <div className={clsx('max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full flex', b.text_position === 'right' && 'justify-end')}>
          <AnimatePresence mode="wait">
            <motion.div
              key={"c"+current}
              className="max-w-2xl"
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            >
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 mb-5">
                <span className="w-8 h-px bg-gold-400" />
                <span className="font-sans text-[10px] font-bold tracking-[0.35em] uppercase text-gold-400">{b.eyebrow_text || 'Unity Girl Style'}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.65 }}
                className="font-serif text-cream-100 font-light leading-[1.08] mb-4"
                style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}
              >
                {b.title}
              </motion.h1>

              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.45, duration: 0.5 }} className="origin-left h-px w-24 bg-gold-400/60 mb-5" />

              {b.subtitle && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-cream-100/90 font-sans text-base md:text-lg mb-9 leading-relaxed max-w-md">
                  {b.subtitle}
                </motion.p>
              )}

              {b.cta_link && b.cta_text && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }} className="flex flex-col items-start gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Link href={b.cta_link} className="btn-primary relative overflow-hidden group">
                      {b.cta_text}
                      <span className="absolute inset-0 bg-white/12 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 skew-x-12" />
                    </Link>
                    <Link href="/produtos" className="font-sans text-xs font-semibold tracking-[0.25em] uppercase text-cream-100/60 hover:text-cream-100 transition-colors flex items-center gap-2 group">
                      <span className="w-5 h-px bg-cream-100/40 group-hover:w-9 group-hover:bg-cream-100 transition-all duration-300" />
                      Ver catálogo
                    </Link>
                  </div>
                  {b.disclaimer && (
                    <p className="font-sans text-[10px] text-cream-100/40 italic leading-relaxed max-w-sm">{b.disclaimer}</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navegação */}
      {total > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-wine-900 text-cream-100 border border-cream-100/20 hover:border-transparent transition-all duration-300 group" aria-label="Anterior">
            <ChevronLeft size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={next} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-wine-900 text-cream-100 border border-cream-100/20 hover:border-transparent transition-all duration-300 group" aria-label="Proximo">
            <ChevronRight size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2.5 items-center">
            {banners.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={clsx('transition-all duration-400 rounded-full', i === current ? 'w-8 h-2 bg-gold-400' : 'w-2 h-2 bg-cream-100/35 hover:bg-cream-100/65')} aria-label={`Banner ${i + 1}`} />
            ))}
          </div>
        </>
      )}

      {/* Scroll indicator */}
      <motion.div className="absolute bottom-7 right-8 md:right-12 z-30 hidden md:flex flex-col items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        <span className="font-sans text-[8px] tracking-[0.35em] uppercase text-cream-100/30 [writing-mode:vertical-rl]">scroll</span>
        <motion.div className="w-px h-10 bg-gradient-to-b from-cream-100/40 to-transparent" animate={{ scaleY: [1, 0.2, 1] }} transition={{ duration: 2.2, repeat: Infinity }} />
      </motion.div>
    </section>
  )
}
