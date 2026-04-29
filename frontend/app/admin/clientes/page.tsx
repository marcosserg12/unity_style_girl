'use client'

import { useEffect, useState } from 'react'
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<any>(null)

  async function fetchCustomers() {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/users`, {
        params: { page, search, per_page: 20 }
      })
      setCustomers(data.data)
      setMeta(data)
    } catch (error) {
      toast.error('Erro ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [page])

  const handleToggleStatus = async (customer: any) => {
    try {
      await api.patch(`/admin/users/${customer.id}/toggle-active`)
      toast.success(customer.is_active ? 'Cliente desativado.' : 'Cliente ativado.')
      fetchCustomers()
    } catch (error) {
      toast.error('Erro ao alterar status.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-gray-800 font-medium">Clientes</h2>
        <p className="text-gray-500 text-sm mt-1">Gerencie a base de usuários cadastrados.</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-wine-900 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-sans">Carregando clientes...</div>
        ) : customers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-sans">Nenhum cliente encontrado.</div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-cream-200 rounded-full flex items-center justify-center text-wine-900 font-serif text-xl font-bold">
                    {customer.name[0]}
                  </div>
                  <button 
                    onClick={() => handleToggleStatus(customer)}
                    title={customer.is_active ? "Desativar Cliente" : "Ativar Cliente"}
                    className={`p-2 rounded-lg transition-colors ${
                      customer.is_active ? 'text-green-500 hover:bg-red-50 hover:text-red-500' : 'text-red-500 hover:bg-green-50 hover:text-green-500'
                    }`}
                  >
                    {customer.is_active ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
                  </button>
                </div>
                
                <h3 className="font-serif text-lg font-medium text-gray-800 line-clamp-1">{customer.name}</h3>
                
                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="shrink-0" />
                    <span>Desde {formatDate(customer.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-wine-900">
                  <ShoppingBag size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">{customer.orders_count} Pedidos</span>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-wine-900 transition-colors">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium px-2">Página {page} de {meta.last_page}</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
