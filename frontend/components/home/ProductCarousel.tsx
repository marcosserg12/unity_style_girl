'use client'

import { useRef, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import SafeImage from '@/components/ui/SafeImage'
import { Heart, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFavoritesStore } from '@/store/favoritesStore'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'
import clsx from 'clsx'

const FALLBACK = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'

/* ─── Single card ──────────────────────────────────────────────────────────── */
function CarouselCard({ product }: { product: Product }) {
  const variants  = product.active_variants ?? []
  const allImages = product.images ?? (product.primary_image ? [product.primary_image] : [])

  const uniqueColors = useMemo(() => {
    const seen = new Set<string>()
    return variants
      .filter(v => v.color && v.color !== 'Default' && v.color !== 'Único')
      .filter(v => { if (seen.has(v.color!)) return false; seen.add(v.color!); return true })
      .map(v => v.color!)
  }, [variants])

  const colorCovers = useMemo(() =>
    uniqueColors.map(color => {
      const colorSoldOut = variants
        .filter(v => v.color === color)
        .every(v => v.stock_quantity === 0)
      return {
        color,
        img: allImages.find(img => img.color === color) ?? null,
        soldOut: colorSoldOut,
      }
    }).sort((a, b) => Number(a.soldOut) - Number(b.soldOut))
  , [uniqueColors, allImages, variants])

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colorCovers.find(c => !c.soldOut)?.color ?? colorCovers[0]?.color ?? null
  )
  const [hovered, setHovered] = useState(false)

  const isOutOfStock = product.total_stock === 0
  const isColorOutOfStock = selectedColor
    ? variants.filter(v => v.color === selectedColor).every(v => v.stock_quantity === 0)
    : isOutOfStock
  const soldOut = isOutOfStock || isColorOutOfStock

  const toggle     = useFavoritesStore(s => s.toggle)
  const isFavorite = useFavoritesStore(s => s.isFavorite(product.id, selectedColor))

  const colorImages = useMemo(() => {
    if (!selectedColor) return allImages
    const filtered = allImages.filter(img => img.color === selectedColor)
    return filtered.length > 0 ? filtered : allImages
  }, [allImages, selectedColor])

  const displayUrl = hovered && colorImages.length > 1
    ? colorImages[1].url
    : (colorImages[0]?.url ?? FALLBACK)

  const currentPrice = product.sale_price ?? product.price

  const productUrl = selectedColor
    ? `/produtos/${product.slug}?color=${encodeURIComponent(selectedColor)}`
    : `/produtos/${product.slug}`

  return (
    <div className="shrink-0 w-[200px] sm:w-[240px] md:w-[260px] lg:w-[280px] flex flex-col group">

      {/* Imagem */}
      <Link href={productUrl} className="block">
        <div
          className="relative aspect-[3/4] overflow-hidden bg-gray-50 rounded-xl"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <SafeImage
            src={displayUrl}
            alt={product.name}
            fill
            sizes="280px"
            className={clsx('object-cover object-center transition-all duration-700', soldOut && 'grayscale opacity-60')}
          />
          {soldOut && (
            <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center">
              <span className="bg-gray-700/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                Esgotado
              </span>
            </div>
          )}
          {!soldOut && product.is_on_sale && product.discount_percentage && (
            <div className="absolute top-3 left-3 bg-wine-900 text-cream-100 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full">
              -{product.discount_percentage}%
            </div>
          )}
          {!soldOut && product.is_new_arrival && !product.is_on_sale && (
            <div className="absolute top-3 left-3 bg-white text-wine-900 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-wine-900/10">
              Novo
            </div>
          )}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(product, selectedColor) }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-wine-900 transition-all duration-300 rounded-full shadow"
            aria-label="Favoritar"
          >
            <Heart size={15} className={isFavorite ? 'fill-wine-900 text-wine-900' : 'text-gray-400'} />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="pt-3 pb-1 flex-1 flex flex-col">
        <h3 className="font-sans text-gray-900 text-[15px] font-semibold leading-snug mb-1.5 line-clamp-2 group-hover:text-wine-900 transition-colors duration-200">
          <Link href={productUrl}>{product.name}</Link>
        </h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-sans text-wine-900 font-bold text-base">{formatPrice(currentPrice)}</span>
          {product.is_on_sale && (
            <span className="font-sans text-gray-300 line-through text-xs">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Miniaturas por cor */}
        {colorCovers.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {colorCovers.map(({ color, img, soldOut: colorSoldOut }) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                title={colorSoldOut ? `${color} — Esgotado` : color}
                className={clsx(
                  'relative shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200',
                  'w-11 h-[52px]',
                  selectedColor === color
                    ? 'border-wine-900 opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300'
                )}
              >
                {img ? (
                  <SafeImage src={img.url} alt={color} fill className={clsx('object-cover object-center', colorSoldOut && 'grayscale opacity-50')} sizes="44px" />
                ) : (
                  <div className={clsx('w-full h-full bg-gray-100', colorSoldOut && 'opacity-40')} />
                )}
                {colorSoldOut && <div className="absolute inset-0 bg-gray-200/60" />}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto" />
      </div>

      {/* Comprar */}
      {soldOut ? (
        <div className="mt-1 w-full bg-gray-200 text-gray-400 font-sans text-[10px] font-bold tracking-[0.3em] uppercase py-3 flex items-center justify-center gap-2 cursor-not-allowed select-none">
          Esgotado
        </div>
      ) : (
        <Link
          href={productUrl}
          className="mt-1 w-full bg-wine-900 hover:bg-wine-800 text-cream-100 font-sans text-[10px] font-bold tracking-[0.3em] uppercase py-3 flex items-center justify-center gap-2 transition-colors duration-300"
        >
          <ShoppingBag size={13} strokeWidth={2} /> Comprar
        </Link>
      )}
    </div>
  )
}

/* ─── Carousel wrapper ─────────────────────────────────────────────────────── */
interface Props {
  products:    Product[]
  scriptLabel: string
  title:       string
  href:        string
  hrefLabel?:  string
  bg?:         string
}

export default function ProductCarousel({ products, scriptLabel, title, href, hrefLabel = 'Ver todos', bg = 'bg-white' }: Props) {
  const scrollRef  = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd,   setAtEnd]   = useState(false)

  const STEP = 300

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -STEP : STEP, behavior: 'smooth' })
  }, [])

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 8)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8)
  }

  if (products.length === 0) return null

  return (
    <section className={`pt-5 pb-8 md:pt-6 md:pb-12 ${bg} relative`}>
      <div className="max-w-[1500px] mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4 px-6"
        >
          <p className="font-script text-wine-900 text-xl mb-0">{scriptLabel}</p>
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 font-light text-center">{title}</h2>
          <div className="flex items-center gap-3 justify-center mt-2">
            <span className="flex-1 max-w-10 h-px bg-wine-900 opacity-30" />
            <span className="font-sans text-[9px] text-gray-400 tracking-[0.28em] uppercase">Unity Girl Style</span>
            <span className="flex-1 max-w-10 h-px bg-wine-900 opacity-30" />
          </div>
        </motion.div>

        {/* Carousel + Arrows */}
        <div className="relative">
          <button
            onClick={() => scroll('left')}
            disabled={atStart}
            aria-label="Anterior"
            className="hidden md:flex absolute left-2 top-[38%] -translate-y-1/2 z-10 w-11 h-11 bg-white border border-gray-200 items-center justify-center shadow-md hover:border-wine-900 hover:text-wine-900 transition-all duration-300 disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={atEnd}
            aria-label="Próximo"
            className="hidden md:flex absolute right-2 top-[38%] -translate-y-1/2 z-10 w-11 h-11 bg-white border border-gray-200 items-center justify-center shadow-md hover:border-wine-900 hover:text-wine-900 transition-all duration-300 disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar px-6 md:px-16 pb-2 items-start"
          >
            {products.map(product => (
              <CarouselCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* CTA link */}
        <div className="text-center mt-10 px-6">
          <Link
            href={href}
            className="btn-outline inline-flex items-center gap-2 group"
          >
            {hrefLabel}
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  )
}
