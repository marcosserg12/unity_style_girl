'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Plus, Star, Trash2, Loader2, ChevronDown } from 'lucide-react'
import { api } from '@/lib/api'
import { Address } from '@/lib/types'
import toast from 'react-hot-toast'

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const inputCls = 'w-full border border-gray-200 px-3.5 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:border-wine-900 transition-colors bg-white placeholder:text-gray-300'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-wine-900 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const emptyForm = {
  recipient_name: '',
  zip_code: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  label: '',
  is_default: false,
}

export default function EnderecosPage() {
  const router = useRouter()

  const [addresses,  setAddresses]  = useState<Address[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [form,       setForm]       = useState(emptyForm)

  const fetchAddresses = useCallback(async () => {
    try {
      const { data } = await api.get('/addresses')
      setAddresses(data)
    } catch {
      toast.error('Não foi possível carregar os endereços.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('ug_token')
    if (!token) { router.replace('/login?redirect=/conta/enderecos'); return }
    fetchAddresses()
  }, [fetchAddresses, router])

  const handleCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    setForm(f => ({ ...f, zip_code: cep }))
    if (clean.length !== 8) return
    setCepLoading(true)
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm(f => ({
          ...f,
          street:       data.logradouro || f.street,
          neighborhood: data.bairro     || f.neighborhood,
          city:         data.localidade || f.city,
          state:        data.uf         || f.state,
        }))
      }
    } catch {}
    finally { setCepLoading(false) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/addresses', {
        ...form,
        zip_code: form.zip_code.replace(/\D/g, ''),
        is_default: addresses.length === 0 ? true : form.is_default,
      })
      toast.success('Endereço salvo!')
      setForm(emptyForm)
      setShowForm(false)
      fetchAddresses()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erro ao salvar endereço.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este endereço?')) return
    try {
      await api.delete(`/addresses/${id}`)
      setAddresses(prev => prev.filter(a => a.id !== id))
      toast.success('Endereço removido.')
    } catch {
      toast.error('Não foi possível remover.')
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await api.patch(`/addresses/${id}/default`)
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
      toast.success('Endereço padrão atualizado.')
    } catch {
      toast.error('Não foi possível atualizar.')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 size={28} className="animate-spin text-wine-900" />
    </div>
  )

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-wine-900 flex items-center justify-center">
            <MapPin size={15} className="text-cream-100" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-gray-800">Meus Endereços</h2>
            <p className="font-sans text-xs text-gray-400">Gerencie seus endereços de entrega</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 bg-wine-900 text-cream-100 px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider hover:bg-wine-800 transition-colors"
        >
          <Plus size={14} />
          Novo Endereço
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-cream-100/50">
            <h3 className="font-serif text-base text-gray-800">Adicionar Novo Endereço</h3>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome do destinatário" required>
                <input
                  className={inputCls}
                  value={form.recipient_name}
                  onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))}
                  placeholder="Quem vai receber"
                  required
                />
              </Field>
              <Field label="Rótulo (opcional)">
                <input
                  className={inputCls}
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Casa, Trabalho…"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="CEP" required>
                <div className="relative">
                  <input
                    className={inputCls}
                    value={form.zip_code}
                    onChange={e => handleCep(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    required
                  />
                  {cepLoading && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                  )}
                </div>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Rua / Avenida" required>
                  <input
                    className={inputCls}
                    value={form.street}
                    onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                    placeholder="Nome da rua"
                    required
                  />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Número" required>
                <input
                  className={inputCls}
                  value={form.number}
                  onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                  placeholder="123"
                  required
                />
              </Field>
              <div className="sm:col-span-3">
                <Field label="Complemento">
                  <input
                    className={inputCls}
                    value={form.complement}
                    onChange={e => setForm(f => ({ ...f, complement: e.target.value }))}
                    placeholder="Apto, Bloco…"
                  />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Bairro" required>
                <input
                  className={inputCls}
                  value={form.neighborhood}
                  onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                  placeholder="Bairro"
                  required
                />
              </Field>
              <Field label="Cidade" required>
                <input
                  className={inputCls}
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Cidade"
                  required
                />
              </Field>
              <Field label="Estado" required>
                <div className="relative">
                  <select
                    className={`${inputCls} appearance-none pr-9`}
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    required
                  >
                    <option value="">UF</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Field>
            </div>

            {addresses.length > 0 && (
              <label className="flex items-center gap-2.5 cursor-pointer font-sans text-sm text-gray-600 select-none">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                  className="w-4 h-4 accent-wine-900"
                />
                Definir como endereço padrão
              </label>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Salvar Endereço
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm) }}
                className="font-sans text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {addresses.length === 0 && !showForm ? (
        <div className="bg-white shadow-card p-10 flex flex-col items-center justify-center text-center min-h-[240px]">
          <div className="w-14 h-14 bg-cream-100 flex items-center justify-center mb-4">
            <MapPin size={24} className="text-wine-900/40" />
          </div>
          <p className="font-sans text-sm text-gray-400 mb-4">Nenhum endereço cadastrado ainda.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> Adicionar Endereço
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div
              key={addr.id}
              className={`bg-white border shadow-sm p-5 relative ${addr.is_default ? 'border-wine-900/30' : 'border-gray-100'}`}
            >
              {addr.is_default && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-wine-900 text-cream-100 px-2 py-0.5">
                  <Star size={10} fill="currentColor" />
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-wider">Padrão</span>
                </div>
              )}
              {addr.label && (
                <p className="font-sans text-[10px] uppercase tracking-widest text-wine-900 font-semibold mb-1">{addr.label}</p>
              )}
              <p className="font-serif text-base text-gray-800">{addr.recipient_name}</p>
              <p className="font-sans text-sm text-gray-500 mt-1 leading-relaxed">
                {addr.street}, {addr.number}{addr.complement ? ` — ${addr.complement}` : ''}<br />
                {addr.neighborhood} — {addr.city}/{addr.state}<br />
                CEP: {addr.zip_code}
              </p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="font-sans text-xs text-gray-400 hover:text-wine-900 transition-colors flex items-center gap-1.5"
                  >
                    <Star size={12} /> Definir como padrão
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="font-sans text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <Trash2 size={12} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
