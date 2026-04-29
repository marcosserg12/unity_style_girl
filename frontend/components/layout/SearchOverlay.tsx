'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Props {
  open:    boolean
  onClose: () => void
}

export default function SearchOverlay({ open, onClose }: Props) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer    = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const search = useCallback((q: string) => {
    clearTimeout(timer.current)
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    timer.current = setTimeout(async () => {
      try {
        const res  = await fetch(`${API_URL}/products?search=${encodeURIComponent(q)}&per_page=6`)
        const json = await res.json()
        setResults(json.data ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    search(e.target.value)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white shadow-2xl animate-fade-in-down">
        {/* Search input row */}
        <div className="max-w-3xl mx-auto px-5 py-5 flex items-center gap-4">
          <Search size={20} className="text-wine-900 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Buscar produtos..."
            className="flex-1 font-sans text-lg text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
          />
          {loading && <Loader2 size={18} className="animate-spin text-gray-400 shrink-0" />}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-wine-900 transition-colors shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        <div className="border-t border-gray-100" />

        {/* Results */}
        {results.length > 0 && (
          <div className="max-w-3xl mx-auto px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {results.map(product => {
              const image        = product.primary_image?.url ?? 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop'
              const currentPrice = product.sale_price ?? product.price
              return (
                <Link
                  key={product.id}
                  href={`/produtos/${product.slug}`}
                  onClick={onClose}
                  className="flex gap-3 items-center group hover:bg-cream-100 p-2 rounded-lg transition-colors"
                >
                  <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-md bg-gray-50">
                    <Image src={image} alt={product.name} fill className="object-cover object-top" sizes="56px" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-wine-900 transition-colors leading-snug">
                      {product.name}
                    </p>
                    <p className="font-sans text-sm font-bold text-wine-900 mt-1">
                      {formatPrice(currentPrice)}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {query.trim() && !loading && results.length === 0 && (
          <p className="max-w-3xl mx-auto px-5 py-6 font-sans text-sm text-gray-400 text-center">
            Nenhum produto encontrado para &ldquo;{query}&rdquo;
          </p>
        )}

        {results.length > 0 && (
          <div className="max-w-3xl mx-auto px-5 pb-4 text-center">
            <Link
              href={`/produtos?search=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="font-sans text-xs text-wine-900 hover:underline font-semibold tracking-wider uppercase"
            >
              Ver todos os resultados →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
