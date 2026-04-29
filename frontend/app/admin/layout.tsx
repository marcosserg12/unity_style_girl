'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/admin/Sidebar'
import { authApi } from '@/lib/api'
import type { User } from '@/lib/types'
import toast from 'react-hot-toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<User | null>(null)
  const [loading, setLoading]     = useState(true)
  const [sidebarOpen, setSidebar] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('ug_token')
      if (!token) { router.push('/login?redirect=/admin'); return }

      try {
        const { data: userData } = await authApi.me()
        if (userData.role !== 'admin') {
          toast.error('Acesso negado. Apenas administradores podem acessar esta área.')
          router.push('/')
          return
        }
        setUser(userData)
      } catch {
        localStorage.removeItem('ug_token')
        router.push('/login?redirect=/admin')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-wine-900/20 border-t-wine-900 rounded-full animate-spin" />
          <p className="font-serif text-wine-900 animate-pulse">Autenticando painel...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-dvh bg-cream-200">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebar(false)} />

      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 flex items-center gap-3 sticky top-0 z-10">
          {/* Hamburger — só mobile */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            onClick={() => setSidebar(true)}
            aria-label="Abrir menu"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <h1 className="font-serif text-lg md:text-xl text-gray-800 font-medium flex-1 truncate">
            Painel Administrativo
          </h1>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-tight">{user.name}</p>
              <p className="text-[10px] text-wine-900 font-bold uppercase tracking-widest">Administradora</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-wine-900 text-cream-100 flex items-center justify-center font-serif text-base font-bold shrink-0">
              {user.name[0]}
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
