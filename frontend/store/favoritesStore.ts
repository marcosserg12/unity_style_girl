import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/lib/types'

export interface FavoriteItem {
  product: Product
  color:   string | null
}

interface FavoritesStore {
  items:      FavoriteItem[]
  count:      number
  toggle:     (product: Product, color?: string | null) => void
  isFavorite: (id: number, color?: string | null) => boolean
}

const key = (id: number, color: string | null) => `${id}::${color ?? ''}`

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,

      toggle: (product, color = null) => {
        const k      = key(product.id, color)
        const exists = get().items.some(i => key(i.product.id, i.color) === k)
        const items  = exists
          ? get().items.filter(i => key(i.product.id, i.color) !== k)
          : [...get().items, { product, color }]
        set({ items, count: items.length })
      },

      isFavorite: (id, color = null) =>
        get().items.some(i => key(i.product.id, i.color) === key(id, color)),
    }),
    { name: 'unity-girl-favorites-v2', skipHydration: true }
  )
)
