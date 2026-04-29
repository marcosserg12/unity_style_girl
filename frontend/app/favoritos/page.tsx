'use client'

import { useFavoritesStore } from '@/store/favoritesStore'
import { useCartStore }      from '@/store/cartStore'
import Link                  from 'next/link'
import Image                 from 'next/image'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { motion, AnimatePresence }    from 'framer-motion'
import { formatPrice }       from '@/lib/utils'
import { useState, useMemo } from 'react'
import type { Product }      from '@/lib/types'

const FALLBACK = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'

function FavoriteCard({ product, color }: { product: Product; color: string | null }) {
  const toggle   = useFavoritesStore(s => s.toggle)
  const addItem  = useCartStore(s => s.addItem)
  const [adding, setAdding] = useState(false)

  // Usa a imagem da cor favorita; cai para primary_image ou fallback
  const imageUrl = useMemo(() => {
    if (color && product.images) {
      const match = product.images.find(img => img.color === color)
      if (match) return match.url
    }
    return product.primary_image?.url ?? FALLBACK
  }, [color, product])

  const currentPrice = product.sale_price ?? product.price

  const handleBuy = async (e: React.MouseEvent) => {
    e.preventDefault()
    const firstVariant = product.active_variants?.[0]
    if (!firstVariant) return
    setAdding(true)
    await addItem(firstVariant.id, 1)
    setAdding(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={`/produtos/${product.slug}${color ? `?color=${encodeURIComponent(color)}` : ''}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          {product.is_on_sale && product.discount_percentage && (
            <div className="absolute top-3 left-3 bg-wine-900 text-cream-100 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1">
              -{product.discount_percentage}%
            </div>
          )}
          {color && (
            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full backdrop-blur-sm">
              {color}
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(product) }}
            className="absolute top-3 right-3 w-8 h-8 bg-wine-900 text-cream-100 flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Remover dos favoritos"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="pt-3 pb-1">
          <h3 className="font-sans text-gray-900 text-[15px] font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-wine-900 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-sans text-wine-900 font-bold text-base">
              {formatPrice(currentPrice)}
            </span>
            {product.is_on_sale && (
              <span className="font-sans text-gray-300 line-through text-xs">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={handleBuy}
        disabled={adding}
        className="w-full bg-wine-900 hover:bg-wine-800 text-cream-100 font-sans text-[10px] font-bold tracking-[0.3em] uppercase py-3 flex items-center justify-center gap-2 transition-colors duration-300 disabled:opacity-60"
      >
        {adding ? (
          <span className="w-4 h-4 border-2 border-cream-100/30 border-t-cream-100 rounded-full animate-spin" />
        ) : (
          <><ShoppingBag size={13} /> Comprar</>
        )}
      </button>
    </motion.div>
  )
}

export default function FavoritosPage() {
  const items = useFavoritesStore(s => s.items)

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 min-h-[60vh]">
      <div className="mb-8">
        <p className="font-script text-wine-900 text-xl">seus</p>
        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 font-light">Favoritos</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex-1 max-w-10 h-px bg-wine-900 opacity-30" />
          <span className="font-sans text-[9px] text-gray-400 tracking-[0.28em] uppercase">Unity Girl Style</span>
          <span className="flex-1 max-w-10 h-px bg-wine-900 opacity-30" />
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div className="w-16 h-16 bg-cream-200 flex items-center justify-center">
              <Heart size={28} className="text-wine-900/30" />
            </div>
            <p className="font-serif text-gray-600 text-xl font-light">Você ainda não tem favoritos</p>
            <p className="font-sans text-sm text-gray-400">Clique no coração dos produtos para salvar aqui.</p>
            <Link href="/produtos" className="btn-primary mt-2">
              Ver produtos
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence>
              {items.map(({ product, color }) => (
                <FavoriteCard key={product.id} product={product} color={color} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
