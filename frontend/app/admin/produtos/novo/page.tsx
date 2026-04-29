'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, X, CheckCircle2, UploadCloud, Copy } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { api, apiUpload } from '@/lib/api'
import { colorHex } from '@/lib/colors'
import toast from 'react-hot-toast'

function slugify(text: string) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
}

interface VariantRow {
  color:          string
  color_hex:      string
  size:           string
  stock_quantity: number
}

interface ColorImageGroup {
  color:     string
  color_hex: string
  files:     File[]
  previews:  string[]
}

interface DbSize { id: number; name: string }
interface DbColor { id: number; name: string; hex: string }

export default function NewProductPage() {
  const router = useRouter()
  const [loading,    setLoading]    = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [dbSizes,    setDbSizes]    = useState<DbSize[]>([])
  const [dbColors,   setDbColors]   = useState<DbColor[]>([])

  const [formData, setFormData] = useState({
    name:              '',
    category_id:       '',
    short_description: '',
    description:       '',
    price:             '',
    sale_price:        '',
    is_featured:       false,
    is_new_arrival:    false,
    is_active:         true,
  })

  const [variants, setVariants] = useState<VariantRow[]>([
    { color: 'Único', color_hex: '#cccccc', size: 'Único', stock_quantity: 10 },
  ])

  const [colorGroups, setColorGroups] = useState<ColorImageGroup[]>([
    { color: 'Único', color_hex: '#cccccc', files: [], previews: [] },
  ])

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, sizeRes, colorRes] = await Promise.all([
          api.get('/categories'),
          api.get('/admin/sizes'),
          api.get('/admin/colors')
        ])
        setCategories(catRes.data)
        setDbSizes(sizeRes.data)
        setDbColors(colorRes.data)

        // Se houver cores/tamanhos no banco, inicializa com eles
        if (colorRes.data.length > 0 && sizeRes.data.length > 0) {
          const firstColor = colorRes.data[0]
          const firstSize  = sizeRes.data[0]
          
          setVariants([{ 
            color: firstColor.name, 
            color_hex: firstColor.hex, 
            size: firstSize.name, 
            stock_quantity: 10 
          }])
          
          setColorGroups([{ 
            color: firstColor.name, 
            color_hex: firstColor.hex, 
            files: [], 
            previews: [] 
          }])
        }
      } catch (err) {
        toast.error('Erro ao carregar dados auxiliares.')
      }
    }
    loadData()
  }, [])

  // Unique colors from variants
  const uniqueColors = useMemo(() => {
    const seen = new Set<string>()
    return variants
      .filter(v => v.color)
      .filter(v => { if (seen.has(v.color)) return false; seen.add(v.color); return true })
      .map(v => ({ color: v.color, color_hex: v.color_hex }))
  }, [variants])

  // Sync colorGroups when variant colors change
  useEffect(() => {
    setColorGroups(prev =>
      uniqueColors.map(uc => {
        const existing = prev.find(g => g.color === uc.color)
        return existing
          ? { ...existing, color_hex: uc.color_hex }
          : { color: uc.color, color_hex: uc.color_hex, files: [], previews: [] }
      })
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(uniqueColors)])

  // Duplicate detection: set of "color|size" keys that appear more than once
  const duplicateKeys = useMemo(() => {
    const counts: Record<string, number> = {}
    variants.forEach(v => {
      const k = `${v.color}|${v.size}`
      counts[k] = (counts[k] ?? 0) + 1
    })
    return new Set(Object.entries(counts).filter(([, c]) => c > 1).map(([k]) => k))
  }, [variants])

  // ── Variant helpers ────────────────────────────────────────────────────────
  const addVariant = () => {
    const firstColor = dbColors[0] || { name: 'Único', hex: '#cccccc' }
    const firstSize  = dbSizes[0]  || { name: 'PP' }
    setVariants(prev => [...prev, { color: firstColor.name, color_hex: firstColor.hex, size: firstSize.name, stock_quantity: 0 }])
  }

  const duplicateVariant = (i: number) => {
    const src = variants[i]
    // Pick next available size for that color
    const usedSizes = variants.filter(v => v.color === src.color).map(v => v.size)
    const nextSize  = dbSizes.find(s => !usedSizes.includes(s.name))?.name ?? (dbSizes[0]?.name || 'PP')
    const copy: VariantRow = { ...src, size: nextSize }
    setVariants(prev => [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)])
  }

  const removeVariant = (i: number) => {
    if (variants.length === 1) return
    setVariants(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateVariant = (i: number, field: keyof VariantRow, value: any) =>
    setVariants(prev => { const n = [...prev]; (n[i] as any)[field] = value; return n })

  const setVariantColor = (i: number, colorName: string) => {
    const found = dbColors.find(c => c.name === colorName)
    setVariants(prev => {
      const n = [...prev]
      n[i] = { ...n[i], color: colorName, color_hex: found?.hex ?? n[i].color_hex }
      return n
    })
  }

  // ── Image group helpers ────────────────────────────────────────────────────
  const addImages = (gi: number, files: File[]) =>
    setColorGroups(prev => prev.map((g, i) => i !== gi ? g : {
      ...g,
      files:    [...g.files, ...files],
      previews: [...g.previews, ...files.map(f => URL.createObjectURL(f))],
    }))

  const removeImage = (gi: number, ii: number) =>
    setColorGroups(prev => prev.map((g, i) => i !== gi ? g : {
      ...g,
      files:    g.files.filter((_, j) => j !== ii),
      previews: g.previews.filter((_, j) => j !== ii),
    }))

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (duplicateKeys.size > 0) {
      toast.error('Existem variantes com a mesma cor e tamanho. Corrija antes de salvar.')
      return
    }

    const totalImages = colorGroups.reduce((s, g) => s + g.files.length, 0)
    if (totalImages === 0) { toast.error('Adicione pelo menos uma imagem.'); return }

    setLoading(true)
    const data = new FormData()
    Object.entries(formData).forEach(([k, v]) =>
      data.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
    )
    data.append('slug', slugify(formData.name) + '-' + Math.random().toString(36).slice(2, 6))

    variants.forEach((v, i) => {
      data.append(`variants[${i}][color]`,          v.color)
      data.append(`variants[${i}][color_hex]`,      v.color_hex)
      data.append(`variants[${i}][size]`,           v.size)
      data.append(`variants[${i}][stock_quantity]`, String(v.stock_quantity))
    })

    // Flatten images — first image per group = capa (primary_image_index = index of first image overall)
    let globalIdx = 0
    let primaryImageIndex = 0
    let firstGroupDone = false

    colorGroups.forEach((group, gi) => {
      const isFirstGroup = gi === 0
      group.files.forEach((file, ii) => {
        data.append('images[]', file)
        if (group.color) data.append(`image_colors[${globalIdx}]`, group.color)
        // First image of first color group = global primary
        if (isFirstGroup && ii === 0 && !firstGroupDone) {
          primaryImageIndex = globalIdx
          firstGroupDone = true
        }
        globalIdx++
      })
    })
    data.append('primary_image_index', String(primaryImageIndex))

    try {
      await apiUpload('/admin/products', data)
      toast.success('Produto criado com sucesso!')
      router.push('/admin/produtos')
    } catch (err: any) {
      const errors = err.response?.data?.errors
      if (errors) {
        toast.error((Object.values(errors)[0] as string[])[0])
      } else {
        toast.error(err.response?.data?.message || 'Erro ao criar produto.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/produtos" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div>
            <h2 className="font-serif text-2xl text-gray-800 font-medium">Novo Produto</h2>
            <p className="text-gray-500 text-sm">Preencha os detalhes para cadastrar na loja.</p>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="bg-wine-900 text-cream-100 px-8 py-3 rounded-lg font-sans text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-wine-800 transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? 'Salvando...' : <><Save size={18} /> Salvar Produto</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Esquerda ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Info básica */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-serif text-lg font-medium text-gray-800 border-b border-gray-50 pb-3">Informações Básicas</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nome do Produto</label>
              <input required type="text" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Calça Pantalona Alfaiataria"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-wine-900"
              />
              {formData.name && (
                <p className="text-[11px] text-gray-400">Slug: <code className="bg-gray-100 px-1 rounded">{slugify(formData.name)}</code></p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria</label>
                <select required value={formData.category_id}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-wine-900"
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preço Base (R$)</label>
                <input required type="number" step="0.01" value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="299.90"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-wine-900 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição Curta</label>
              <textarea rows={2} value={formData.short_description}
                onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="Uma frase rápida sobre o produto..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-wine-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição Completa</label>
              <textarea rows={5} value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes sobre tecido, caimento, cuidados..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-wine-900"
              />
            </div>
          </div>

          {/* Variantes */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h3 className="font-serif text-lg font-medium text-gray-800">Variantes e Estoque</h3>
              <button type="button" onClick={addVariant}
                className="text-wine-900 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Nova Cor
              </button>
            </div>

            {duplicateKeys.size > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-600 font-medium">
                ⚠ Existem variantes com a mesma cor e tamanho. Corrija antes de salvar.
              </div>
            )}

            <div className="space-y-2">
              {variants.map((v, i) => {
                const isDuplicate = duplicateKeys.has(`${v.color}|${v.size}`)
                return (
                  <div key={i} className={`grid grid-cols-12 gap-2 items-end p-3 rounded-lg border transition-colors ${
                    isDuplicate ? 'bg-red-50 border-red-200' : 'bg-gray-50/50 border-gray-100'
                  }`}>
                    {/* Cor */}
                    <div className="col-span-5 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Cor</label>
                      <div className="flex gap-1.5 items-center">
                        <div 
                          className="w-6 h-6 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: colorHex(v.color, v.color_hex) }} 
                        />
                        <select value={v.color} onChange={e => setVariantColor(i, e.target.value)}
                          className="flex-1 px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-wine-900 outline-none"
                        >
                          {dbColors.length > 0 ? (
                            dbColors.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                          ) : (
                            <option value={v.color}>{v.color}</option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Tamanho */}
                    <div className="col-span-3 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Tamanho</label>
                      <select value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)}
                        className={`w-full px-2 py-2 bg-white border rounded-lg text-sm focus:border-wine-900 outline-none ${
                          isDuplicate ? 'border-red-300' : 'border-gray-200'
                        }`}
                      >
                        {dbSizes.length > 0 ? (
                          dbSizes.map(s => <option key={s.id} value={s.name}>{s.name}</option>)
                        ) : (
                          <option value={v.size}>{v.size}</option>
                        )}
                      </select>
                    </div>

                    {/* Estoque */}
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Estoque</label>
                      <input type="number" value={v.stock_quantity}
                        onChange={e => updateVariant(i, 'stock_quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-wine-900 outline-none"
                      />
                    </div>

                    {/* Ações */}
                    <div className="col-span-2 pb-0.5 flex justify-end gap-1">
                      <button type="button" onClick={() => duplicateVariant(i)}
                        title="Duplicar (mesmo cor, outro tamanho)"
                        className="p-1.5 text-gray-400 hover:text-wine-900 transition-colors"
                      >
                        <Copy size={15} />
                      </button>
                      <button type="button" onClick={() => removeVariant(i)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] text-gray-400 italic">
              Use <strong>Duplicar</strong> (ícone cópia) para adicionar o mesmo produto em outro tamanho rapidamente.
            </p>
          </div>

          {/* Fotos por cor */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-50 pb-3">
              <h3 className="font-serif text-lg font-medium text-gray-800">Fotos por Cor</h3>
              <p className="text-xs text-gray-400 mt-1">
                A primeira foto de cada cor é automaticamente a capa daquela cor.
              </p>
            </div>

            {colorGroups.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Nenhuma cor definida. Adicione variantes acima.</p>
            )}

            {colorGroups.map((group, gi) => (
              <div key={group.color} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: group.color_hex }} />
                  <span className="font-sans text-sm font-bold text-gray-700">{group.color}</span>
                  <span className="text-xs text-gray-400">({group.files.length} foto{group.files.length !== 1 ? 's' : ''})</span>
                </div>

                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-wine-900/30 transition-all group">
                  <UploadCloud size={22} className="text-gray-300 group-hover:text-wine-900 transition-colors mb-1" />
                  <p className="text-xs text-gray-400 group-hover:text-gray-500">Adicionar fotos de {group.color}</p>
                  <input type="file" multiple className="hidden" accept="image/*"
                    onChange={e => {
                      const files = Array.from(e.target.files || [])
                      if (files.length) addImages(gi, files)
                      e.target.value = ''
                    }}
                  />
                </label>

                {group.previews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {group.previews.map((src, ii) => (
                      <div key={ii} className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 ${
                        ii === 0 ? 'border-wine-900 shadow-md' : 'border-transparent'
                      }`}>
                        <Image src={src} alt="" fill className="object-cover" />
                        <button type="button"
                          onClick={() => removeImage(gi, ii)}
                          className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <X size={10} />
                        </button>
                        {ii === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-wine-900 text-white text-[8px] font-bold uppercase text-center py-0.5">
                            Capa
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Direita ────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-serif text-lg font-medium text-gray-800 border-b border-gray-50 pb-3">Status e Promoção</h3>

            <div className="space-y-3">
              {[
                { key: 'is_active',      label: 'Produto Ativo',   color: 'text-green-500' },
                { key: 'is_featured',    label: 'Em Destaque',     color: 'text-yellow-500' },
                { key: 'is_new_arrival', label: 'Lançamento',      color: 'text-blue-500' },
              ].map(({ key, label, color }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className={(formData as any)[key] ? color : 'text-gray-300'} />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <input type="checkbox" checked={(formData as any)[key]}
                    onChange={e => setFormData({ ...formData, [key]: e.target.checked })}
                    className="w-5 h-5 accent-wine-900 cursor-pointer"
                  />
                </div>
              ))}

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preço Promocional (R$)</label>
                <input type="number" step="0.01" value={formData.sale_price}
                  onChange={e => setFormData({ ...formData, sale_price: e.target.value })}
                  placeholder="Deixe vazio se não houver"
                  className="w-full px-4 py-2.5 bg-green-50/50 border border-green-100 rounded-lg text-sm focus:outline-none focus:border-green-500 font-bold text-green-700"
                />
                <p className="text-[10px] text-gray-400 italic leading-tight">Ao preencher, o selo PROMOÇÃO é ativado automaticamente.</p>
              </div>
            </div>
          </div>

          {/* Resumo */}
          {variants.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-serif text-base font-medium text-gray-800 mb-3">Resumo de Variantes</h3>
              <div className="space-y-1.5">
                {variants.map((v, i) => {
                  const isDup = duplicateKeys.has(`${v.color}|${v.size}`)
                  return (
                    <div key={i} className={`flex items-center gap-2 text-xs ${isDup ? 'text-red-500' : 'text-gray-600'}`}>
                      <div className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                        style={{ backgroundColor: v.color_hex }} />
                      <span>{v.color} / {v.size}</span>
                      {isDup && <span className="text-red-400 ml-1">duplicado</span>}
                      <span className="ml-auto text-gray-400">{v.stock_quantity} un.</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
