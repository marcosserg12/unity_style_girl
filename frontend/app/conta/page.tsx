"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Package, MapPin, LogOut, ShoppingBag, Star, ChevronRight } from "lucide-react"
import { authApi, ordersApi } from "@/lib/api"
import { formatPrice, formatDate } from "@/lib/utils"
import type { User, Order } from "@/lib/types"
import toast from "react-hot-toast"

const QUICK_LINKS = [
  { href: "/conta/pedidos",        icon: Package,     label: "Meus Pedidos",         desc: "Acompanhe seus pedidos" },
  { href: "/conta/enderecos",      icon: MapPin,       label: "Enderecos",            desc: "Gerencie enderecos de entrega" },
  { href: "/produtos",             icon: ShoppingBag,  label: "Continuar Comprando",  desc: "Ver nossa colecao" },
  { href: "/produtos?filter=sale", icon: Star,         label: "Promocoes",            desc: "Ofertas exclusivas para voce" },
]

const STATUS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800", shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800",
}

export default function ContaPage() {
  const [user,    setUser]    = useState<User | null>(null)
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("ug_token")
    if (!token) { router.push("/login"); return }
    Promise.all([authApi.me(), ordersApi.list()])
      .then(([{ data: u }, { data: o }]) => { setUser(u); setOrders((o.data ?? []).slice(0, 3)) })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    localStorage.removeItem("ug_token")
    localStorage.removeItem("ug_user")
    toast.success("Até logo!")
    window.dispatchEvent(new Event('storage')) // Notifica outros componentes
    router.push("/")
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-2 border-wine-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return null
  const initials = user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="bg-white shadow-card p-6 md:p-8">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-wine-900 rounded-full flex items-center justify-center">
              <span className="font-serif text-cream-100 text-xl md:text-2xl font-semibold">{initials}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-xl md:text-2xl text-gray-800 font-light">{user.name}</h2>
            <p className="font-sans text-sm text-gray-400 mt-0.5">{user.email}</p>
            {user.phone && <p className="font-sans text-sm text-gray-400">{user.phone}</p>}
            <span className="inline-block mt-2 badge bg-wine-900/10 text-wine-900 text-[10px]">
              {user.role === "admin" ? "Administradora" : "Cliente"}
            </span>
          </div>
          <button onClick={handleLogout} className="hidden md:flex items-center gap-2 font-sans text-xs text-gray-400 hover:text-red-600 transition-colors px-3 py-2 hover:bg-red-50 shrink-0">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }} className="grid grid-cols-2 gap-3">
        {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} className="bg-white shadow-card hover:shadow-card-hover p-5 group transition-all duration-300 flex flex-col gap-3">
            <div className="w-10 h-10 bg-cream-200 group-hover:bg-wine-900 flex items-center justify-center transition-colors duration-300">
              <Icon size={18} className="text-wine-900 group-hover:text-cream-100 transition-colors duration-300" />
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-gray-800 group-hover:text-wine-900 transition-colors">{label}</p>
              <p className="font-sans text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="bg-white shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 className="font-serif text-lg text-gray-800 font-light">Último Pedido</h3>
          {orders.length > 0 && (
            <Link href="/conta/pedidos" className="font-sans text-xs text-wine-900 hover:underline flex items-center gap-1">Ver todos <ChevronRight size={12} /></Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
            <div className="w-14 h-14 bg-cream-200 flex items-center justify-center">
              <Package size={24} className="text-wine-900/40" />
            </div>
            <p className="font-serif text-gray-600 text-base">Você ainda não realizou nenhum pedido</p>
            <p className="font-sans text-xs text-gray-400">Explore nossa coleção e faça seu primeiro pedido!</p>
            <Link href="/produtos" className="btn-primary mt-2 text-xs">Ver produtos</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 1).map(order => (
              <Link key={order.id} href={`/conta/pedidos/${order.id}`} className="flex items-center justify-between px-6 py-5 hover:bg-cream-100/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cream-200 flex items-center justify-center shrink-0">
                    <Package size={18} className="text-wine-900" />
                  </div>
                  <div>
                    <p className="font-sans text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Pedido {order.order_number}</p>
                    <p className="font-sans text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`badge text-[10px] ${STATUS[order.status] ?? "bg-gray-100 text-gray-600"}`}>{order.status_label}</span>
                    <p className="font-serif text-wine-900 font-semibold text-sm mt-1">{formatPrice(order.total)}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-wine-900 transition-colors" />
                </div>
              </Link>
            ))}
            {orders.length > 1 && (
              <Link href="/conta/pedidos" className="flex items-center justify-center gap-1 py-3 font-sans text-xs text-wine-900 hover:bg-cream-100/50 transition-colors">
                Ver todos os {orders.length} pedidos <ChevronRight size={12} />
              </Link>
            )}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }} className="md:hidden">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 font-sans text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors">
          <LogOut size={16} /> Sair da conta
        </button>
      </motion.div>
    </div>
  )
}
