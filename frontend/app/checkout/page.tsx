'use client'

// ─────────────────────────────────────────────────────────────────────────────
// PAGAMENTO VIA MERCADO PAGO — COMENTADO TEMPORARIAMENTE
// Aguardando regularização de CNPJ para emissão de nota fiscal.
// Quando pronto, descomentar os blocos marcados com [MP].
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Loader2, MessageCircle, ShoppingBag, User, CreditCard, QrCode } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { api, authApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { buildWaMessage } from '@/lib/buildWaMessage'
import toast from 'react-hot-toast'

// [MP] import dynamic from 'next/dynamic'
// [MP] import { Lock, ArrowLeft, Copy, Check } from 'lucide-react'
// [MP] const MercadoPagoPayment = dynamic(() => import('@mercadopago/sdk-react').then(m => m.Payment), { ssr: false })

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5561982395045'

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

export default function CheckoutPage() {
  const router                        = useRouter()
  const { items, total, syncWithApi } = useCartStore()

  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const [name,     setName]     = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [payment,  setPayment]  = useState<PaymentMethod>('')

  const canSubmit = name.trim() !== '' && whatsapp.trim() !== '' && payment !== ''

  useEffect(() => {
    const token = localStorage.getItem('ug_token')

    // Força sincronização com backend antes de liberar a tela
    syncWithApi().finally(() => setLoading(false))

    if (token) {
      authApi.me()
        .then(({ data }) => {
          if (data.name)  setName(data.name)
          if (data.phone) setWhatsapp(data.phone)
        })
        .catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (items.length === 0) { toast.error('Seu carrinho está vazio.'); return }

    setSending(true)
    try {
      const token = localStorage.getItem('ug_token')
      let savedOrderNumber = ''

      // Salva o pedido no banco se o usuário estiver logado
      if (token) {
        const { data } = await api.post('/checkout/whatsapp', {
          customer_name:  name.trim(),
          customer_phone: whatsapp.trim(),
          payment_method: payment,
        })
        savedOrderNumber = data.order_number
        useCartStore.setState({ items: [], total: 0, itemCount: 0 })
      }

      // Captura os itens antes de limpar o store para montar a mensagem
      const waText = buildWaMessage(items, total, name, whatsapp, payment, savedOrderNumber || undefined)
      sessionStorage.setItem('ug_checkout_confirm', JSON.stringify({
        orderNumber: savedOrderNumber,
        waUrl: `https://wa.me/${WA_NUMBER}?text=${waText}`,
        waText: decodeURIComponent(waText),
      }))
      router.push('/checkout/confirmacao')
    } catch (err: any) {
      const msg: string = err.response?.data?.message ?? ''
      // Se o carrinho esvaziou (pedido anterior já limpou), sincroniza e avisa
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

          {/* Botão — desabilitado até todos os campos preenchidos */}
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
