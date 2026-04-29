import type { Metadata } from 'next'
import HeroBanner         from '@/components/home/HeroBanner'
import TrustBar           from '@/components/home/TrustBar'
import ProductsSection    from '@/components/home/ProductsSection'
import Newsletter         from '@/components/home/Newsletter'
import type { Banner }    from '@/lib/types'

export const metadata: Metadata = {
  title: 'Unity Girl Style — Elegância em cada detalhe',
  description: 'Moda feminina com estilo e personalidade. Novas coleções toda semana. Frete grátis acima de R$ 199.',
}

async function fetchBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banners`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function HomePage() {
  const banners = await fetchBanners()

  return (
    <>
      {/* Hero slideshow — alimentado pelo banco de dados */}
      <HeroBanner banners={banners.length > 0 ? banners : undefined} />

      {/* Frete · Troca · Segurança · Atendimento */}
      <TrustBar />

      {/* Peças em Destaque */}
      <ProductsSection
        scriptLabel="selecionados"
        title="Peças em Destaque"
        apiParams="featured=1"
        href="/produtos?filter=featured"
        hrefLabel="Ver todas as peças"
        bg="bg-cream-200"
      />

      {/* Mais Vendidos */}
      <ProductsSection
        scriptLabel="favoritas"
        title="Mais Vendidos"
        apiParams="new_arrivals=1"
        href="/produtos"
        hrefLabel="Ver mais vendidos"
        bg="bg-white"
      />

      {/* Promoção */}
      <ProductsSection
        scriptLabel="aproveite"
        title="Promoção"
        apiParams="on_sale=1"
        href="/produtos?filter=sale"
        hrefLabel="Ver todas as promoções"
        bg="bg-cream-100"
      />

      {/* Newsletter */}
      <Newsletter />
    </>
  )
}
