'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Star, 
  Zap, 
  Tag,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<any>(null)

  async function fetchProducts() {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/products?page=${page}&search=${search}`)
      setProducts(data.data)
      setMeta(data)
    } catch (error) {
      toast.error('Erro ao carregar produtos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page])

  async function handleToggleFlag(id: number, field: 'is_featured' | 'is_new_arrival', currentValue: boolean) {
    try {
      await api.patch(`/admin/products/${id}/flag`, { field, value: !currentValue })
      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, [field]: !currentValue } : p)
      )
    } catch {
      toast.error('Erro ao atualizar produto.')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja remover este produto?')) return
    
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Produto removido!')
      fetchProducts()
    } catch (error) {
      toast.error('Erro ao remover produto.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-gray-800 font-medium">Gestão de Produtos</h2>
          <p className="text-gray-500 text-sm mt-1">Gerencie seu catálogo, estoque e promoções.</p>
        </div>
        <Link 
          href="/admin/produtos/novo"
          className="bg-wine-900 text-cream-100 px-6 py-3 rounded-lg font-sans text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-wine-800 transition-colors shadow-lg"
        >
          <Plus size={18} /> Novo Produto
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-wine-900 transition-colors"
          />
        </div>
        <button 
          onClick={fetchProducts}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Filtrar
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">Produto</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">Preço</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Estoque</th>
                <th className="px-6 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Carregando catálogo...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Nenhum produto encontrado.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-16 bg-gray-100 rounded overflow-hidden shadow-sm">
                          <Image 
                            src={product.primary_image?.url ?? 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop'}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Destaque toggle */}
                        <button
                          onClick={() => handleToggleFlag(product.id, 'is_featured', product.is_featured)}
                          title={product.is_featured ? 'Remover destaque' : 'Marcar como destaque'}
                          className="group/tip relative p-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
                        >
                          <Star
                            size={16}
                            className={product.is_featured
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200 hover:text-yellow-300'}
                          />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {product.is_featured ? 'Destaque ativo' : 'Ativar destaque'}
                          </span>
                        </button>

                        {/* Lançamento toggle */}
                        <button
                          onClick={() => handleToggleFlag(product.id, 'is_new_arrival', product.is_new_arrival)}
                          title={product.is_new_arrival ? 'Remover lançamento' : 'Marcar como lançamento'}
                          className="group/tip relative p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Zap
                            size={16}
                            className={product.is_new_arrival
                              ? 'text-blue-500 fill-blue-500'
                              : 'text-gray-200 hover:text-blue-300'}
                          />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {product.is_new_arrival ? 'Lançamento ativo' : 'Ativar lançamento'}
                          </span>
                        </button>

                        {/* Promoção (só indicador) */}
                        {product.sale_price && (
                          <div className="group/tip relative p-1.5">
                            <Tag size={16} className="text-green-500 fill-green-500" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Promoção</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{formatPrice(product.sale_price ?? product.price)}</span>
                        {product.sale_price && (
                          <span className="text-[10px] text-gray-300 line-through">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        product.variants_count > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {product.variants_count} variantes
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/produtos/${product.id}/editar`}
                          className="p-2 text-gray-400 hover:text-wine-900 hover:bg-wine-50 rounded-lg transition-all"
                        >
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              Mostrando {meta.from} até {meta.to} de {meta.total} produtos
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-gray-700 px-3">{page} / {meta.last_page}</span>
              <button 
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
