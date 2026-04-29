'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import { useCartStore }      from '@/store/cartStore'
import { useFavoritesStore } from '@/store/favoritesStore'

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin  = pathname.startsWith('/admin')

  // Reidrata os stores persistidos APÓS a hidratação do React,
  // evitando mismatch entre o HTML do servidor e o cliente.
  useEffect(() => {
    useCartStore.persist.rehydrate()
    useFavoritesStore.persist.rehydrate()
  }, [])

  if (isAdmin) return <>{children}</>

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
