import type { Metadata } from 'next'
import { notFound }      from 'next/navigation'
import Link              from 'next/link'
import ProductDetail     from '@/components/products/ProductDetail'
import ProductCard       from '@/components/products/ProductCard'
import type { Product }  from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Props {
  params:       { slug: string }
  searchParams: { color?: string }
}

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      next: { revalidate: 120 },
    })
    if (!res.ok) return null
    return await res.json() as { product: Product; related: Product[] }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getProduct(params.slug)
  if (!result) return { title: 'Produto não encontrado' }
  const { product } = result
  return {
    title:       product.meta_title  ?? product.name,
    description: product.meta_description ?? product.short_description ?? `Compre ${product.name} na Unity Girl Style.`,
    openGraph: {
      title:  product.name,
      images: product.primary_image ? [{ url: product.primary_image.url }] : [],
    },
  }
}

export default async function ProductPage({ params, searchParams }: Props) {
  const result = await getProduct(params.slug)
  if (!result) notFound()

  const { product, related } = result

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <nav className="flex items-center gap-2 text-xs font-sans text-gray-400 mb-8">
        <Link href="/" className="hover:text-wine-900 transition-colors">Início</Link>
        <span>/</span>
        <Link href="/produtos" className="hover:text-wine-900 transition-colors">Produtos</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/produtos?category=${product.category.slug}`} className="hover:text-wine-900 transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-600 truncate max-w-40">{product.name}</span>
      </nav>

      <ProductDetail product={product} initialColor={searchParams.color} />

      {related.length > 0 && (
        <section className="mt-16 md:mt-20">
          <div className="text-center mb-8">
            <p className="font-script text-wine-900 text-xl mb-1">você também pode gostar</p>
            <h2 className="font-serif text-2xl text-gray-800 font-light">Produtos Relacionados</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
