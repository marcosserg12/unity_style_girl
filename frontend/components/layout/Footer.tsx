'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Instagram, Mail } from 'lucide-react'

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

const LINKS_LOJA = [
  { label: 'Novidades',     href: '/produtos?filter=new_arrivals' },
  { label: 'Promoções',     href: '/produtos?filter=sale' },
  { label: 'Vestidos',      href: '/produtos?category=vestidos' },
  { label: 'Blusas',        href: '/produtos?category=blusas' },
  { label: 'Conjuntos',     href: '/produtos?category=conjuntos' },
]

const LINKS_AJUDA = [
  { label: 'Política de Troca',    href: '/politica-de-troca' },
  { label: 'Entrega e Frete',      href: '/entrega' },
  { label: 'Perguntas Frequentes', href: '/faq' },
  { label: 'Sobre Nós',            href: '/sobre' },
  { label: 'Contato',              href: '/contato' },
]

export default function Footer() {
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="bg-wine-950 text-cream-100">

      {/* ─── Corpo do Footer ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">

          {/* Coluna 1: Marca */}
          <div className="lg:col-span-1 flex flex-col items-center md:items-start">
            <div className="mb-4">
              <span className="font-serif text-cream-100 text-2xl font-semibold tracking-wider uppercase block">Unity</span>
              <span className="font-script text-cream-100 text-3xl -mt-1 block">girl</span>
              <span className="font-serif text-cream-100 text-lg font-light tracking-[0.2em] uppercase -mt-1 block">Style</span>
            </div>
            <p className="text-cream-100/60 text-sm font-sans leading-relaxed mb-5 max-w-xs">
              Nascemos do desejo de criar algo único. Acreditamos que a forma de se vestir é uma extensão da sua identidade.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.instagram.com/useunitygirl_/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-cream-100/60 hover:text-cream-100 transition-colors group"
              >
                <span className="p-1.5 border border-cream-100/20 group-hover:border-cream-100/60 transition-colors">
                  <Instagram size={15} />
                </span>
                <span className="font-sans text-sm">@useunitygirl_</span>
              </a>
              <a
                href="mailto:unitygirlstyle@gmail.com"
                className="flex items-center gap-2.5 text-cream-100/60 hover:text-cream-100 transition-colors group"
              >
                <span className="p-1.5 border border-cream-100/20 group-hover:border-cream-100/60 transition-colors">
                  <Mail size={15} />
                </span>
                <span className="font-sans text-sm">unitygirlstyle@gmail.com</span>
              </a>
              <a
                href="https://wa.me/5561982395045"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-cream-100/60 hover:text-green-400 transition-colors group"
              >
                <span className="p-1.5 border border-cream-100/20 group-hover:border-green-400/60 transition-colors">
                  <WhatsAppIcon size={15} />
                </span>
                <span className="font-sans text-sm">(61) 98239-5045</span>
              </a>
            </div>
          </div>

          {/* Coluna 2: Links da Loja */}
          <div>
            <h4 className="font-serif text-cream-100 text-lg font-medium mb-4">Loja</h4>
            <ul className="space-y-2.5">
              {LINKS_LOJA.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream-100/60 hover:text-cream-100 text-sm font-sans transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Ajuda */}
          <div>
            <h4 className="font-serif text-cream-100 text-lg font-medium mb-4">Ajuda</h4>
            <ul className="space-y-2.5">
              {LINKS_AJUDA.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream-100/60 hover:text-cream-100 text-sm font-sans transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ─── Rodapé ──────────────────────────────────────────────────────────── */}
      <div className="border-t border-cream-100/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-cream-100/40 text-[10px] md:text-xs font-sans text-center md:text-left">
            © {year} Unity Girl Style — Elegância em cada detalhe. Todos os direitos reservados.
          </p>
          <div className="flex items-center justify-center flex-wrap gap-3 md:gap-4 text-cream-100/40">
            <span className="text-[10px] md:text-xs font-sans w-full md:w-auto text-center md:text-left mb-1 md:mb-0">Formas de pagamento:</span>
            {['PIX', 'Cartão de credito'].map(p => (
              <span key={p} className="text-[10px] md:text-xs font-sans border border-cream-100/20 px-2 py-0.5">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
