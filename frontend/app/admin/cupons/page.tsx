'use client'

import { useEffect, useState } from 'react'
import { Ticket, Plus, ToggleLeft, ToggleRight, Trash2, Loader2, X } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PAYMENT_LABELS: Record<string, string> = {
  pix:         'PIX',
  credit_card: 'Cartão de Crédito',
}

interface Coupon {
  id:                  number
  code:                string
  discount_percentage: number
  is_active:           boolean
  expires_at:          string | null
  payment_method:      string | null
  usages_count:        number
  created_at:          string
}

const inputCls = 'w-full border border-gray-200 px-3 py-2 font-sans text-sm text-gray-800 focus:outline-none focus:border-wine-900 transition-colors bg-white placeholder:text-gray-300'

export default function AdminCouponsPage() {
  const [coupons,  setCoupons]  = useState<Coupon[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)

  const [code,          setCode]          = useState('')
  const [pct,           setPct]           = useState('')
  const [expiresAt,     setExpiresAt]     = useState('')
  const [isActive,      setIsActive]      = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<string>('all')

  async function fetchCoupons() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/coupons')
      setCoupons(data)
    } catch {
      toast.error('Erro ao carregar cupons.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCoupons() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || !pct) return
    setSaving(true)
    try {
      await api.post('/admin/coupons', {
        code:                code.trim(),
        discount_percentage: Number(pct),
        is_active:           isActive,
        expires_at:          expiresAt || null,
        payment_method:      paymentMethod === 'all' ? null : paymentMethod,
      })
      toast.success('Cupom criado!')
      setCode(''); setPct(''); setExpiresAt(''); setIsActive(true); setPaymentMethod('all')
      setShowForm(false)
      fetchCoupons()
    } catch (err: any) {
      const msg = err.response?.data?.errors?.code?.[0] ?? err.response?.data?.message ?? 'Erro ao criar cupom.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(coupon: Coupon) {
    try {
      const { data } = await api.patch(`/admin/coupons/${coupon.id}/toggle`)
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: data.is_active } : c))
      toast.success(data.is_active ? 'Cupom ativado.' : 'Cupom desativado.')
    } catch {
      toast.error('Erro ao alterar status.')
    }
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Excluir o cupom "${coupon.code}"? Esta ação não pode ser desfeita.`)) return
    try {
      await api.delete(`/admin/coupons/${coupon.id}`)
      setCoupons(prev => prev.filter(c => c.id !== coupon.id))
      toast.success('Cupom excluído.')
    } catch {
      toast.error('Erro ao excluir cupom.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-gray-800 font-medium">Cupons de Desconto</h2>
          <p className="font-sans text-sm text-gray-400 mt-0.5">Gerencie códigos de desconto — 1 uso por conta</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancelar' : 'Novo Cupom'}
        </button>
      </div>

      {/* Form criar */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-100 shadow-sm p-6 space-y-4"
        >
          <h3 className="font-serif text-lg text-gray-800">Criar Novo Cupom</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Código <span className="text-wine-900">*</span>
              </label>
              <input
                className={inputCls}
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="EX: PROMO10"
                maxLength={50}
                required
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Desconto (%) <span className="text-wine-900">*</span>
              </label>
              <input
                className={inputCls}
                type="number"
                min={1}
                max={100}
                value={pct}
                onChange={e => setPct(e.target.value)}
                placeholder="10"
                required
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Expira em (opcional)
              </label>
              <input
                className={inputCls}
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
          {/* Método de pagamento */}
          <div>
            <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-2">
              Válido para
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all',         label: 'PIX e Cartão' },
                { value: 'pix',         label: 'Apenas PIX' },
                { value: 'credit_card', label: 'Apenas Cartão' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaymentMethod(opt.value)}
                  className={clsx(
                    'px-4 py-2 font-sans text-sm border-2 transition-all duration-150',
                    paymentMethod === opt.value
                      ? 'border-wine-900 bg-wine-900 text-cream-100'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none font-sans text-sm text-gray-600">
              <input
                type="checkbox"
                className="w-4 h-4 accent-wine-900"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              Ativar imediatamente
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Criar Cupom
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-outline"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-wine-900" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-5">
            <Ticket size={40} className="text-gray-200" />
            <p className="font-serif text-xl text-gray-400 font-light">Nenhum cupom criado ainda</p>
            <p className="font-sans text-sm text-gray-300">Clique em "Novo Cupom" para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="bg-cream-100/60 text-left">
                  <th className="px-5 py-3.5 font-sans text-xs text-gray-400 uppercase tracking-wider">Código</th>
                  <th className="px-5 py-3.5 font-sans text-xs text-gray-400 uppercase tracking-wider">Desconto</th>
                  <th className="px-5 py-3.5 font-sans text-xs text-gray-400 uppercase tracking-wider">Válido para</th>
                  <th className="px-5 py-3.5 font-sans text-xs text-gray-400 uppercase tracking-wider">Usos</th>
                  <th className="px-5 py-3.5 font-sans text-xs text-gray-400 uppercase tracking-wider">Expira em</th>
                  <th className="px-5 py-3.5 font-sans text-xs text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 font-sans text-xs text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map(coupon => {
                  const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date()
                  return (
                    <tr key={coupon.id} className="hover:bg-cream-100/30 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-wine-900 tracking-widest text-xs bg-wine-50 border border-wine-100 px-2 py-1">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {coupon.discount_percentage}%
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm">
                        {coupon.payment_method
                          ? PAYMENT_LABELS[coupon.payment_method] ?? coupon.payment_method
                          : <span className="text-gray-400">PIX e Cartão</span>
                        }
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {coupon.usages_count}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {coupon.expires_at ? (
                          <span className={clsx(expired && 'text-red-500')}>
                            {formatDate(coupon.expires_at)}
                          </span>
                        ) : (
                          <span className="text-gray-300">Sem validade</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full',
                          coupon.is_active && !expired
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        )}>
                          {coupon.is_active && !expired ? 'Ativo' : expired ? 'Expirado' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(coupon)}
                            title={coupon.is_active ? 'Desativar' : 'Ativar'}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          >
                            {coupon.is_active
                              ? <ToggleRight size={20} className="text-green-600" />
                              : <ToggleLeft  size={20} className="text-gray-400" />
                            }
                          </button>
                          <button
                            onClick={() => handleDelete(coupon)}
                            title="Excluir"
                            className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
