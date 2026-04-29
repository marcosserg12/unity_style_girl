'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Search, User, Menu, X, Sparkles, Settings, ChevronDown, Heart } from 'lucide-react'
import { useCartStore }      from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import CartDrawer            from '@/components/cart/CartDrawer'
import SearchOverlay         from '@/components/layout/SearchOverlay'
import { api } from '@/lib/api'
import clsx from 'clsx'

const MEGA_CATS = [
  { label: 'Blusas',    href: '/produtos?category=blusas'    },
  { label: 'Body',      href: '/produtos?category=body'      },
  { label: 'Calças',    href: '/produtos?category=calcas'    },
  { label: 'Conjuntos', href: '/produtos?category=conjuntos' },
]

const NAV_LINKS = [
  { label: 'CATÁLOGO',                href: '/produtos'                     },
  { label: 'NOVIDADES',               href: '/produtos?filter=new_arrivals' },
  { label: 'PROMOÇÃO (até 35% OFF)',  href: '/produtos?filter=sale'         },
]

const MOBILE_LINKS = [
  { label: 'Início',                  href: '/'                             },
  { label: 'Catálogo',                href: '/produtos'                     },
  { label: 'Novidades',               href: '/produtos?filter=new_arrivals' },
  { label: 'Promoção (até 35% OFF)',  href: '/produtos?filter=sale'         },
  ...MEGA_CATS,
  { label: 'Quem Somos',             href: '/sobre'                   },
  { label: 'Contato',                href: '/contato'                      },
]

const MARQUEE_ITEMS = [
  '✦ NOVA COLEÇÃO VERÃO 2025',
  '✦ FRETE PARA BRASÍLIA E DF',
  '✦ PARCELE EM ATÉ 6X SEM JUROS',
  '✦ GANHE UMA BOLSA EXCLUSIVA EM COMPRAS ACIMA DE R$299,99',
  '✦ ATENDIMENTO VIA WHATSAPP',
]

const MEGA_MENU_FALLBACK = {
  image:    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&h=500&q=85',
  caption1: 'explore',
  caption2: 'Nova Coleção 2025',
}

