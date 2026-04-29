import type { Metadata } from 'next'
import ProductCatalog from '@/components/products/ProductCatalog'
import type { PaginatedResponse, Product } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Catálogo de Produtos',
  description: 'Explore nossa coleção completa de moda feminina. Blusas, bodies, calças, conjuntos e muito mais.',
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface SearchParams {
  category?:     string
  size?:         string
  min_price?:    string
  max_price?:    string
  search?:       string
  sort?:         string
  page?:         string
  filter?:       string
}

async function getProducts(params: SearchParams): Promise<PaginatedResponse<Product>> {
  try {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v) query.set(k, v) })
    if (params.filter === 'sale')         query.set('on_sale', '1')
    if (params.filter === 'new_arrivals') query.set('new_arrivals', '1')
    if (params.filter === 'featured')     query.set('featured', '1')

    const res = await fetch(`${API_URL}/products?${query.toString()}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0, from: 0, to: 0 }
  }
}

interface Props {
  searchParams: SearchParams
}

export default async function ProductsPage({ searchParams }: Props) {
  const result = await getProducts(searchParams)
  const { data: products, total, current_page, last_page } = result

  const pageTitle = searchParams.search
    ? `Busca: "${searchParams.search}"`
    : searchParams.filter === 'new_arrivals' ? 'Novidades'
    : searchParams.filter === 'sale'         ? 'Promoções'
    : searchParams.filter === 'featured'     ? 'Destaques'
    : searchParams.category === 'blusas'     ? 'Blusas'
    : searchParams.category === 'body'       ? 'Body'
    : searchParams.category === 'calcas'     ? 'Calças'
    : searchParams.category === 'conjuntos'  ? 'Conjuntos'
    : 'Catálogo'

  return (
    <ProductCatalog
      products={products}
      total={total}
      currentPage={current_page}
      lastPage={last_page}
      searchParams={searchParams as Record<string, string | undefined>}
      pageTitle={pageTitle}
    />
  )
}
