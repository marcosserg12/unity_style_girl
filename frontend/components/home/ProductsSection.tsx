import ProductCarousel from '@/components/home/ProductCarousel'
import type { Product } from '@/lib/types'

interface Props {
  scriptLabel: string
  title:       string
  apiParams:   string
  href:        string
  hrefLabel?:  string
  bg?:         string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

async function getProducts(params: string): Promise<Product[]> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const res = await fetch(`${API_URL}/products?${params}&per_page=10`, {
      cache: 'no-store',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) return []
    const data = await res.json()
    return data.data ?? []
  } catch (error) {
    console.error('Fetch error in ProductsSection:', error)
    return []
  }
}

export default async function ProductsSection({
  scriptLabel,
  title,
  apiParams,
  href,
  hrefLabel = 'Ver todos',
  bg = 'bg-white',
}: Props) {
  const products = await getProducts(apiParams)

  return (
    <ProductCarousel
      products={products}
      scriptLabel={scriptLabel}
      title={title}
      href={href}
      hrefLabel={hrefLabel}
      bg={bg}
    />
  )
}
