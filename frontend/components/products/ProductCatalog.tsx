'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { SlidersHorizontal, ChevronLeft, ChevronRight, X, Package } from 'lucide-react'
import ProductCard    from '@/components/products/ProductCard'
import ProductFilters from '@/components/products/ProductFilters'
import type { Product } from '@/lib/types'

interface Props {
  products:      Product[]
  total:         number
  currentPage:   number
  lastPage:      number
  searchParams:  Record<string, string | undefined>
  pageTitle:     string
}

export default function ProductCatalog({ products, total, currentPage, lastPage, searchParams, pageTitle }: Props) {
  const [filterOpen, setFilterOpen] = useState(false)

  const activeFiltersCount = [
    searchParams.category,
    searchParams.size,
    searchParams.min_price,
    searchParams.sort,
  ].filter(Boolean).length

  return (
    <div className="flex-1 min-h-screen">

      {/* ── Hero bar ─────────────────────────────────────────────────────── */}
      <div className="bg-wine-900 text-cream-100">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10 md:py-14">
          <nav className="flex items-center gap-2 text-xs font-sans text-cream-100/50 mb-4">
            <Link href="/" className="hover:text-cream-100 transition-colors">Início</Link>
            <span>/</span>
            <span className="text-cream-100/80">{pageTitle}</span>
          </nav>
          <p className="font-script text-gold-400 text-2xl mb-1">coleção</p>
          <h1 className="font-serif text-3xl md:text-4xl font-light">{pageTitle}</h1>
          <p className="font-sans text-sm text-cream-100/50 mt-2">
            {total} {total === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8">

        {/* Mobile: botão filtro sticky */}
        <div className="md:hidden mb-5">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 w-full justify-center border border-wine-900 text-wine-900 font-sans text-sm font-bold tracking-widest uppercase py-3 hover:bg-wine-900 hover:text-cream-100 transition-all duration-300"
          >
            <SlidersHorizontal size={16} />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-wine-900 text-cream-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">

          {/* Sidebar desktop — sticky, scroll independente da página */}
          <div className="hidden md:block w-56 lg:w-64 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto bg-white border border-gray-100 p-6 shadow-sm">
              <Suspense>
                <ProductFilters />
              </Suspense>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-cream-200 flex items-center justify-center mb-4">
                  <Package size={28} className="text-wine-900/30" />
                </div>
                <p className="font-serif text-2xl text-gray-500 font-light mb-2">Nenhum produto encontrado</p>
                <p className="font-sans text-sm text-gray-400 mb-6">Tente ajustar os filtros.</p>
                <Link href="/produtos" className="btn-outline">Ver todos os produtos</Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-5">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {lastPage > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {currentPage > 1 && (
                      <Link
                        href={`?${new URLSearchParams({ ...searchParams, page: String(currentPage - 1) } as Record<string, string>)}`}
                        className="w-10 h-10 flex items-center justify-center border border-gray-200 hover:border-wine-900 hover:text-wine-900 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </Link>
                    )}
                    {Array.from({ length: lastPage }, (_, i) => i + 1)
                      .filter(p => Math.abs(p - currentPage) <= 2)
                      .map(page => (
                        <Link
                          key={page}
                          href={`?${new URLSearchParams({ ...searchParams, page: String(page) } as Record<string, string>)}`}
                          className={`w-10 h-10 flex items-center justify-center text-sm font-sans font-medium transition-all duration-200 ${
                            page === currentPage
                              ? 'bg-wine-900 text-cream-100'
                              : 'border border-gray-200 hover:border-wine-900 hover:text-wine-900'
                          }`}
                        >
                          {page}
                        </Link>
                      ))}
                    {currentPage < lastPage && (
                      <Link
                        href={`?${new URLSearchParams({ ...searchParams, page: String(currentPage + 1) } as Record<string, string>)}`}
                        className="w-10 h-10 flex items-center justify-center border border-gray-200 hover:border-wine-900 hover:text-wine-900 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
      {filterOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-0 shrink-0" />
            {/* scrollable filter content */}
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-2">
              <Suspense>
                <ProductFilters onClose={() => setFilterOpen(false)} isMobile />
              </Suspense>
            </div>
            {/* sticky bottom button */}
            <div className="px-5 pt-3 pb-6 border-t border-gray-100 shrink-0 bg-white">
              <button
                onClick={() => setFilterOpen(false)}
                className="w-full bg-wine-900 text-cream-100 font-sans font-bold text-xs tracking-widest uppercase py-4"
              >
                Ver produtos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
