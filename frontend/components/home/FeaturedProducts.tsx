import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import type { Product } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?featured=true&per_page=8`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.data ?? []
  } catch { return [] }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()
  if (products.length === 0) return null

  return (
    <section className="py-20 md:py-28 bg-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-gold-400" />
            <span className="font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-wine-900/60">mais vendidos</span>
          </div>
          <p className="font-script text-wine-900 text-3xl mb-1">nossas</p>
          <h2 className="section-title">Peas em Destaque</h2>
          <div className="section-divider">
            <span className="font-sans text-[10px] text-gray-400 tracking-[0.28em] uppercase">Unity Girl Style</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {products.map((product, i) => (
            <div key={product.id} className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/produtos" className="btn-outline inline-flex items-center gap-2 group">
            Ver todos os produtos
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  )
}
