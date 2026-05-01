'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { ShoppingBag, Heart, Shield, RotateCcw, Truck, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { colorHex } from '@/lib/colors'
import type { Product } from '@/lib/types'

interface Props {
  product:      Product
  initialColor?: string | null
}

const SIZES_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'Único', 'U']

export default function ProductDetail({ product, initialColor }: Props) {
  const images   = product.images ?? []
  const variants = product.active_variants ?? []

  // Cores únicas presentes nas variações (exclui placeholders sem significado visual)
  const availableColors = useMemo(() =>
    [...new Map(
      variants
        .filter(v => v.color && v.color !== 'Default' && v.color !== 'Único')
        .map(v => [v.color, v])
    ).values()]
  , [variants])

  // Pré-seleciona a cor da URL ou a primeira disponível
  const [selectedColor, setSelectedColor] = useState<string | null>(() => {
    if (initialColor && availableColors.some(v => v.color === initialColor)) return initialColor
    return availableColors[0]?.color ?? null
  })
  const [selectedSize,  setSelectedSize]  = useState<string | null>(null)
  const [activeImage,   setActiveImage]   = useState(0)
  const [liked,         setLiked]         = useState(false)
  const [adding,        setAdding]        = useState(false)
  const [descOpen,      setDescOpen]      = useState(true)

  const addItem = useCartStore(s => s.addItem)

  // Imagens filtradas pela cor selecionada
  const colorImages = useMemo(() => {
    if (!selectedColor) return images
    const filtered = images.filter(img => img.color === selectedColor)
    return filtered.length > 0 ? filtered : images
  }, [images, selectedColor])

  // Tamanhos disponíveis para a cor selecionada
  const availableSizes = useMemo(() => {
    const sizes = variants
      .filter(v => !selectedColor || v.color === selectedColor)
      .map(v => v.size)
      .filter(Boolean) as string[]
    return [...new Set(sizes)].sort(
      (a, b) => SIZES_ORDER.indexOf(a) - SIZES_ORDER.indexOf(b)
    )
  }, [variants, selectedColor])

  const selectedVariant = variants.find(v => {
    const matchColor = !selectedColor || v.color === selectedColor
    const matchSize  = !selectedSize  || v.size  === selectedSize
    return matchColor && matchSize
  })

  const isSizeAvailable = (size: string) =>
    variants.some(v =>
      v.size === size &&
      (!selectedColor || v.color === selectedColor) &&
      v.stock_quantity > 0
    )

  const isColorAvailable = (color: string) =>
    variants.some(v =>
      v.color === color &&
      (!selectedSize || v.size === selectedSize) &&
      v.stock_quantity > 0
    )

  const handleColorSelect = (color: string) => {
    setSelectedColor(prev => prev === color ? null : color)
    setActiveImage(0)
    setSelectedSize(null)
  }

  const handleAddToCart = async () => {
    if (availableColors.length > 0 && !selectedColor) {
      toast.error('Selecione uma cor.')
      return
    }
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error('Selecione um tamanho.')
      return
    }
    if (!selectedVariant) {
      toast.error('Variante não disponível.')
      return
    }
    if (selectedVariant.stock_quantity === 0) {
      toast.error('Produto esgotado.')
      return
    }
    setAdding(true)
    try {
      await addItem(selectedVariant.id, 1)
      toast.success('Produto adicionado ao carrinho!')
    } catch {
      toast.error('Erro ao adicionar. Tente novamente.')
    } finally {
      setAdding(false)
    }
  }

  const currentImage = colorImages[activeImage] ?? colorImages[0]
  const currentPrice = selectedVariant?.final_price ?? product.sale_price ?? product.price

  const isSelectedColorSoldOut = selectedColor
    ? variants.filter(v => v.color === selectedColor).every(v => v.stock_quantity === 0)
    : product.total_stock === 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

      {/* ─── Galeria de Imagens ─────────────────────────────────────────── */}
      <div className="flex flex-col-reverse md:flex-row gap-3">

        {/* Miniaturas laterais */}
        {colorImages.length > 1 && (
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto hide-scrollbar md:max-h-[600px]">
            {colorImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={clsx(
                  'shrink-0 relative overflow-hidden border-2 transition-all duration-200 bg-cream-100',
                  'w-[76px] h-[96px]',
                  i === activeImage
                    ? 'border-wine-900'
                    : 'border-transparent hover:border-gray-300'
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text ?? product.name}
                  fill
                  className="object-contain object-center"
                  sizes="76px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Imagem principal com zoom no hover */}
        <div className="relative flex-1 aspect-[3/4] bg-cream-100 overflow-hidden group/img">
          {currentImage ? (
            <Image
              src={currentImage.url}
              alt={product.name}
              fill
              priority
              quality={95}
              className={clsx(
                'object-contain object-center transition-transform duration-700 ease-out group-hover/img:scale-110',
                isSelectedColorSoldOut && 'grayscale opacity-60'
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingBag size={64} />
            </div>
          )}

          {isSelectedColorSoldOut && (
            <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center z-10">
              <span className="bg-gray-700/80 text-white text-sm font-bold px-5 py-2 rounded-full uppercase tracking-widest">
                Esgotado
              </span>
            </div>
          )}

          {!isSelectedColorSoldOut && product.is_on_sale && product.discount_percentage && (
            <div className="absolute top-4 left-4 z-10">
              <span className="badge badge-sale text-sm">-{product.discount_percentage}%</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Informações do Produto ─────────────────────────────────────── */}
      <div className="flex flex-col">
        <p className="font-sans text-xs text-gray-400 uppercase tracking-widest mb-2">
          {product.category?.name}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 font-normal leading-snug mb-4">
          {product.name}
        </h1>

        {/* Preço */}
        <div className="flex items-baseline gap-3 mb-2">
          <span className="font-serif text-3xl text-wine-900 font-semibold">
            {formatPrice(currentPrice)}
          </span>
          {product.is_on_sale && (
            <span className="font-sans text-base text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Seletor de Cor */}
        {availableColors.length > 0 && (
          <div className="mb-5">
            <p className="font-sans text-sm font-medium text-gray-700 mb-2.5">
              Cor:{' '}
              <span className="text-wine-900 font-semibold">
                {selectedColor ?? 'Selecione'}
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              {availableColors.map(v => {
                const hex = colorHex(v.color, v.color_hex)
                const isSelected = selectedColor === v.color
                const isAvail   = isColorAvailable(v.color!)
                return (
                  <button
                    key={v.color}
                    onClick={() => handleColorSelect(v.color!)}
                    disabled={!isAvail}
                    title={isAvail ? (v.color ?? '') : `${v.color} — Esgotado`}
                    className={clsx(
                      'w-9 h-9 rounded-full transition-all duration-200 relative overflow-hidden',
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-wine-900 scale-110'
                        : 'ring-1 ring-gray-300 hover:ring-gray-500',
                      !isAvail && 'opacity-40 cursor-not-allowed'
                    )}
                    style={{ backgroundColor: hex }}
                    aria-label={v.color ?? 'Cor'}
                  >
                    {!isAvail && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="block w-full h-px bg-gray-500/70 rotate-45" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Seletor de Tamanho */}
        {availableSizes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <p className="font-sans text-sm font-medium text-gray-700">
                Tamanho:{' '}
                <span className="text-wine-900 font-semibold">
                  {selectedSize ?? 'Selecione'}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                  disabled={!isSizeAvailable(size)}
                  className={clsx(
                    'min-w-[48px] h-10 px-3 font-sans text-sm font-medium transition-all duration-200',
                    selectedSize === size
                      ? 'bg-wine-900 text-cream-100 border border-wine-900'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-wine-900 hover:text-wine-900',
                    !isSizeAvailable(size) && 'opacity-30 cursor-not-allowed line-through'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Estoque baixo */}
        {selectedVariant?.is_low_stock && (
          <p className="text-amber-600 text-sm font-sans mb-4 flex items-center gap-1.5">
            ⚡ Apenas {selectedVariant.stock_quantity} unidade(s) restante(s)!
          </p>
        )}

        {/* Botão Adicionar ao Carrinho */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleAddToCart}
            disabled={adding || (!!selectedVariant && selectedVariant.is_out_of_stock)}
            className="btn-primary flex-1 py-4 text-base"
          >
            <ShoppingBag size={18} />
            {adding ? 'Adicionando...' :
             selectedVariant?.is_out_of_stock ? 'Esgotado' :
             'Adicionar ao Carrinho'}
          </button>
          <button
            onClick={() => setLiked(!liked)}
            className={clsx(
              'p-4 border transition-all duration-200',
              liked
                ? 'border-wine-900 bg-wine-900 text-cream-100'
                : 'border-gray-300 text-gray-600 hover:border-wine-900 hover:text-wine-900'
            )}
          >
            <Heart size={18} className={liked ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Garantias */}
        <div className="grid grid-cols-3 gap-3 py-5 border-t border-b border-gray-100 mb-6">
          {[
            { Icon: Truck,     label: 'Entrega em Brasília e DF' },
            { Icon: RotateCcw, label: 'Troca em até 7 dias' },
            { Icon: Shield,    label: 'Compra 100% segura' },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-center">
              <Icon size={18} className="text-wine-900" />
              <span className="font-sans text-[10px] text-gray-500 leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Descrição Expansível */}
        <div className="border border-gray-100">
          <button
            onClick={() => setDescOpen(!descOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-cream-100 transition-colors"
          >
            <span className="font-serif text-gray-800 font-medium">Descrição do Produto</span>
            {descOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {descOpen && (
            <div className="px-4 pb-4 pt-1">
              <p className="font-sans text-sm text-gray-600 leading-relaxed">
                {product.description ?? product.short_description ?? 'Sem descrição disponível.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
