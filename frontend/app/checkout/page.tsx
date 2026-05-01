'use client'

// ─────────────────────────────────────────────────────────────────────────────
// PAGAMENTO VIA MERCADO PAGO — COMENTADO TEMPORARIAMENTE
// Aguardando regularização de CNPJ para emissão de nota fiscal.
// Quando pronto, descomentar os blocos marcados com [MP].
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronRight, Loader2, MessageCircle, ShoppingBag,
  User, CreditCard, QrCode, MapPin, Plus, Star, ChevronDown,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { api, authApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { buildWaMessage } from '@/lib/buildWaMessage'
import { Address } from '@/lib/types'
import toast from 'react-hot-toast'

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5561982395045'

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const inputCls = 'w-full border border-gray-200 px-4 py-2.5 font-sans text-sm text-gray-800 focus:outline-none focus:border-wine-900 transition-colors bg-white placeholder:text-gray-300'

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

type PaymentMethod = 'pix' | 'credit_card' | ''

const emptyAddress = {
  street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip_code: '',
}

export default function CheckoutPage() {
  const router                        = useRouter()
  const { items, total, syncWithApi } = useCartStore()

  const [loading,     setLoading]     = useState(true)
  const [sending,     setSending]     = useState(false)
  const [name,        setName]        = useState('')
  const [whatsapp,    setWhatsapp]    = useState('')
  const [payment,     setPayment]     = useState<PaymentMethod>('')

  // Endereços
  const [addresses,      setAddresses]      = useState<Address[]>([])
  const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null)
  const [showNewAddr,    setShowNewAddr]    = useState(false)
  const [newAddr,        setNewAddr]        = useState(emptyAddress)
  const [saveAddr,       setSaveAddr]       = useState(false)
  const [cepLoading,     setCepLoading]     = useState(false)

  const fetchAddresses = useCallback(async () => {
    try {
      const { data } = await api.get('/addresses')
      setAddresses(data)
      const def = data.find((a: Address) => a.is_default)
      if (def) setSelectedAddrId(def.id)
    } catch {}
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('ug_token')
    if (!token) {
      router.replace('/login?redirect=/checkout')
      return
    }

    Promise.all([
      syncWithApi(),
      authApi.me().then(({ data }) => {
        if (data.name)  setName(data.name)
        if (data.phone) setWhatsapp(data.phone)
      }).catch(() => {}),
      fetchAddresses(),
    ]).finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    setNewAddr(a => ({ ...a, zip_code: cep }))
    if (clean.length !== 8) return
    setCepLoading(true)
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setNewAddr(a => ({
          ...a,
          street:       data.logradouro || a.street,
          neighborhood: data.bairro     || a.neighborhood,
          city:         data.localidade || a.city,
          state:        data.uf         || a.state,
        }))
      }
    } catch {}
    finally { setCepLoading(false) }
  }

  // Resolve o endereço final para enviar ao backend e ao WhatsApp
  const resolvedAddress = (() => {
    if (selectedAddrId) {
      const a = addresses.find(x => x.id === selectedAddrId)
      return a ? { id: a.id } : null
    }
    if (showNewAddr && newAddr.street) return null // vai como campos individuais
    return null
  })()

  const canSubmit = name.trim() !== '' && whatsapp.trim() !== '' && payment !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (items.length === 0) { toast.error('Seu carrinho está vazio.'); return }

    // Validação de endereço
    if (!selectedAddrId && showNewAddr) {
      const { street, number, neighborhood, city, state, zip_code } = newAddr
      if (!street || !number || !neighborhood || !city || !state || !zip_code) {
        toast.error('Preencha todos os campos obrigatórios do endereço.')
        return
      }
    }

    setSending(true)
    try {
      // Monta payload do endereço
      const addrPayload: Record<string, unknown> = {}
      let addrForWa: typeof emptyAddress | null = null

      if (selectedAddrId) {
        addrPayload.address_id = selectedAddrId
        const a = addresses.find(x => x.id === selectedAddrId)
        if (a) addrForWa = { street: a.street, number: a.number, complement: a.complement ?? '', neighborhood: a.neighborhood, city: a.city, state: a.state, zip_code: a.zip_code }
      } else if (showNewAddr && newAddr.street) {
        Object.assign(addrPayload, {
          street:       newAddr.street,
          number:       newAddr.number,
          complement:   newAddr.complement || null,
          neighborhood: newAddr.neighborhood,
          city:         newAddr.city,
          state:        newAddr.state,
          zip_code:     newAddr.zip_code.replace(/\D/g, ''),
          save_address: saveAddr,
        })
        addrForWa = newAddr
      }

      const { data } = await api.post('/checkout/whatsapp', {
        customer_name:  name.trim(),
        customer_phone: whatsapp.trim(),
        payment_method: payment,
        ...addrPayload,
      })

      const savedOrderNumber = data.order_number
      useCartStore.setState({ items: [], total: 0, itemCount: 0 })

      const waText = buildWaMessage(
        items, total, name, whatsapp, payment,
        savedOrderNumber,
        addrForWa ?? undefined,
      )
      sessionStorage.setItem('ug_checkout_confirm', JSON.stringify({
        orderNumber: savedOrderNumber,
        waUrl: `https://wa.me/${WA_NUMBER}?text=${waText}`,
        waText: decodeURIComponent(waText),
      }))
      router.push('/checkout/confirmacao')
    } catch (err: any) {
      const msg: string = err.response?.data?.message ?? ''
      if (msg.toLowerCase().includes('carrinho')) {
        await syncWithApi()
        toast.error('Seu carrinho foi esvaziado. Adicione os produtos novamente.')
      } else {
        toast.error(msg || 'Erro ao registrar pedido. Tente novamente.')
      }
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={32} className="animate-spin text-wine-900" />
    </div>
  )

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-5">
      <ShoppingBag size={52} className="text-gray-200" />
      <p className="font-serif text-2xl text-gray-600 font-light">Seu carrinho está vazio</p>
      <p className="font-sans text-sm text-gray-400">Adicione produtos antes de finalizar o pedido.</p>
      <Link href="/produtos" className="btn-primary mt-2">Ver produtos</Link>
    </div>
  )

  return (
    <>
      {/* Hero */}
      <div className="bg-wine-900 text-cream-100 py-10">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs font-sans text-cream-100/50 mb-3 flex-wrap">
            <Link href="/" className="hover:text-cream-100 transition-colors">Início</Link>
            <ChevronRight size={12} />
            <Link href="/produtos" className="hover:text-cream-100 transition-colors">Catálogo</Link>
            <ChevronRight size={12} />
            <span className="text-cream-100/80">Finalizar Pedido</span>
          </nav>
          <div className="flex items-center gap-3">
            <MessageCircle size={18} className="text-[#25D366]" />
            <h1 className="font-serif text-2xl font-light">Finalizar Pedido via WhatsApp</h1>
          </div>
          <p className="font-sans text-xs text-cream-100/60 mt-2">
            Preencha seus dados e finalize — nossa equipe combina entrega e pagamento com você.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 grid lg:grid-cols-[1fr_320px] gap-8 items-start">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Dados pessoais */}
          <div className="bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-cream-100/50">
              <div className="w-7 h-7 bg-wine-900 flex items-center justify-center shrink-0">
                <User size={14} className="text-cream-100" />
              </div>
              <h2 className="font-serif text-lg text-gray-800">Seus Dados</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Seu nome" required>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nome completo"
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="WhatsApp" required>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Endereço de entrega */}
          <div className="bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-cream-100/50">
              <div className="w-7 h-7 bg-wine-900 flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-cream-100" />
              </div>
              <h2 className="font-serif text-lg text-gray-800">Endereço de Entrega</h2>
            </div>

            <div className="p-6 space-y-4">

              {/* Endereços salvos */}
              {addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-4 border-2 p-4 cursor-pointer transition-all ${
                        selectedAddrId === addr.id && !showNewAddr
                          ? 'border-wine-900 bg-wine-900/[0.03]'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-wine-900 shrink-0"
                        checked={selectedAddrId === addr.id && !showNewAddr}
                        onChange={() => { setSelectedAddrId(addr.id); setShowNewAddr(false) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {addr.label && (
                            <span className="font-sans text-[10px] uppercase tracking-widest text-wine-900 font-semibold">{addr.label}</span>
                          )}
                          {addr.is_default && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-sans">
                              <Star size={9} fill="currentColor" /> Padrão
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-sm text-gray-700 font-medium mt-0.5">{addr.recipient_name}</p>
                        <p className="font-sans text-xs text-gray-400 leading-relaxed mt-0.5">
                          {addr.street}, {addr.number}{addr.complement ? ` — ${addr.complement}` : ''} · {addr.neighborhood} · {addr.city}/{addr.state} · CEP {addr.zip_code}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Botão "Usar outro endereço" */}
              <button
                type="button"
                onClick={() => { setShowNewAddr(v => !v); if (!showNewAddr) setSelectedAddrId(null) }}
                className={`flex items-center gap-2.5 w-full border-2 border-dashed px-4 py-3.5 font-sans text-sm transition-all ${
                  showNewAddr
                    ? 'border-wine-900 text-wine-900 bg-wine-900/[0.03]'
                    : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
                }`}
              >
                <Plus size={15} />
                {addresses.length > 0 ? 'Usar outro endereço' : 'Informar endereço de entrega'}
              </button>

              {/* Form novo endereço */}
              {showNewAddr && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="CEP" required>
                      <div className="relative">
                        <input
                          className={inputCls}
                          value={newAddr.zip_code}
                          onChange={e => handleCep(e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
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
                          value={newAddr.street}
                          onChange={e => setNewAddr(a => ({ ...a, street: e.target.value }))}
                          placeholder="Nome da rua"
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Field label="Número" required>
                      <input
                        className={inputCls}
                        value={newAddr.number}
                        onChange={e => setNewAddr(a => ({ ...a, number: e.target.value }))}
                        placeholder="123"
                      />
                    </Field>
                    <div className="sm:col-span-3">
                      <Field label="Complemento">
                        <input
                          className={inputCls}
                          value={newAddr.complement}
                          onChange={e => setNewAddr(a => ({ ...a, complement: e.target.value }))}
                          placeholder="Apto, Bloco…"
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Bairro" required>
                      <input
                        className={inputCls}
                        value={newAddr.neighborhood}
                        onChange={e => setNewAddr(a => ({ ...a, neighborhood: e.target.value }))}
                        placeholder="Bairro"
                      />
                    </Field>
                    <Field label="Cidade" required>
                      <input
                        className={inputCls}
                        value={newAddr.city}
                        onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))}
                        placeholder="Cidade"
                      />
                    </Field>
                    <Field label="Estado" required>
                      <div className="relative">
                        <select
                          className={`${inputCls} appearance-none pr-9`}
                          value={newAddr.state}
                          onChange={e => setNewAddr(a => ({ ...a, state: e.target.value }))}
                        >
                          <option value="">UF</option>
                          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </Field>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer font-sans text-sm text-gray-600 select-none">
                    <input
                      type="checkbox"
                      checked={saveAddr}
                      onChange={e => setSaveAddr(e.target.checked)}
                      className="w-4 h-4 accent-wine-900"
                    />
                    Salvar este endereço para próximas compras
                  </label>
                </div>
              )}

              {addresses.length === 0 && !showNewAddr && (
                <p className="font-sans text-xs text-gray-400 text-center py-2">
                  Clique acima para informar onde entregar.
                </p>
              )}
            </div>
          </div>

          {/* Forma de pagamento */}
          <div className="bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-cream-100/50">
              <div className="w-7 h-7 bg-wine-900 flex items-center justify-center shrink-0">
                <CreditCard size={14} className="text-cream-100" />
              </div>
              <h2 className="font-serif text-lg text-gray-800">
                Forma de Pagamento <span className="text-wine-900 text-sm">*</span>
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayment('pix')}
                className={`flex items-center gap-4 border-2 px-5 py-4 transition-all text-left ${
                  payment === 'pix'
                    ? 'border-wine-900 bg-wine-900/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${payment === 'pix' ? 'bg-wine-900' : 'bg-gray-100'}`}>
                  <QrCode size={20} className={payment === 'pix' ? 'text-cream-100' : 'text-gray-400'} />
                </div>
                <div>
                  <p className={`font-serif text-base font-medium ${payment === 'pix' ? 'text-wine-900' : 'text-gray-700'}`}>PIX</p>
                  <p className="font-sans text-xs text-gray-400">Pagamento instantâneo</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPayment('credit_card')}
                className={`flex items-center gap-4 border-2 px-5 py-4 transition-all text-left ${
                  payment === 'credit_card'
                    ? 'border-wine-900 bg-wine-900/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${payment === 'credit_card' ? 'bg-wine-900' : 'bg-gray-100'}`}>
                  <CreditCard size={20} className={payment === 'credit_card' ? 'text-cream-100' : 'text-gray-400'} />
                </div>
                <div>
                  <p className={`font-serif text-base font-medium ${payment === 'credit_card' ? 'text-wine-900' : 'text-gray-700'}`}>Cartão de Crédito</p>
                  <p className="font-sans text-xs text-gray-400">Combinamos as parcelas</p>
                </div>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 px-5 py-4">
            <MessageCircle size={18} className="text-green-700 shrink-0 mt-0.5" />
            <p className="font-sans text-sm text-green-800 leading-relaxed">
              <strong>Como funciona?</strong> Ao finalizar, o WhatsApp abrirá com os detalhes do seu pedido. Nossa equipe entrará em contato para confirmar entrega e pagamento.
            </p>
          </div>

          <button
            type="submit"
            disabled={sending || !canSubmit}
            className={`w-full font-sans font-bold text-sm tracking-widest uppercase py-4 flex items-center justify-center gap-2.5 transition-all shadow-sm ${
              canSubmit
                ? 'bg-[#25D366] hover:bg-[#20b858] text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending
              ? <Loader2 size={18} className="animate-spin" />
              : <><MessageCircle size={18} /> Finalizar pelo WhatsApp</>
            }
          </button>

          {!canSubmit && (
            <p className="text-center font-sans text-xs text-gray-400">
              Preencha nome, WhatsApp e selecione a forma de pagamento para continuar.
            </p>
          )}
        </form>

        {/* Resumo */}
        <div className="sticky top-24">
          <div className="bg-white border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 bg-cream-100/50">
              <h2 className="font-serif text-lg text-gray-800">Resumo do Pedido</h2>
            </div>
            <div className="px-5 py-3 divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 py-3">
                  <div className="relative w-11 shrink-0 bg-cream-200 overflow-hidden" style={{ height: 52 }}>
                    {item.image_url && (
                      <Image src={item.image_url} alt={item.product_name} fill className="object-cover" sizes="44px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs font-semibold text-gray-700 line-clamp-2 leading-snug">{item.product_name}</p>
                    {item.size  && <p className="font-sans text-[10px] text-gray-400 mt-0.5">Tam: {item.size}</p>}
                    {item.color && <p className="font-sans text-[10px] text-gray-400">Cor: {item.color}</p>}
                    <p className="font-sans text-xs text-wine-900 font-bold mt-1">{item.quantity}× {formatPrice(item.unit_price)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between font-sans text-sm text-gray-500">
                <span>Subtotal</span><span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between font-sans text-sm text-gray-500">
                <span>Frete</span>
                <span className="text-green-700 font-semibold">A combinar</span>
              </div>
              <p className="font-sans text-[10px] text-gray-400">Entrega local combinada via WhatsApp</p>
              <div className="flex justify-between font-serif text-lg font-semibold pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-wine-900">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
