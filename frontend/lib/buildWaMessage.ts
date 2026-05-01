import { formatPrice } from '@/lib/utils'

type PaymentMethod = 'pix' | 'credit_card' | ''

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
): string {
  const linhas = items.map((item, i) => {
    const detalhes = [
      item.size  ? `Tamanho: ${item.size}`  : null,
      item.color ? `Cor: ${item.color}`     : null,
      item.quantity > 1 ? `Quantidade: ${item.quantity}` : null,
    ].filter(Boolean).join(', ')
    return `${i + 1}. *${item.product_name}*${detalhes ? `\n   ${detalhes}` : ''}`
  })

  const paymentLabel = payment === 'pix' ? 'PIX' : payment === 'credit_card' ? 'Cartão de Crédito' : '—'

  const enderecoLinhas: (string | null)[] = []
  if (address?.street) {
    enderecoLinhas.push(``)
    enderecoLinhas.push(`📍 *Endereço de entrega:*`)
    enderecoLinhas.push(`${address.street}, ${address.number ?? ''}${address.complement ? ` - ${address.complement}` : ''}`)
    if (address.neighborhood) enderecoLinhas.push(address.neighborhood)
    if (address.city)         enderecoLinhas.push(`${address.city}${address.state ? ` – ${address.state}` : ''}`)
    if (address.zip_code)     enderecoLinhas.push(`CEP: ${address.zip_code}`)
  }

  const msg = [
    orderNumber
      ? `Olá! Quero confirmar meu pedido *${orderNumber}* na Unity Girl Style 🛍️`
      : `Olá! Vi os produtos da *Unity Girl Style* e gostaria de fazer um pedido 🛍️`,
    ``,
    ...linhas,
    ``,
    `*Total: ${formatPrice(total)}* _(frete a combinar)_`,
    `💳 Forma de pagamento: *${paymentLabel}*`,
    ...enderecoLinhas,
    ``,
    `Nome: *${name.trim() || '—'}*`,
    phone.trim() ? `WhatsApp: ${phone.trim()}` : null,
    ``,
    `Aguardo o retorno para combinarmos a entrega. Obrigado(a)!`,
  ].filter(l => l !== null).join('\n')

  return encodeURIComponent(msg)
}
