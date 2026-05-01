'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useEffect, useState } from 'react'
import { X, SlidersHorizontal, Search } from 'lucide-react'
import clsx from 'clsx'

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'Único']

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Mais Recentes' },
  { value: 'price_asc',  label: 'Menor Preço'   },
  { value: 'price_desc', label: 'Maior Preço'   },
  { value: 'name_asc',   label: 'Nome A–Z'      },
]

const PRICE_RANGES = [
  { label: 'Até R$ 100',       min: 0,   max: 100  },
  { label: 'R$ 100 – R$ 200',  min: 100, max: 200  },
  { label: 'R$ 200 – R$ 400',  min: 200, max: 400  },
  { label: 'Acima de R$ 400',  min: 400, max: 9999 },
]

interface Props {
  onClose?:  () => void
  isMobile?: boolean
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1 h-4 bg-wine-900 shrink-0" />
        <p className="font-sans text-[10px] font-bold tracking-[0.25em] uppercase text-gray-700">{title}</p>
      </div>
      {children}
    </div>
  )
}

export default function ProductFilters({ onClose, isMobile }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const params      = useSearchParams()
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  const [categories, setCategories] = useState<{ label: string; value: string }[]>([])
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then(r => r.json())
      .then((data: { name: string; slug: string; is_active: boolean; parent_id: number | null }[]) => {
        setCategories(
          data
            .filter(c => c.is_active && c.parent_id === null)
            .map(c => ({ label: c.name, value: c.slug }))
        )
      })
      .catch(() => {})
  }, [])

  const updateParam = useCallback((key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }, [params, pathname, router])

  const clearAll = () => { router.push(pathname); onClose?.() }

  const handleSearch = (q: string) => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      const next = new URLSearchParams(params.toString())
      if (q.trim()) next.set('search', q.trim())
      else next.delete('search')
      next.delete('page')
      router.push(`${pathname}?${next.toString()}`)
    }, 400)
  }

  const activeCategory = params.get('category')
  const activeFilter   = params.get('filter')
  const activeSize     = params.get('size')
  const activeSort     = params.get('sort')
  const activeMin      = params.get('min_price')
  const activeMax      = params.get('max_price')
  const activeSearch   = params.get('search') ?? ''
  const hasFilters     = activeCategory || activeFilter || activeSize || activeMin || activeMax || activeSort || activeSearch

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-wine-900" />
          <span className="font-serif text-lg text-gray-800">Filtros</span>
        </div>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              onClick={clearAll}
              className="font-sans text-xs text-wine-900 hover:underline flex items-center gap-1"
            >
              <X size={11} /> Limpar
            </button>
          )}
          {isMobile && onClose && (
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-wine-900 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="flex items-center gap-2 border border-gray-200 px-3 focus-within:border-wine-900 transition-colors">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            defaultValue={activeSearch}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar produto..."
            className="flex-1 py-2.5 font-sans text-sm text-gray-700 placeholder:text-gray-300 outline-none bg-transparent"
          />
          {activeSearch && (
            <button onClick={() => { updateParam('search', null) }} className="text-gray-300 hover:text-wine-900">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Coleção */}
      <Section title="Coleção">
        <div className="space-y-1">
          {[
            { label: 'Novidades',  value: 'new_arrivals' },
            { label: 'Promoção',   value: 'sale'         },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => updateParam('filter', activeFilter === opt.value ? null : opt.value)}
              className={clsx(
                'w-full text-left text-sm font-sans px-3 py-2.5 transition-all duration-200 flex items-center justify-between',
                activeFilter === opt.value
                  ? 'bg-wine-900 text-cream-100'
                  : 'text-gray-600 hover:bg-cream-100 hover:text-wine-900'
              )}
            >
              {opt.label}
              {activeFilter === opt.value && <X size={12} />}
            </button>
          ))}
        </div>
      </Section>

      {/* Categoria */}
      <Section title="Categoria">
        <div className="space-y-1">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => updateParam('category', activeCategory === cat.value ? null : cat.value)}
              className={clsx(
                'w-full text-left text-sm font-sans px-3 py-2.5 transition-all duration-200 flex items-center justify-between',
                activeCategory === cat.value
                  ? 'bg-wine-900 text-cream-100'
                  : 'text-gray-600 hover:bg-cream-100 hover:text-wine-900'
              )}
            >
              {cat.label}
              {activeCategory === cat.value && <X size={12} />}
            </button>
          ))}
        </div>
      </Section>

      {/* Ordenar */}
      <Section title="Ordenar">
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateParam('sort', activeSort === opt.value ? null : opt.value)}
              className={clsx(
                'w-full text-left text-sm font-sans px-3 py-2.5 transition-all duration-200 flex items-center justify-between',
                activeSort === opt.value
                  ? 'bg-wine-900 text-cream-100'
                  : 'text-gray-600 hover:bg-cream-100 hover:text-wine-900'
              )}
            >
              {opt.label}
              {activeSort === opt.value && <X size={12} />}
            </button>
          ))}
        </div>
      </Section>

      {/* Preço */}
      <Section title="Faixa de Preço">
        <div className="space-y-1">
          {PRICE_RANGES.map(range => {
            const active = activeMin === String(range.min) && activeMax === String(range.max)
            return (
              <button
                key={range.label}
                onClick={() => {
                  const next = new URLSearchParams(params.toString())
                  if (active) { next.delete('min_price'); next.delete('max_price') }
                  else { next.set('min_price', String(range.min)); next.set('max_price', String(range.max)) }
                  next.delete('page')
                  router.push(`${pathname}?${next.toString()}`)
                }}
                className={clsx(
                  'w-full text-left text-sm font-sans px-3 py-2.5 transition-all duration-200 flex items-center justify-between',
                  active
                    ? 'bg-wine-900 text-cream-100'
                    : 'text-gray-600 hover:bg-cream-100 hover:text-wine-900'
                )}
              >
                {range.label}
                {active && <X size={12} />}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Tamanho */}
      <Section title="Tamanho">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => updateParam('size', activeSize === size ? null : size)}
              className={clsx(
                'min-w-[42px] h-9 px-2 text-sm font-sans font-semibold transition-all duration-200 border',
                activeSize === size
                  ? 'bg-wine-900 text-cream-100 border-wine-900'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-wine-900 hover:text-wine-900'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}
