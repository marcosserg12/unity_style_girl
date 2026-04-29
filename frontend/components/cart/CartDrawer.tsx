'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import clsx from 'clsx'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'

interface Props {
  open:    boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const { items: storeItems, total: storeTotal, removeItem, updateQuantity, isLoading } = useCartStore()

  const items = mounted ? storeItems : []
  const total = mounted ? storeTotal : 0

  useEffect(() => { setMounted(true) }, [])

  // Bloqueia scroll do body quando drawer está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer */}
      <aside
        className={clsx(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70]',
          'flex flex-col shadow-modal',
          'transition-transform duration-350 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-wine-900" />
            <h2 className="font-serif text-xl text-gray-800">Meu Carrinho</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-wine-900 transition-colors"
            aria-label="Fechar carrinho"
          >
            <X size={20} />
          </button>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-2 border-wine-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <ShoppingBag size={48} className="text-gray-200" />
              <div>
                <p className="font-serif text-xl text-gray-600 mb-1">Seu carrinho está vazio</p>
                <p className="font-sans text-sm text-gray-400">Explore nossos produtos e adicione as suas peças favoritas.</p>
              </div>
              <button onClick={onClose} className="btn-outline mt-2">
                Continuar Comprando
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {items.map(item => (
                <li key={item.id} className="flex gap-4 px-6 py-4">
                  {/* Imagem */}
                  <div className="relative w-20 h-24 shrink-0 bg-cream-200">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={24} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm text-gray-800 font-medium line-clamp-2 mb-1">
                      {item.product_name}
                    </h4>
                    <div className="flex gap-2 text-xs font-sans text-gray-400 mb-3">
                      {item.size  && <span>Tamanho: <strong>{item.size}</strong></span>}
                      {item.color && <span>Cor: <strong>{item.color}</strong></span>}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Controle de quantidade */}
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-cream-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 font-sans text-sm font-medium text-gray-700 min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-cream-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-serif text-wine-900 font-semibold text-sm">
                          {formatPrice(item.unit_price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          aria-label="Remover item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer com total e CTA */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-sans text-gray-600">Subtotal</span>
              <span className="font-serif text-xl text-wine-900 font-semibold">{formatPrice(total)}</span>
            </div>
            <p className="text-xs font-sans text-gray-400 text-center">
              Frete calculado no checkout
            </p>
            <Link
              href="/checkout"
              onClick={onClose}
              className="btn-primary w-full py-4 text-base justify-center"
            >
              Finalizar Compra
            </Link>
            <button
              onClick={onClose}
              className="w-full text-center text-sm font-sans text-gray-500 hover:text-wine-900 transition-colors py-1"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
