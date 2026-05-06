'use client'

import Link from 'next/link'
import Image from 'next/image'
import SafeImage from '@/components/ui/SafeImage'
import { ShoppingBag, Heart } from 'lucide-react'
import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { useFavoritesStore } from '@/store/favoritesStore'
import { formatPrice } from '@/lib/utils'
import { colorHex } from '@/lib/colors'
import type { Product } from '@/lib/types'
import { motion } from 'framer-motion'

const FALLBACK = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'

interface Props {
  product: Product
  className?: string
}

export default function ProductCard({ product, className }: Props) {
  const variants  = product.active_variants ?? []
  const allImages = product.images ?? (product.primary_image ? [product.primary_image] : [])

  // Cores únicas (excluindo placeholders)
  const uniqueColors = useMemo(() => {
    const seen = new Set<string>()
    return variants
      .filter(v => v.color && v.color !== 'Default' && v.color !== 'Único')
      .filter(v => { if (seen.has(v.color!)) return false; seen.add(v.color!); return true })
      .map(v => v.color!)
  }, [variants])

  // Capa de cada cor: primeira imagem com aquela cor + hex para fallback + stock
  const colorCovers = useMemo(() =>
    uniqueColors.map(color => {
      const variant   = variants.find(v => v.color === color)
      const colorSoldOut = variants
        .filter(v => v.color === color)
        .every(v => v.stock_quantity === 0)
      return {
        color,
        hex: colorHex(color, variant?.color_hex),
        img: allImages.find(img => img.color === color) ?? null,
        soldOut: colorSoldOut,
      }
    }).sort((a, b) => Number(a.soldOut) - Number(b.soldOut))
  , [uniqueColors, allImages, variants])

  const firstColor = colorCovers.find(c => !c.soldOut)?.color ?? colorCovers[0]?.color ?? null
  const [selectedColor, setSelectedColor] = useState<string | null>(firstColor)
  const [hovered, setHovered] = useState(false)

  const isOutOfStock = product.total_stock === 0
  const isColorOutOfStock = selectedColor
    ? variants.filter(v => v.color === selectedColor).every(v => v.stock_quantity === 0)
    : isOutOfStock
  const soldOut = isOutOfStock || isColorOutOfStock

  const toggle     = useFavoritesStore(s => s.toggle)
  const isFavorite = useFavoritesStore(s => s.isFavorite(product.id, selectedColor))

  // Imagens da cor selecionada (ou todas se sem cor)
  const colorImages = useMemo(() => {
    if (!selectedColor) return allImages
    const filtered = allImages.filter(img => img.color === selectedColor)
    return filtered.length > 0 ? filtered : allImages
  }, [allImages, selectedColor])

  // Hover só troca imagem se existirem 2+ fotos da mesma cor — evita mostrar foto de outra cor
  const hoverImages = useMemo(() => {
    if (!selectedColor) return []
    return allImages.filter(img => img.color === selectedColor)
  }, [allImages, selectedColor])

  const displayUrl = hovered && hoverImages.length > 1
    ? hoverImages[1].url
    : (colorImages[0]?.url ?? FALLBACK)

  const currentPrice = product.sale_price ?? product.price

  const productUrl = selectedColor
    ? `/produtos/${product.slug}?color=${encodeURIComponent(selectedColor)}`
    : `/produtos/${product.slug}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={clsx('group flex flex-col', className)}
    >
      {/* ─── Imagem principal ─ */}
      <Link href={productUrl} className="block relative">
        <div
          className="relative aspect-[3/4] overflow-hidden bg-[#f8f8f8] rounded-2xl"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <SafeImage
            src={displayUrl}
            alt={product.name}
            fill
            className={clsx(
              'object-cover object-center transition-all duration-700',
              soldOut && 'grayscale opacity-60',
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Overlay esgotado */}
          {soldOut && (
            <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center">
              <span className="bg-gray-700/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                Esgotado
              </span>
            </div>
          )}

          {/* Badges */}
          {!soldOut && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_on_sale && product.discount_percentage && (
              <span className="bg-wine-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow uppercase tracking-widest">
                -{product.discount_percentage}%
              </span>
            )}
            {product.is_new_arrival && (
              <span className="bg-white text-wine-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow uppercase tracking-widest border border-wine-900/10">
                Novo
              </span>
            )}
          </div>
          )}

          {/* Favoritar */}
          <button
            onClick={e => { e.preventDefault(); toggle(product, selectedColor) }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-wine-900 transition-all duration-300 rounded-full shadow"
          >
            <Heart size={15} className={isFavorite ? 'fill-wine-900 text-wine-900' : 'text-gray-400'} />
          </button>
        </div>
      </Link>

      {/* ─── Info ─ */}
      <div className="mt-3 px-0.5 flex-1 flex flex-col">
        <span className="text-[10px] font-sans text-gray-400 uppercase tracking-[0.2em] font-bold">
          {product.category?.name || 'Unity Girl'}
        </span>

        <h3 className="font-sans text-gray-900 text-[15px] font-semibold mb-1.5 line-clamp-2 leading-snug group-hover:text-wine-900 transition-colors">
          <Link href={productUrl}>{product.name}</Link>
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="font-sans text-wine-900 font-bold text-base">{formatPrice(currentPrice)}</span>
          {product.is_on_sale && (
            <span className="font-sans text-gray-300 line-through text-sm">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Miniaturas por cor */}
        {colorCovers.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {colorCovers.map(({ color, hex, img, soldOut: colorSoldOut }) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                title={colorSoldOut ? `${color} — Esgotado` : color}
                className={clsx(
                  'relative shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200',
                  'w-12 h-14',
                  selectedColor === color
                    ? 'border-wine-900 opacity-100'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-300'
                )}
              >
                {img ? (
                  <SafeImage
                    src={img.url}
                    alt={color}
                    fill
                    className={clsx(
                      'object-cover object-center',
                      colorSoldOut && 'grayscale opacity-50',
                    )}
                    sizes="48px"
                  />
                ) : (
                  <div
                    className={clsx(
                      'w-full h-full flex items-center justify-center',
                      colorSoldOut && 'opacity-40',
                    )}
                    style={{ backgroundColor: colorSoldOut ? '#d1d5db' : hex }}
                  />
                )}
                {/* Overlay cinza para cores esgotadas */}
                {colorSoldOut && (
                  <div className="absolute inset-0 bg-gray-200/60" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto" />
      </div>

      {/* ─── Comprar / Esgotado ─ */}
      {soldOut ? (
        <div className="mt-2 w-full bg-gray-200 text-gray-400 font-sans text-[10px] font-bold tracking-[0.3em] uppercase py-3 flex items-center justify-center gap-2 cursor-not-allowed select-none">
          Esgotado
        </div>
      ) : (
        <Link
          href={productUrl}
          className="mt-2 w-full bg-wine-900 hover:bg-wine-800 text-white font-sans text-[10px] font-bold tracking-[0.3em] uppercase py-3 flex items-center justify-center gap-2 transition-colors duration-300"
        >
          <ShoppingBag size={13} strokeWidth={2} /> Comprar
        </Link>
      )}
    </motion.div>
  )
}
