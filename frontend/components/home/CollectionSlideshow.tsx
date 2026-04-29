'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Gift } from 'lucide-react'

const SLIDES = [
  {
    id:       'hero',
    image:    '/images/hero-main.png',
    tag:      'Lançamento exclusivo',
    title:    'Ganhe uma bolsa',
    titleItalic: 'exclusiva',
    subtitle: 'Nas 3 primeiras compras acima de R$ 299,99',
    cta:      'Aproveite agora',
    href:     '/produtos',
    promo:    false,
    align:    'left',
    disclaimer: '*Promoção válida por tempo limitado ou enquanto durarem os brindes.',
    noOverlay: true,
  },
  {
    id:       'elegancia',
    image:    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=75',
    tag:      'Outono · Inverno 2025',
    title:    'Elegância',
    titleItalic: 'Atemporal',
    subtitle: 'Peças exclusivas em tecidos nobres. Feitas para mulheres que valorizam estilo e qualidade.',
    cta:      'Explorar Coleção',
    href:     '/produtos',
    promo:    true,
    align:    'left',
  },
  {
    id:       'lancamentos',
    image:    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=75',
    tag:      'Novidades da Semana',
    title:    'Novas',
    titleItalic: 'Chegadas',
    subtitle: 'Peças novas toda semana. Seja a primeira a usar as tendências da estação.',
    cta:      'Ver Lançamentos',
    href:     '/produtos?filter=new_arrivals',
    promo:    true,
    align:    'right',
  },
]

const PROMO = {
  tag:   'LANÇAMENTO',
  title: 'Ganhe uma bolsa exclusiva',
  desc:  'nas 3 primeiras compras acima de R$ 299,90',
}

