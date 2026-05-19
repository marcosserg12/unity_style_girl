'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Ticket,
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const MENU_ITEMS = [
  { label: 'Dashboard',     href: '/admin',                icon: LayoutDashboard },
  { label: 'Produtos',      href: '/admin/produtos',       icon: Package         },
  { label: 'Pedidos',       href: '/admin/pedidos',        icon: ShoppingBag     },
  { label: 'Cupons',        href: '/admin/cupons',         icon: Ticket          },
  { label: 'Clientes',      href: '/admin/clientes',       icon: Users           },
  { label: 'Configurações', href: '/admin/configuracoes',  icon: Settings        },
]

interface SidebarProps {
  mobileOpen:    boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname  = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const showLabel = mobileOpen || !collapsed

  return (
    <>
      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          'bg-wine-950 text-cream-100 flex flex-col transition-all duration-300',
          // mobile: drawer fixo; desktop: parte do flex
          'fixed inset-y-0 left-0 z-50 md:relative md:z-auto md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // largura mobile sempre 72, desktop respeita collapsed
          'w-72 md:w-64',
          collapsed && 'md:w-20',
        )}
      >
        {/* Brand */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          {showLabel && (
            <div className="flex flex-col leading-none">
              <span className="font-serif text-base font-semibold tracking-wider uppercase">Unity</span>
              <span className="font-script text-2xl -mt-1">admin</span>
            </div>
          )}
          {/* Mobile: botão fechar; Desktop: colapsar */}
          <button
            onClick={mobileOpen ? onMobileClose : () => setCollapsed(p => !p)}
            className={clsx(
              'p-2 hover:bg-white/10 rounded-lg transition-colors',
              !showLabel && 'mx-auto',
            )}
          >
            {mobileOpen
              ? <X size={20} />
              : collapsed
                ? <Menu size={20} />
                : <ChevronLeft size={20} />
            }
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 space-y-1 px-3 overflow-y-auto">
          {MENU_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={mobileOpen ? onMobileClose : undefined}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group',
                  active
                    ? 'bg-gold-400 text-wine-950 font-medium'
                    : 'hover:bg-white/5 text-cream-100/70 hover:text-cream-100',
                  !showLabel && 'justify-center',
                )}
              >
                <Icon
                  size={20}
                  className={clsx(
                    'shrink-0',
                    active ? 'text-wine-950' : 'group-hover:scale-110 transition-transform',
                  )}
                />
                {showLabel && <span className="text-sm truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Ver loja */}
        <div className="p-4 border-t border-white/10">
          <a
            href="/"
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 text-cream-100/50 hover:text-white hover:bg-white/5 rounded-lg transition-all group',
              !showLabel && 'justify-center',
            )}
          >
            <LogOut size={20} className="shrink-0 rotate-180 group-hover:translate-x-1 transition-transform" />
            {showLabel && <span className="text-sm">Ver loja</span>}
          </a>
        </div>
      </aside>
    </>
  )
}
