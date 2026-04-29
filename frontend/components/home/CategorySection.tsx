'use client'

import Link from 'next/link'

const CATEGORIES = [
  { name: 'Blusas',    slug: 'blusas'    },
  { name: 'Body',      slug: 'body'      },
  { name: 'Conjuntos', slug: 'conjuntos' },
  { name: 'Calça',     slug: 'calcas'    },
]

export default function CategorySection() {
  return (
    <nav className="bg-white border-y border-cream-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-0 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/produtos?category=${cat.slug}`}
              className="group relative shrink-0 px-8 py-4 font-sans text-[11px] font-bold tracking-[0.28em] uppercase text-gray-500 hover:text-wine-900 transition-colors duration-200"
            >
              {cat.name}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-wine-900 group-hover:w-4/5 transition-all duration-300" />
              {i < CATEGORIES.length - 1 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-200" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