export default function CollectionSlideshow() {
  const [index, setIndex]           = useState(0)
  const [dir, setDir]               = useState(1)
  const [paused, setPaused]         = useState(false)
  const [showMobilePromo, setShow] = useState(false)

  const goTo = useCallback((next: number, d: number) => {
    setDir(d)
    setIndex(next)
    setShow(false) // Fecha a mensagem ao mudar de slide
  }, [])

  const next = useCallback(() => goTo((index + 1) % SLIDES.length, 1),  [index, goTo])
  const prev = useCallback(() => goTo((index - 1 + SLIDES.length) % SLIDES.length, -1), [index, goTo])

  useEffect(() => {
    if (paused) return
    const t = setTimeout(next, 12000)
    return () => clearTimeout(t)
  }, [index, paused, next])

  const slide = SLIDES[index]
  const isRight = slide.align === 'right'

  return (
    <div
      className="relative w-full overflow-hidden bg-wine-950"
      style={{ height: 'clamp(420px, 47.5vw, 750px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Slideshow principal"
    >
      {/* ── Slides ── */}
      <AnimatePresence initial={false} custom={dir} mode="sync">
        <motion.div
          key={slide.id}
          custom={dir}
          initial={{ x: dir > 0 ? '100%' : '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }}
          exit={{    x: dir > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } }}
          className="absolute inset-0"
        >
          {/* Background photo */}
          <Image
            src={slide.image}
            alt={slide.title + ' ' + slide.titleItalic}
            fill
            unoptimized={slide.id === 'hero'}
            priority={slide.id === 'hero'}
            sizes="100vw"
            className="object-cover object-center"
          />

          {/* Gradient overlays */}
          {slide.id === 'hero' ? (
            <div className="absolute inset-0 bg-gradient-to-r from-wine-950/80 via-wine-950/40 to-transparent" />
          ) : !slide.noOverlay && (
            <>
              <div className={`absolute inset-0 ${isRight
                ? 'bg-gradient-to-l from-wine-950/90 via-wine-950/50 to-transparent'
                : 'bg-gradient-to-r from-wine-950/90 via-wine-950/50 to-transparent'
              }`} />
              <div className="absolute inset-0 bg-gradient-to-t from-wine-950/50 via-transparent to-transparent" />
            </>
          )}

          {/* ── Text content ── */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-[1400px] mx-auto px-8 md:px-16">
              <div className={`max-w-lg ${isRight ? 'ml-auto text-right' : ''}`}>

                {/* Tag */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.55 } }}
                  className={`flex items-center gap-2 mb-5 ${isRight ? 'justify-end' : ''}`}
                >
                  <span className={`w-6 h-px bg-gold-400 ${isRight ? 'order-last' : ''}`} />
                  <span className="font-sans text-[10px] md:text-xs text-gold-400 tracking-[0.35em] uppercase">
                    {slide.tag}
                  </span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.6 } }}
                  className={`font-serif font-light leading-[1.05] mb-5 ${slide.id === 'hero' ? 'text-white' : (slide.noOverlay ? 'text-wine-900' : 'text-cream-100')}`}
                  style={{ fontSize: 'clamp(2.5rem, 6vw, 6.5rem)' }}
                >
                  <span className="block">{slide.title}</span>
                  <span className="block italic">{slide.titleItalic}</span>
                </motion.h1>

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.32, duration: 0.55 } }}
                  className={`font-sans text-sm md:text-[15px] leading-relaxed mb-9 max-w-sm ${slide.id === 'hero' ? 'text-white/80' : (slide.noOverlay ? 'text-wine-900/70' : 'text-cream-100/60')}`}
                  style={{ marginLeft: isRight ? 'auto' : undefined }}
                >
                  {slide.subtitle}
                </motion.p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.44, duration: 0.5 } }}
                  className={`flex flex-col gap-4 ${isRight ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-4">
                    <Link
                      href={slide.href}
                      className={`inline-flex items-center gap-3 px-8 py-4 font-sans text-[11px] font-bold tracking-[0.25em] uppercase transition-colors duration-300 group ${
                        slide.id === 'hero' ? 'bg-white text-wine-950 hover:bg-cream-100' : (slide.noOverlay ? 'bg-wine-900 text-cream-100 hover:bg-wine-800' : 'bg-cream-100 text-wine-900 hover:bg-white')
                      }`}
                    >
                      {slide.cta}
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    <Link
                      href="/produtos"
                      className={`font-sans text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 hidden md:inline ${
                        slide.noOverlay ? 'text-wine-900/50 hover:text-wine-900' : 'text-cream-100/50 hover:text-cream-100'
                      }`}
                    >
                      Ver tudo
                    </Link>
                  </div>
                  
                  {slide.disclaimer && (
                    <p className={`font-sans text-[9px] italic max-w-[280px] ${slide.id === 'hero' ? 'text-white/70' : (slide.noOverlay ? 'text-wine-900/40' : 'text-cream-100/30')}`}>
                      {slide.disclaimer}
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* ── Promo badge ── */}
          {slide.promo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: 0.55, duration: 0.5, ease: 'easeOut' } }}
              className="absolute top-4 right-4 md:top-10 md:right-14 z-30 flex flex-col items-end gap-2"
            >
              {/* Mobile Version: ONLY the circle button */}
              <div className="md:hidden flex flex-col items-end gap-2">
                <AnimatePresence>
                  {showMobilePromo && (
                    <motion.div
                      initial={{ opacity: 0, x: 20, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.8 }}
                      className="bg-wine-900 border border-gold-400/30 p-4 shadow-2xl max-w-[200px] relative"
                    >
                      <p className="font-sans text-[10px] font-bold tracking-widest text-gold-400 mb-1 uppercase">
                        {PROMO.tag}
                      </p>
                      <p className="font-serif text-white text-sm font-medium leading-tight mb-1">
                        {PROMO.title}
                      </p>
                      <p className="font-sans text-[9px] text-white/70 leading-relaxed">
                        {PROMO.desc}
                      </p>
                      {/* Arrow tail */}
                      <div className="absolute -bottom-1 right-5 w-2 h-2 bg-wine-900 border-r border-b border-gold-400/30 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShow(!showMobilePromo);
                  }}
                  className="w-12 h-12 bg-wine-900 flex items-center justify-center rounded-full shadow-2xl border border-gold-400/30 active:scale-90 transition-transform outline-none"
                >
                  <Gift size={22} className="text-gold-400" />
                </button>
              </div>

              {/* Desktop Version: Styled Box */}
              <div className="hidden md:block bg-cream-100 shadow-2xl relative overflow-hidden group p-6 max-w-[260px]">
                {/* Gold top strip */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-500" />
                
                {/* Gift icon + tag */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-wine-900 flex items-center justify-center shrink-0">
                    <Gift size={16} className="text-gold-400" />
                  </div>
                  <span className="font-sans text-[11px] md:text-xs font-bold tracking-[0.3em] uppercase text-wine-900">
                    {PROMO.tag}
                  </span>
                </div>

                {/* Title */}
                <p className="font-serif text-wine-900 text-xl font-semibold leading-tight mb-3">
                  {PROMO.title}
                </p>

                {/* Desc */}
                <p className="font-sans text-[11px] text-gray-500 leading-relaxed">
                  {PROMO.desc}
                </p>

                {/* Corner diamond */}
                <div className="absolute bottom-3 right-3">
                  <svg width="10" height="10" viewBox="0 0 8 8">
                    <polygon points="4,0 8,4 4,8 0,4" fill="#d4af37" fillOpacity="0.6"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Prev / Next ── */}
      <button
        onClick={prev}
        aria-label="Anterior"
        className="absolute left-4 md:left-7 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center border border-white/20 text-white/60 hover:border-white hover:text-white transition-all duration-300 bg-black/20 backdrop-blur-sm"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Próximo"
        className="absolute right-4 md:right-7 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center border border-white/20 text-white/60 hover:border-white hover:text-white transition-all duration-300 bg-black/20 backdrop-blur-sm"
      >
        <ChevronRight size={18} />
      </button>

      {/* ── Dots / progress ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i, i > index ? 1 : -1)}
            aria-label={`Slide ${i + 1}`}
            className="relative overflow-hidden h-[3px] bg-white/25 transition-all duration-500"
            style={{ width: i === index ? 40 : 18 }}
          >
            {i === index && (
              <motion.span
                className="absolute inset-0 bg-gold-400 origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 6, ease: 'linear' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute bottom-[26px] right-8 md:right-14 z-20 font-sans text-[10px] text-white/35 tracking-[0.25em]">
        {String(index + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>
    </div>
  )
}
