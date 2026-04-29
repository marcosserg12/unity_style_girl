import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartApi } from '@/lib/api'
import type { CartItem } from '@/lib/types'

interface CartStore {
  items:     CartItem[]
  total:     number
  itemCount: number
  isLoading: boolean

  addItem:        (variantId: number, quantity: number) => Promise<void>
  removeItem:     (itemId: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  clearCart:      () => Promise<void>
  syncWithApi:    () => Promise<void>
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:     [],
      total:     0,
      itemCount: 0,
      isLoading: false,

      addItem: async (variantId, quantity) => {
        set({ isLoading: true })
        try {
          const { data } = await cartApi.add(variantId, quantity)
          if (data.cart_token && typeof window !== 'undefined') {
            localStorage.setItem('ug_cart_token', data.cart_token)
          }
          await get().syncWithApi()
        } finally {
          set({ isLoading: false })
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true })
        try {
          await cartApi.remove(itemId)
          set(state => {
            const items     = state.items.filter(i => i.id !== itemId)
            const total     = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
            const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
            return { items, total, itemCount }
          })
        } finally {
          set({ isLoading: false })
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(itemId)
          return
        }
        set({ isLoading: true })
        try {
          await cartApi.update(itemId, quantity)
          set(state => {
            const items     = state.items.map(i => i.id === itemId ? { ...i, quantity } : i)
            const total     = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
            const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
            return { items, total, itemCount }
          })
        } finally {
          set({ isLoading: false })
        }
      },

      clearCart: async () => {
        await cartApi.clear()
        set({ items: [], total: 0, itemCount: 0 })
      },

      syncWithApi: async () => {
        try {
          const { data } = await cartApi.get()
          const cart = data
          if (cart.session_token && typeof window !== 'undefined') {
            localStorage.setItem('ug_cart_token', cart.session_token)
          }

          const items: CartItem[] = (cart.items ?? []).map((ci: any) => ({
            id:           ci.id,
            variant_id:   ci.product_variant_id,
            product_name: ci.variant?.product?.name ?? '',
            sku:          ci.variant?.sku ?? '',
            size:         ci.variant?.size ?? null,
            color:        ci.variant?.color ?? null,
            unit_price:   ci.variant?.final_price ?? 0,
            quantity:     ci.quantity,
            image_url:    ci.variant?.product?.primary_image?.url ?? null,
          }))

          const total     = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
          const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

          set({ items, total, itemCount })
        } catch {
          // Não quebra a UI se a API falhar
        }
      },
    }),
    {
      name:        'unity-girl-cart',
      partialize:  state => ({ items: state.items, total: state.total, itemCount: state.itemCount }),
      skipHydration: true, // evita mismatch de hidratação SSR no Next.js
    }
  )
)