function MegaMenu() {
  const [open, setOpen]       = useState(false)
  const [menuCfg, setMenuCfg] = useState(MEGA_MENU_FALLBACK)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)
      .then(r => r.json())
      .then(d => {
        if (d.mega_menu_image || d.mega_menu_caption1 || d.mega_menu_caption2) {
          setMenuCfg({
            image:    d.mega_menu_image    ?? MEGA_MENU_FALLBACK.image,
            caption1: d.mega_menu_caption1 ?? MEGA_MENU_FALLBACK.caption1,
            caption2: d.mega_menu_caption2 ?? MEGA_MENU_FALLBACK.caption2,
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="relative text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-gray-700 hover:text-wine-900 transition-colors duration-300 group py-1 flex items-center gap-1 whitespace-nowrap">
        ROUPAS POR CATEGORIA
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-wine-900 group-hover:w-full transition-all duration-300 ease-out" />
      </button>

      {open && (
        <div className="absolute top-full left-0 w-[480px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 z-50 flex">
          <div className="w-52 p-6 border-r border-gray-100 shrink-0">
            <p className="font-sans text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4">Categorias</p>
            {MEGA_CATS.map(cat => (
              <Link
                key={cat.href}
                href={cat.href}
                className="flex items-center gap-2 py-2 font-sans text-sm text-gray-700 hover:text-wine-900 hover:pl-1 transition-all duration-200 group/item border-b border-gray-50 last:border-0"
              >
                <span className="w-1 h-1 rounded-full bg-wine-900/0 group-hover/item:bg-wine-900 transition-colors duration-200 shrink-0" />
                {cat.label}
              </Link>
            ))}
          </div>
          <div className="flex-1 relative min-h-[300px]">
            <Image
              src={menuCfg.image}
              alt="Moda feminina"
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine-950/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="font-script text-white text-xl leading-none">{menuCfg.caption1}</p>
              <p className="font-serif text-white text-sm font-light tracking-wider">{menuCfg.caption2}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [cartOpen,    setCartOpen]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [userRole,    setUserRole]    = useState<string | null>(null)
  const [catsOpen,    setCatsOpen]    = useState(false)
  const [mounted,     setMounted]     = useState(false)
  const itemCount   = useCartStore(s => s.itemCount)
  const favCount    = useFavoritesStore(s => s.count)

  const isLoggedIn = userRole !== null
  const isAdmin    = userRole === 'admin'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })

    const checkAuth = async () => {
      const token = localStorage.getItem('ug_token')
      if (!token) { setUserRole(null); return }

      const cached = localStorage.getItem('ug_user')
      if (cached) {
        try {
          const u = JSON.parse(cached)
          setUserRole(u.role ?? 'customer')
          return
        } catch {}
      }

      try {
        const { data: u } = await api.get('/auth/me')
        localStorage.setItem('ug_user', JSON.stringify(u))
        setUserRole(u.role ?? 'customer')
      } catch {
        setUserRole(null)
      }
    }

    setMounted(true)
    checkAuth()
    window.addEventListener('storage', checkAuth)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  return (
    <>
      {/* ─── Marquee Strip ──────────────────────────────────────────────── */}
      <div className="bg-wine-950 text-cream-100 py-2 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {/* Duplicate para loop infinito */}
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 mx-8 font-sans text-[10px] md:text-[11px] tracking-[0.22em] uppercase font-semibold text-cream-100/90"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Header principal ───────────────────────────────────────────── */}
      <header className={clsx(
        'sticky top-0 z-50 transition-all duration-500 bg-white',
        scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)] py-0' : 'py-0'
      )}>
        {/* Top utility bar */}
        <div className={clsx(
          'border-b border-gray-100 transition-all duration-500 overflow-hidden',
          scrolled ? 'max-h-0 opacity-0' : 'max-h-16 opacity-100'
        )}>
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-sans text-gray-400 uppercase tracking-widest">
              <Sparkles size={12} className="text-gold-400" />
              <span>Sua loja de moda favorita</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[10px] font-sans text-gray-400 uppercase tracking-widest">
              <a
                href="https://wa.me/5561982395045"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-green-600 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                (61) 98239-5045
              </a>
              <span className="w-px h-3 bg-gray-200" />
              {isAdmin && (
                <>
                  <Link href="/admin" className="text-gold-500 font-bold hover:text-wine-900 transition-colors flex items-center gap-1">
                    <Settings size={12} /> Painel Admin
                  </Link>
                  <span className="w-px h-3 bg-gray-200" />
                </>
              )}
              <Link href="/conta" className="hover:text-wine-900 transition-colors">Minha Conta</Link>
              <span className="w-px h-3 bg-gray-200" />
              <Link href="/produtos?filter=sale" className="text-wine-900 font-semibold hover:underline">Promoções</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-3 items-center h-20">

            {/* Left: hamburger mobile */}
            <div className="flex justify-start">
              <button
                className="md:hidden p-2 text-gray-700 hover:text-wine-900 transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Center: Logo */}
            <div className="flex justify-center">
              <Link href="/" className="flex items-center gap-1.5 group">
                <span className="font-serif text-[2.15rem] md:text-[2.6rem] text-wine-900 tracking-tight font-semibold leading-none">
                  UNITY
                </span>
                <span className="font-script text-wine-900 text-[2.15rem] md:text-[3rem] leading-none mt-1">
                  girl
                </span>
                <span className="font-serif text-[2.15rem] md:text-[2.6rem] text-wine-900 tracking-tight font-semibold leading-none">
                  STYLE
                </span>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 md:gap-2 justify-end">
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex p-2 text-gray-700 hover:text-wine-900 transition-colors"
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>
              <Link
                href="/favoritos"
                className="relative p-2 text-gray-700 hover:text-wine-900 transition-colors"
                aria-label="Favoritos"
              >
                <Heart size={20} />
                {mounted && favCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-wine-900 text-cream-100 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </Link>
              <Link
                href="/conta"
                className="hidden md:flex p-2 text-gray-700 hover:text-wine-900 transition-colors"
                aria-label="Minha conta"
              >
                <User size={20} />
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1.5 p-2 text-gray-700 hover:text-wine-900 transition-colors"
                aria-label="Carrinho"
              >
                <ShoppingBag size={20} />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-wine-900 text-cream-100 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse-wine">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center justify-center gap-8 lg:gap-10 border-t border-gray-100 h-12 relative">

            <Link
              href="/"
              className="relative text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-gray-700 hover:text-wine-900 transition-colors duration-300 group py-1 whitespace-nowrap"
            >
              INÍCIO
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-wine-900 group-hover:w-full transition-all duration-300 ease-out" />
            </Link>

            {/* Roupas por Categoria — mega menu */}
            <MegaMenu />

            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'relative text-[11px] font-sans font-bold tracking-[0.2em] uppercase transition-colors duration-300 group py-1 whitespace-nowrap',
                  link.href.includes('sale') ? 'text-wine-900' : 'text-gray-700 hover:text-wine-900'
                )}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-wine-900 group-hover:w-full transition-all duration-300 ease-out" />
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ─── Mobile drawer ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-white h-full flex flex-col shadow-modal">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <span className="font-script text-wine-900 text-2xl">Unity Girl Style</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-500 hover:text-wine-900">
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              {/* Buscar */}
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true) }}
                className="flex items-center gap-3 w-full px-6 py-3.5 font-sans text-sm font-semibold tracking-wider text-gray-700 hover:text-wine-900 hover:bg-cream-100 uppercase transition-colors border-b border-gray-50"
              >
                <Search size={16} />
                Buscar
              </button>

              {/* Main links */}
              {[
                { label: 'Início',   href: '/' },
                { label: 'Catálogo', href: '/produtos' },
                { label: 'Novidades', href: '/produtos?filter=new_arrivals' },
                { label: 'Promoção (até 35% OFF)', href: '/produtos?filter=sale' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-6 py-3.5 font-sans text-sm font-semibold tracking-wider text-gray-700 hover:text-wine-900 hover:bg-cream-100 uppercase transition-colors border-b border-gray-50"
                >
                  {link.label}
                </Link>
              ))}

              {/* Roupas por Categoria accordion */}
              <div className="border-b border-gray-50">
                <button
                  onClick={() => setCatsOpen(p => !p)}
                  className="flex items-center justify-between w-full px-6 py-3.5 font-sans text-sm font-semibold tracking-wider text-gray-700 hover:text-wine-900 hover:bg-cream-100 uppercase transition-colors"
                >
                  Roupas por Categoria
                  <ChevronDown size={16} className={`transition-transform duration-200 ${catsOpen ? 'rotate-180' : ''}`} />
                </button>
                {catsOpen && (
                  <div className="bg-cream-100/60 border-t border-gray-100">
                    {MEGA_CATS.map(cat => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 pl-10 pr-6 py-3 font-sans text-sm text-gray-600 hover:text-wine-900 hover:bg-cream-200/60 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <span className="w-1 h-1 rounded-full bg-wine-900/40 shrink-0" />
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Secondary links */}
              {[
                { label: 'Quem Somos', href: '/sobre' },
                { label: 'Contato',    href: '/contato'     },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-6 py-3.5 font-sans text-sm font-semibold tracking-wider text-gray-500 hover:text-wine-900 hover:bg-cream-100 uppercase transition-colors border-b border-gray-50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="p-5 border-t border-gray-100 space-y-3 shrink-0">
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="bg-gold-400 text-wine-950 font-bold py-3 rounded-lg w-full text-center flex justify-center gap-2 text-sm uppercase tracking-widest">
                  <Settings size={18} /> Painel Admin
                </Link>
              )}
              {isLoggedIn ? (
                <Link href="/conta" onClick={() => setMobileOpen(false)} className="btn-outline w-full text-center flex justify-center">
                  Minha Conta
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center flex justify-center">
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
