import { formatPrice } from '@/lib/utils'

type PaymentMethod  = 'pix' | 'credit_card' | ''
type DeliveryType   = 'entrega' | 'retirada' | ''

interface AddressInfo {
  street?:       string
  number?:       string
  complement?:   string | null
  neighborhood?: string
  city?:         string
  state?:        string
  zip_code?:     string
}

export function buildWaMessage(
  items: { product_name: string; size: string | null; color: string | null; quantity: number; unit_price: number }[],
  total: number,
  name: string,
  phone: string,
  payment: PaymentMethod,
  orderNumber?: string,
  address?: AddressInfo,
  deliveryType?: DeliveryType,
  coupon?: { code: string; pct: number },
): string {
  const linhas = items.map((item, i) => {
    const detalhes = [
      item.size  ? `Tamanho: ${item.size}`  : null,
      item.color ? `Cor: ${item.color}`     : null,
      item.quantity > 1 ? `Quantidade: ${item.quantity}` : null,
    ].filter(Boolean).join(', ')
    return `${i + 1}. *${item.product_name}*${detalhes ? `\n   ${detalhes}` : ''}`
  })

  const paymentLabel  = payment === 'pix' ? 'PIX' : payment === 'credit_card' ? 'Cartão de Crédito' : '—'
  const isRetirada    = deliveryType === 'retirada'
  const totalLabel    = isRetirada
    ? `*Total: ${formatPrice(total)}*${coupon ? ` _(cupom ${coupon.code} -${coupon.pct}%)_` : ''}`
    : `*Total: ${formatPrice(total)}*${coupon ? ` _(cupom ${coupon.code} -${coupon.pct}%)_` : ''} _(frete a combinar)_`

  const entregaLinhas: (string | null)[] = []
  if (isRetirada) {
    entregaLinhas.push(``)
    entregaLinhas.push(`🏪 *Retirada no local* (combinaremos o ponto de retirada)`)
  } else if (address?.street) {
    entregaLinhas.push(``)
    entregaLinhas.push(`🚚 *Endereço de entrega:*`)
    entregaLinhas.push(`${address.street}, ${address.number ?? ''}${address.complement ? ` - ${address.complement}` : ''}`)
    if (address.neighborhood) entregaLinhas.push(address.neighborhood)
    if (address.city)         entregaLinhas.push(`${address.city}${address.state ? ` – ${address.state}` : ''}`)
    if (address.zip_code)     entregaLinhas.push(`CEP: ${address.zip_code}`)
  }

  const fechamento = isRetirada
    ? `Aguardo o retorno para combinarmos a retirada. Obrigado(a)!`
    : `Aguardo o retorno para combinarmos a entrega. Obrigado(a)!`

  const msg = [
    orderNumber
      ? `Olá! Quero confirmar meu pedido *${orderNumber}* na Unity Girl Style 🛍️`
      : `Olá! Vi os produtos da *Unity Girl Style* e gostaria de fazer um pedido 🛍️`,
    ``,
    ...linhas,
    ``,
    totalLabel,
    `💳 Forma de pagamento: *${paymentLabel}*`,
    ...entregaLinhas,
    ``,
    `Nome: *${name.trim() || '—'}*`,
    phone.trim() ? `WhatsApp: ${phone.trim()}` : null,
    ``,
    fechamento,
  ].filter(l => l !== null).join('\n')

  return encodeURIComponent(msg)
}
