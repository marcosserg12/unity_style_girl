'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { api, apiUpload } from '@/lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import {
  Plus, Pencil, Trash2, X, Check, Upload, Gift,
  Image as ImageIcon, Tag, Ruler, Palette, LayoutTemplate,
} from 'lucide-react'

// ──── Tipos ───────────────────────────────────────────────────────────────────

interface BannerItem {
  id:            number
  title:         string
  subtitle:      string | null
  cta_text:      string | null
  cta_link:      string | null
  desktop_url:   string
  mobile_url:    string | null
  display_order: number
  is_active:     boolean
  desktop_image: string
  mobile_image:  string | null
  show_badge:    boolean
  badge_label:   string | null
  badge_text:    string | null
  badge_subtext: string | null
  disclaimer:    string | null
  text_position: 'left' | 'right'
  eyebrow_text:  string | null
}

interface CategoryItem {
  id:             number
  name:           string
  slug:           string
  description:    string | null
  image_url:      string | null
  display_order:  number
  is_active:      boolean
  products_count: number
}

interface SizeItem  { id: number; name: string; display_order: number }
interface ColorItem { id: number; name: string; hex: string; display_order: number }

interface MenuSettings {
  mega_menu_image:    string | null
  mega_menu_caption1: string
  mega_menu_caption2: string
}

// ──── Helper: seletor de imagem ───────────────────────────────────────────────

function ImageField({
  label, hint, currentUrl, file, onChange, onClearFile, onClearExisting,
}: {
  label: string; hint: string
  currentUrl?: string | null; file: File | null
  onChange: (f: File) => void
  onClearFile?: () => void       // limpa o arquivo selecionado (ainda não salvo)
  onClearExisting?: () => void   // remove a imagem já salva do servidor
}) {
  const ref     = useRef<HTMLInputElement>(null)
  const preview = file ? URL.createObjectURL(file) : currentUrl

  return (
    <div>
      <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="flex items-start gap-4">
        <div className="relative w-28 h-16 bg-gray-100 rounded border border-gray-200 overflow-visible shrink-0">
          <div className="w-full h-full overflow-hidden rounded">
            {preview ? (
              <Image src={preview} alt={label} fill className="object-cover" sizes="112px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageIcon size={22} />
              </div>
            )}
          </div>
          {/* X para limpar arquivo novo selecionado */}
          {file && onClearFile && (
            <button
              type="button"
              onClick={() => { onClearFile(); if (ref.current) ref.current.value = '' }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-10 transition-colors"
              title="Remover imagem selecionada"
            >
              <X size={10} />
            </button>
          )}
          {/* X para remover imagem já salva (sem novo arquivo) */}
          {!file && currentUrl && onClearExisting && (
            <button
              type="button"
              onClick={onClearExisting}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-10 transition-colors"
              title="Remover imagem salva"
            >
              <X size={10} />
            </button>
          )}
        </div>
        <div className="flex-1">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 hover:border-wine-900 text-gray-500 hover:text-wine-900 text-xs font-sans font-bold uppercase tracking-wider transition-colors"
          >
            <Upload size={13} /> {file ? 'Trocar imagem' : 'Escolher imagem'}
          </button>
          <p className="text-[10px] text-gray-400 mt-1.5 font-sans">{hint}</p>
          {file && <p className="text-[10px] text-green-600 mt-0.5 font-sans truncate max-w-[200px]">{file.name}</p>}
          <input
            ref={ref} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && onChange(e.target.files[0])}
          />
        </div>
      </div>
    </div>
  )
}

// ──── Pré-visualização fiel ao HeroBanner ─────────────────────────────────────

function SlidePreview({
  src, title, subtitle, ctaText, disclaimer, textPosition, eyebrowText,
  showBadge, badgeLabel, badgeText, badgeSubtext,
}: {
  src: string; title: string; subtitle: string; ctaText: string; disclaimer: string
  textPosition: 'left' | 'right'; eyebrowText: string
  showBadge: boolean; badgeLabel: string; badgeText: string; badgeSubtext: string
}) {
  // wine-950 = #5c0b17 = rgb(92,11,23) — igual ao Tailwind config
  const W = '92,11,23'
  const isRight = textPosition === 'right'
  const gradient = isRight
    ? `linear-gradient(to left, rgba(${W},0.93) 0%, rgba(${W},0.62) 50%, rgba(${W},0.18) 100%)`
    : `linear-gradient(to right, rgba(${W},0.93) 0%, rgba(${W},0.62) 50%, rgba(${W},0.18) 100%)`

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
        <span className="font-sans text-[10px] text-gray-400 uppercase tracking-wider font-bold">Pré-visualização</span>
        <span className="font-sans text-[9px] text-gray-400">Idêntico ao site real</span>
      </div>
      <div
        className="relative w-full overflow-hidden"
        style={{ height: 340, background: '#5c0b17' }}
      >
        {/* Imagem de fundo — opacity 0.55 igual ao HeroBanner */}
        <Image src={src} alt="preview" fill className="object-cover object-center" style={{ opacity: 0.55 }} sizes="100vw" />

        {/* Gradientes idênticos ao HeroBanner.tsx */}
        <div className="absolute inset-0" style={{ background: gradient }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(${W},0.65) 0%, transparent 60%)` }} />

        {/* Badge */}
        {showBadge && (badgeText || badgeLabel) && (
          <div className="absolute top-4 right-4 border px-3 py-2 max-w-[180px] text-right" style={{ background: 'rgba(90,5,20,0.92)', borderColor: 'rgba(212,175,55,0.35)', backdropFilter: 'blur(4px)' }}>
            {badgeLabel && (
              <div className="flex items-center justify-end gap-1 mb-1">
                <Gift size={9} style={{ color: '#d4af37' }} />
                <span className="font-sans font-bold uppercase" style={{ fontSize: 8, letterSpacing: '0.25em', color: '#d4af37' }}>{badgeLabel}</span>
              </div>
            )}
            {badgeText && <p className="font-serif font-light leading-tight" style={{ fontSize: 12, color: '#f5f0e8' }}>{badgeText}</p>}
            {badgeSubtext && <p className="font-sans mt-0.5" style={{ fontSize: 9, color: 'rgba(245,240,232,0.6)' }}>{badgeSubtext}</p>}
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="absolute inset-0 flex items-center px-10" style={{ justifyContent: isRight ? 'flex-end' : 'flex-start' }}>
          <div className="max-w-lg">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block h-px w-6" style={{ background: '#d4af37' }} />
              <span className="font-sans font-bold uppercase" style={{ fontSize: 9, letterSpacing: '0.35em', color: '#d4af37' }}>{eyebrowText || 'Unity Girl Style'}</span>
            </div>

            {/* Título */}
            <h2 className="font-serif font-light leading-tight mb-3" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', color: '#f5f0e8' }}>
              {title || <span style={{ opacity: 0.35 }}>Título do slide</span>}
            </h2>

            {/* Linha dourada */}
            <div className="mb-4" style={{ height: 1, width: 60, background: 'rgba(212,175,55,0.6)' }} />

            {/* Subtítulo */}
            {subtitle && (
              <p className="font-sans mb-5 leading-relaxed" style={{ fontSize: 13, color: 'rgba(245,240,232,0.90)', maxWidth: 380 }}>{subtitle}</p>
            )}

            {/* Botões */}
            <div className="flex items-center gap-4 flex-wrap mb-2">
              {ctaText ? (
                <span className="font-sans font-bold uppercase px-5 py-2" style={{ fontSize: 11, letterSpacing: '0.15em', background: '#7B0D1E', color: '#f5f0e8', border: '1px solid rgba(212,175,55,0.3)' }}>{ctaText}</span>
              ) : null}
              <span className="font-sans font-semibold uppercase flex items-center gap-2" style={{ fontSize: 10, letterSpacing: '0.25em', color: 'rgba(245,240,232,0.5)' }}>
                <span style={{ display: 'inline-block', width: 16, height: 1, background: 'rgba(245,240,232,0.35)' }} />
                Ver catálogo
              </span>
            </div>

            {/* Disclaimer */}
            {disclaimer && (
              <p className="font-sans italic" style={{ fontSize: 9, color: 'rgba(245,240,232,0.38)', marginTop: 8 }}>{disclaimer}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ──── Aba: Slideshow ──────────────────────────────────────────────────────────

function SlideshowTab() {
  const [banners,  setBanners]  = useState<BannerItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<BannerItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving,   setSaving]   = useState(false)

  // Campos do formulário
  const [title,        setTitle]        = useState('')
  const [subtitle,     setSubtitle]     = useState('')
  const [ctaText,      setCtaText]      = useState('')
  const [ctaLink,      setCtaLink]      = useState('')
  const [isActive,     setIsActive]     = useState(true)
  const [displayOrder, setDisplayOrder] = useState(0)
  const [desktopFile,  setDesktopFile]  = useState<File | null>(null)
  const [mobileFile,   setMobileFile]   = useState<File | null>(null)
  const [clearMobile,  setClearMobile]  = useState(false)
  // Posição e eyebrow
  const [textPosition, setTextPosition] = useState<'left' | 'right'>('left')
  const [eyebrowText,  setEyebrowText]  = useState('')
  // Badge
  const [showBadge,   setShowBadge]   = useState(false)
  const [badgeLabel,  setBadgeLabel]  = useState('')
  const [badgeText,   setBadgeText]   = useState('')
  const [badgeSubtext,setBadgeSubtext]= useState('')
  // Rodapé
  const [disclaimer, setDisclaimer] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { const { data } = await api.get('/admin/banners'); setBanners(data) }
    catch { toast.error('Erro ao carregar slides.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function resetForm(b?: BannerItem) {
    setTitle(b?.title ?? '')
    setSubtitle(b?.subtitle ?? '')
    setCtaText(b?.cta_text ?? '')
    setCtaLink(b?.cta_link ?? '')
    setIsActive(b?.is_active ?? true)
    setDisplayOrder(b?.display_order ?? banners.length)
    setDesktopFile(null); setMobileFile(null); setClearMobile(false)
    setTextPosition(b?.text_position ?? 'left')
    setEyebrowText(b?.eyebrow_text ?? '')
    setShowBadge(b?.show_badge ?? false)
    setBadgeLabel(b?.badge_label ?? '')
    setBadgeText(b?.badge_text ?? '')
    setBadgeSubtext(b?.badge_subtext ?? '')
    setDisclaimer(b?.disclaimer ?? '')
  }

  function openEdit(b: BannerItem)  { setEditing(b); setCreating(false); resetForm(b) }
  function openCreate()             { setEditing(null); setCreating(true); resetForm() }
  function closeForm()              { setEditing(null); setCreating(false) }

  function buildFd() {
    const fd = new FormData()
    fd.append('title',         title)
    fd.append('subtitle',      subtitle)
    fd.append('cta_text',      ctaText)
    fd.append('cta_link',      ctaLink)
    fd.append('is_active',     isActive   ? '1' : '0')
    fd.append('show_badge',    showBadge  ? '1' : '0')
    fd.append('display_order', String(displayOrder))
    fd.append('text_position', textPosition)
    fd.append('eyebrow_text',  eyebrowText)
    fd.append('badge_label',   badgeLabel)
    fd.append('badge_text',    badgeText)
    fd.append('badge_subtext', badgeSubtext)
    fd.append('disclaimer',    disclaimer)
    if (desktopFile) fd.append('desktop_image', desktopFile)
    if (mobileFile)  fd.append('mobile_image',  mobileFile)
    else if (clearMobile) fd.append('clear_mobile', '1')
    return fd
  }

  async function save() {
    if (!title.trim()) { toast.error('Título é obrigatório.'); return }
    if (creating && !desktopFile) { toast.error('Imagem desktop é obrigatória.'); return }
    setSaving(true)
    try {
      if (creating) {
        await apiUpload('/admin/banners', buildFd())
        toast.success('Slide criado!')
      } else {
        await apiUpload(`/admin/banners/${editing!.id}`, buildFd())
        toast.success('Slide atualizado!')
      }
      closeForm(); load()
    } catch (err: any) {
      const errs: Record<string, string[]> = err?.response?.data?.errors ?? {}
      const msgs = Object.entries(errs).map(([field, messages]) => {
        const label: Record<string, string> = {
          desktop_image: 'Imagem desktop',
          mobile_image:  'Imagem mobile',
          title:         'Título',
        }
        const fieldLabel = label[field] ?? field
        const msg = Array.isArray(messages) ? messages[0] : messages
        if (String(msg).includes('max')) return `${fieldLabel}: arquivo muito grande (máx. 10 MB)`
        if (String(msg).includes('image')) return `${fieldLabel}: deve ser uma imagem (JPG, PNG, WebP)`
        if (String(msg).includes('required')) return `${fieldLabel} é obrigatório`
        return `${fieldLabel}: ${msg}`
      })
      toast.error(msgs.length ? msgs[0] : 'Erro ao salvar slide.')
    }
    finally { setSaving(false) }
  }

  async function remove(b: BannerItem) {
    if (!confirm(`Remover o slide "${b.title}"?`)) return
    try { await api.delete(`/admin/banners/${b.id}`); toast.success('Slide removido.'); load() }
    catch { toast.error('Erro ao remover slide.') }
  }

  async function toggleActive(b: BannerItem) {
    const fd = new FormData()
    fd.append('title',         b.title)
    fd.append('subtitle',      b.subtitle ?? '')
    fd.append('cta_text',      b.cta_text ?? '')
    fd.append('cta_link',      b.cta_link ?? '')
    fd.append('is_active',     b.is_active ? '0' : '1')
    fd.append('show_badge',    b.show_badge ? '1' : '0')
    fd.append('display_order', String(b.display_order))
    fd.append('text_position', b.text_position ?? 'left')
    fd.append('eyebrow_text',  b.eyebrow_text ?? '')
    fd.append('badge_label',   b.badge_label ?? '')
    fd.append('badge_text',    b.badge_text ?? '')
    fd.append('badge_subtext', b.badge_subtext ?? '')
    fd.append('disclaimer',    b.disclaimer ?? '')
    try { await apiUpload(`/admin/banners/${b.id}`, fd); load() }
    catch { toast.error('Erro ao atualizar.') }
  }

  const showForm   = creating || editing !== null
  const previewSrc = desktopFile ? URL.createObjectURL(desktopFile) : (editing?.desktop_url ?? null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-serif text-lg text-gray-800 font-medium">Slides do Hero</h3>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Desktop: <strong>1920 × 900 px</strong> · Mobile: <strong>768 × 600 px</strong> (opcional)
          </p>
        </div>
        {!showForm && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-wine-900 text-white font-sans font-bold text-xs tracking-wider uppercase hover:bg-wine-800 transition-colors">
            <Plus size={14} /> Novo Slide
          </button>
        )}
      </div>

      {/* Lista de slides */}
      {loading ? (
        <p className="text-gray-400 text-center py-10">Carregando...</p>
      ) : banners.length === 0 && !showForm ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <LayoutTemplate size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-sans text-sm">Nenhum slide cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {banners.map(b => (
            <div key={b.id} className={clsx('bg-white border rounded-xl flex items-center gap-4 p-4 transition-all', editing?.id === b.id ? 'border-wine-900 ring-1 ring-wine-900/20' : 'border-gray-100')}>
              <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden shrink-0 relative">
                <Image src={b.desktop_url} alt={b.title} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{b.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {b.show_badge && <span className="text-[9px] text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-wider">Badge</span>}
                  {b.disclaimer && <span className="text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-wider">Rodapé</span>}
                  {b.subtitle && <p className="text-xs text-gray-400 truncate">{b.subtitle}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(b)}
                  className={clsx('px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full', b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}
                >
                  {b.is_active ? 'Ativo' : 'Inativo'}
                </button>
                <button onClick={() => openEdit(b)} className="p-2 text-gray-400 hover:text-wine-900 hover:bg-gray-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                <button onClick={() => remove(b)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-medium text-gray-800">
              {creating ? 'Novo Slide' : `Editar: ${editing!.title}`}
            </h4>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
          </div>

          {/* Textos principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Título *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900 transition-colors" placeholder="Ex: Nova Coleção" />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                Texto acima do título <span className="normal-case text-gray-400">(dourado pequeno)</span>
              </label>
              <input value={eyebrowText} onChange={e => setEyebrowText(e.target.value)} className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900 transition-colors" placeholder="Unity Girl Style" />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Posição do texto</label>
              <div className="flex gap-2">
                {(['left', 'right'] as const).map(pos => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setTextPosition(pos)}
                    className={clsx(
                      'flex-1 py-2.5 text-xs font-sans font-bold uppercase tracking-wider border transition-colors',
                      textPosition === pos
                        ? 'bg-wine-900 text-white border-wine-900'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-wine-900 hover:text-wine-900',
                    )}
                  >
                    {pos === 'left' ? '← Esquerda' : 'Direita →'}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Subtítulo</label>
              <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2} className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900 transition-colors resize-none" placeholder="Texto abaixo do título..." />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Texto do Botão</label>
              <input value={ctaText} onChange={e => setCtaText(e.target.value)} className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900 transition-colors" placeholder="Ex: Conhecer Peças" />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Link do Botão</label>
              <input value={ctaLink} onChange={e => setCtaLink(e.target.value)} className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900 transition-colors" placeholder="/produtos" />
            </div>
          </div>

          {/* Texto de rodapé */}
          <div>
            <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">
              Texto de Rodapé <span className="normal-case text-gray-400">(abaixo dos botões, opcional)</span>
            </label>
            <input
              value={disclaimer}
              onChange={e => setDisclaimer(e.target.value)}
              className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900 transition-colors"
              placeholder="*Promoção válida por tempo limitado ou enquanto durarem os brindes."
            />
          </div>

          {/* Badge lateral */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-4 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans text-xs font-bold text-gray-700 uppercase tracking-wider">Badge (canto superior direito)</p>
                <p className="font-sans text-[10px] text-gray-400 mt-0.5">Caixa de destaque com ícone de presente</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={showBadge} onChange={e => setShowBadge(e.target.checked)} className="accent-wine-900 w-4 h-4" />
                <span className="font-sans text-xs text-gray-600">Exibir badge</span>
              </label>
            </div>
            {showBadge && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1">Rótulo (dourado)</label>
                  <input value={badgeLabel} onChange={e => setBadgeLabel(e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-wine-900 bg-white" placeholder="LANÇAMENTO" />
                </div>
                <div>
                  <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1">Texto principal</label>
                  <input value={badgeText} onChange={e => setBadgeText(e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-wine-900 bg-white" placeholder="Ganhe uma bolsa exclusiva" />
                </div>
                <div>
                  <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1">Texto secundário</label>
                  <input value={badgeSubtext} onChange={e => setBadgeSubtext(e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-wine-900 bg-white" placeholder="nas 3 primeiras compras acima de R$299,99" />
                </div>
              </div>
            )}
          </div>

          {/* Imagens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ImageField
              label={`Imagem Desktop${creating ? ' *' : ''}`}
              hint="Recomendado: 1920 × 900 px · JPG/WebP · máx. 4 MB"
              currentUrl={editing?.desktop_url}
              file={desktopFile}
              onChange={f => { setDesktopFile(f) }}
              onClearFile={() => setDesktopFile(null)}
            />
            <ImageField
              label="Imagem Mobile (opcional)"
              hint="Recomendado: 768 × 600 px · JPG/WebP · máx. 2 MB"
              currentUrl={clearMobile ? null : editing?.mobile_url}
              file={mobileFile}
              onChange={f => { setMobileFile(f); setClearMobile(false) }}
              onClearFile={() => setMobileFile(null)}
              onClearExisting={() => { setClearMobile(true) }}
            />
          </div>

          {/* Opções */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-sans text-gray-700 select-none">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-wine-900 w-4 h-4" />
              Slide ativo
            </label>
            <div className="flex items-center gap-2">
              <label className="font-sans text-xs text-gray-500 uppercase tracking-wider">Ordem:</label>
              <input type="number" min={0} value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} className="w-16 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-wine-900" />
            </div>
          </div>

          {/* Pré-visualização fiel ao site */}
          {previewSrc && (
            <SlidePreview
              src={previewSrc}
              title={title}
              subtitle={subtitle}
              ctaText={ctaText}
              disclaimer={disclaimer}
              textPosition={textPosition}
              eyebrowText={eyebrowText}
              showBadge={showBadge}
              badgeLabel={badgeLabel}
              badgeText={badgeText}
              badgeSubtext={badgeSubtext}
            />
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={closeForm} className="px-4 py-2 font-sans text-sm text-gray-500 hover:text-gray-800 transition-colors">Cancelar</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-wine-900 text-white font-sans font-bold text-xs tracking-wider uppercase hover:bg-wine-800 transition-colors disabled:opacity-50">
              {saving ? 'Salvando...' : <><Check size={14} /> Salvar</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ──── Aba: Menu de Categorias ─────────────────────────────────────────────────

function MenuTab() {
  const [cfg,       setCfg]       = useState<MenuSettings>({ mega_menu_image: null, mega_menu_caption1: 'explore', mega_menu_caption2: 'Nova Coleção 2025' })
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setCfg(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    try {
      const fd = new FormData()
      if (imageFile) fd.append('mega_menu_image', imageFile)
      fd.append('mega_menu_caption1', cfg.mega_menu_caption1)
      fd.append('mega_menu_caption2', cfg.mega_menu_caption2)
      await apiUpload('/admin/settings', fd)
      toast.success('Configurações salvas!')
      const { data } = await api.get('/admin/settings')
      setCfg(data); setImageFile(null)
    } catch { toast.error('Erro ao salvar.') }
    finally { setSaving(false) }
  }

  const previewSrc = imageFile ? URL.createObjectURL(imageFile) : cfg.mega_menu_image

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg text-gray-800 font-medium">Menu de Categorias</h3>
        <p className="text-xs text-gray-400 font-sans mt-0.5">Imagem e texto do dropdown "Roupas por Categoria" no topo da página.</p>
      </div>

      {loading ? <p className="text-gray-400 font-sans text-sm py-8 text-center">Carregando...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-5">
            <ImageField
              label="Imagem do Menu"
              hint="Recomendado: 400 × 500 px · JPG/WebP · máx. 2 MB"
              currentUrl={cfg.mega_menu_image}
              file={imageFile}
              onChange={setImageFile}
              onClearFile={() => setImageFile(null)}
            />
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Legenda linha 1 (cursiva)</label>
              <input
                value={cfg.mega_menu_caption1}
                onChange={e => setCfg(s => ({ ...s, mega_menu_caption1: e.target.value }))}
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900 transition-colors"
                placeholder="explore"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Legenda linha 2</label>
              <input
                value={cfg.mega_menu_caption2}
                onChange={e => setCfg(s => ({ ...s, mega_menu_caption2: e.target.value }))}
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900 transition-colors"
                placeholder="Nova Coleção 2025"
              />
            </div>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-wine-900 text-white font-sans font-bold text-xs tracking-wider uppercase hover:bg-wine-800 transition-colors disabled:opacity-50">
              {saving ? 'Salvando...' : <><Check size={14} /> Salvar</>}
            </button>
          </div>

          {/* Mini preview */}
          <div>
            <p className="font-sans text-xs text-gray-500 uppercase tracking-wider mb-3">Pré-visualização</p>
            <div className="border border-gray-200 shadow-lg bg-white flex overflow-hidden rounded-lg" style={{ height: 260 }}>
              <div className="w-40 p-4 border-r border-gray-100 shrink-0">
                <p className="font-sans text-[8px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-3">Categorias</p>
                {['Blusas', 'Body', 'Calças', 'Conjuntos'].map(c => (
                  <div key={c} className="py-1.5 border-b border-gray-50 font-sans text-xs text-gray-700">{c}</div>
                ))}
              </div>
              <div className="flex-1 relative bg-gray-100 overflow-hidden">
                {previewSrc ? (
                  <Image src={previewSrc} alt="Preview" fill className="object-cover object-top" sizes="200px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={32} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-script text-white text-base leading-none">{cfg.mega_menu_caption1 || 'explore'}</p>
                  <p className="font-serif text-white text-xs font-light tracking-wider">{cfg.mega_menu_caption2 || 'Nova Coleção 2025'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ──── Aba: Categorias ─────────────────────────────────────────────────────────

function CategoriasTab() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading,    setLoading]    = useState(true)
  const [editing,    setEditing]    = useState<CategoryItem | null>(null)
  const [creating,   setCreating]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [imageFile,  setImageFile]  = useState<File | null>(null)

  const [name,         setName]         = useState('')
  const [slug,         setSlug]         = useState('')
  const [description,  setDescription]  = useState('')
  const [isActive,     setIsActive]     = useState(true)
  const [displayOrder, setDisplayOrder] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try { const { data } = await api.get('/admin/categories'); setCategories(data) }
    catch { toast.error('Erro ao carregar categorias.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openEdit(c: CategoryItem) {
    setEditing(c); setCreating(false)
    setName(c.name); setSlug(c.slug); setDescription(c.description ?? '')
    setIsActive(c.is_active); setDisplayOrder(c.display_order); setImageFile(null)
  }

  function openCreate() {
    setEditing(null); setCreating(true)
    setName(''); setSlug(''); setDescription('')
    setIsActive(true); setDisplayOrder(categories.length); setImageFile(null)
  }

  function closeForm() { setEditing(null); setCreating(false) }

  async function save() {
    if (!name.trim()) { toast.error('Nome é obrigatório.'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      if (slug.trim()) fd.append('slug', slug)
      fd.append('description', description)
      fd.append('is_active', isActive ? '1' : '0')
      fd.append('display_order', String(displayOrder))
      if (imageFile) fd.append('image', imageFile)

      if (creating) {
        await apiUpload('/admin/categories', fd)
        toast.success('Categoria criada!')
      } else {
        await apiUpload(`/admin/categories/${editing!.id}`, fd)
        toast.success('Categoria atualizada!')
      }
      closeForm(); load()
    } catch { toast.error('Erro ao salvar categoria.') }
    finally { setSaving(false) }
  }

  async function remove(c: CategoryItem) {
    if (!confirm(`Remover a categoria "${c.name}"?`)) return
    try { await api.delete(`/admin/categories/${c.id}`); toast.success('Categoria removida.'); load() }
    catch { toast.error('Erro ao remover categoria.') }
  }

  const showForm   = creating || editing !== null
  const previewSrc = imageFile ? URL.createObjectURL(imageFile) : (editing?.image_url ?? null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-serif text-lg text-gray-800 font-medium">Categorias</h3>
          <p className="text-xs text-gray-400 font-sans mt-0.5">Imagem recomendada: <strong>400 × 500 px</strong></p>
        </div>
        {!showForm && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-wine-900 text-white font-sans font-bold text-xs tracking-wider uppercase hover:bg-wine-800 transition-colors">
            <Plus size={14} /> Nova Categoria
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-10">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {categories.length === 0 && !showForm && (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <Tag size={36} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-sans text-sm">Nenhuma categoria cadastrada.</p>
            </div>
          )}
          {categories.map(c => (
            <div key={c.id} className={clsx('bg-white border rounded-xl flex items-center gap-4 p-4', editing?.id === c.id ? 'border-wine-900 ring-1 ring-wine-900/20' : 'border-gray-100')}>
              <div className="w-10 h-12 bg-gray-100 rounded overflow-hidden shrink-0 relative">
                {c.image_url ? (
                  <Image src={c.image_url} alt={c.name} fill className="object-cover" sizes="40px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><Tag size={14} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">/{c.slug} · {c.products_count ?? 0} produtos</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={clsx('px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full', c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {c.is_active ? 'Ativa' : 'Inativa'}
                </span>
                <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-wine-900 hover:bg-gray-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                <button onClick={() => remove(c)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-base font-medium text-gray-800">{creating ? 'Nova Categoria' : `Editar: ${editing!.name}`}</h4>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Nome *</label>
              <input
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  if (creating) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                }}
                className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900"
                placeholder="Ex: Blusas"
              />
            </div>
            <div>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Slug (URL)</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900" placeholder="blusas" />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900 resize-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ImageField
              label="Imagem da Categoria"
              hint="Recomendado: 400 × 500 px · JPG/WebP · máx. 2 MB"
              currentUrl={editing?.image_url}
              file={imageFile}
              onChange={setImageFile}
              onClearFile={() => setImageFile(null)}
            />
            {previewSrc && (
              <div>
                <p className="font-sans text-xs text-gray-500 uppercase tracking-wider mb-2">Pré-visualização</p>
                <div className="w-24 h-32 relative rounded overflow-hidden bg-gray-100 border border-gray-200">
                  <Image src={previewSrc} alt="Preview" fill className="object-cover" sizes="96px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="font-sans text-white text-[10px] font-bold truncate">{name || 'Categoria'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-sans text-gray-700 select-none">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-wine-900 w-4 h-4" />
              Categoria ativa
            </label>
            <div className="flex items-center gap-2">
              <label className="font-sans text-xs text-gray-500 uppercase tracking-wider">Ordem:</label>
              <input type="number" min={0} value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} className="w-16 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-wine-900" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={closeForm} className="px-4 py-2 font-sans text-sm text-gray-500 hover:text-gray-800">Cancelar</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-wine-900 text-white font-sans font-bold text-xs tracking-wider uppercase hover:bg-wine-800 disabled:opacity-50">
              {saving ? 'Salvando...' : <><Check size={14} /> Salvar</>}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ──── Aba: Tamanhos ───────────────────────────────────────────────────────────

function TamanhosTab() {
  const [sizes,     setSizes]     = useState<SizeItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [newName,   setNewName]   = useState('')
  const [adding,    setAdding]    = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName,  setEditName]  = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { const { data } = await api.get('/admin/sizes'); setSizes(data) }
    catch { toast.error('Erro ao carregar tamanhos.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function add() {
    if (!newName.trim()) return
    setAdding(true)
    try { await api.post('/admin/sizes', { name: newName.trim(), display_order: sizes.length }); setNewName(''); load() }
    catch { toast.error('Erro ao adicionar tamanho.') }
    finally { setAdding(false) }
  }

  async function update(id: number) {
    if (!editName.trim()) return
    try { await api.put(`/admin/sizes/${id}`, { name: editName.trim() }); setEditingId(null); load() }
    catch { toast.error('Erro ao atualizar tamanho.') }
  }

  async function remove(id: number, name: string) {
    if (!confirm(`Remover o tamanho "${name}"?`)) return
    try { await api.delete(`/admin/sizes/${id}`); load() }
    catch { toast.error('Erro ao remover tamanho.') }
  }

  return (
    <div className="space-y-6 max-w-sm">
      <div>
        <h3 className="font-serif text-lg text-gray-800 font-medium">Tamanhos</h3>
        <p className="text-xs text-gray-400 font-sans mt-0.5">Opções disponíveis nos produtos.</p>
      </div>

      <div className="flex gap-2">
        <input
          value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="PP, P, M, G, GG..."
          className="flex-1 border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-wine-900"
        />
        <button onClick={add} disabled={adding || !newName.trim()} className="flex items-center gap-2 px-4 py-2.5 bg-wine-900 text-white font-sans font-bold text-xs tracking-wider uppercase hover:bg-wine-800 disabled:opacity-50">
          <Plus size={14} /> Add
        </button>
      </div>

      {loading ? <p className="text-gray-400 text-sm font-sans">Carregando...</p> : sizes.length === 0 ? (
        <p className="text-gray-400 text-sm font-sans text-center py-6">Nenhum tamanho cadastrado.</p>
      ) : (
        <div className="space-y-1.5">
          {sizes.map(s => (
            <div key={s.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
              {editingId === s.id ? (
                <>
                  <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter') update(s.id); if (e.key === 'Escape') setEditingId(null) }} className="flex-1 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-wine-900" />
                  <button onClick={() => update(s.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded"><X size={14} /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-bold text-gray-800 font-sans">{s.name}</span>
                  <button onClick={() => { setEditingId(s.id); setEditName(s.name) }} className="p-1.5 text-gray-400 hover:text-wine-900 hover:bg-gray-50 rounded"><Pencil size={14} /></button>
                  <button onClick={() => remove(s.id, s.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ──── Aba: Cores ──────────────────────────────────────────────────────────────

function CoresTab() {
  const [colors,    setColors]    = useState<ColorItem[]>([])
  const [loading,   setLoading]   = useState(true)
  const [newName,   setNewName]   = useState('')
  const [newHex,    setNewHex]    = useState('#7B0D1E')
  const [adding,    setAdding]    = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName,  setEditName]  = useState('')
  const [editHex,   setEditHex]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { const { data } = await api.get('/admin/colors'); setColors(data) }
    catch { toast.error('Erro ao carregar cores.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function add() {
    if (!newName.trim()) return
    setAdding(true)
    try { await api.post('/admin/colors', { name: newName.trim(), hex: newHex, display_order: colors.length }); setNewName(''); load() }
    catch { toast.error('Erro ao adicionar cor.') }
    finally { setAdding(false) }
  }

  async function update(id: number) {
    if (!editName.trim()) return
    try { await api.put(`/admin/colors/${id}`, { name: editName.trim(), hex: editHex }); setEditingId(null); load() }
    catch { toast.error('Erro ao atualizar cor.') }
  }

  async function remove(id: number, name: string) {
    if (!confirm(`Remover a cor "${name}"?`)) return
    try { await api.delete(`/admin/colors/${id}`); load() }
    catch { toast.error('Erro ao remover cor.') }
  }

  return (
    <div className="space-y-6 max-w-sm">
      <div>
        <h3 className="font-serif text-lg text-gray-800 font-medium">Cores</h3>
        <p className="text-xs text-gray-400 font-sans mt-0.5">Opções de cor disponíveis nos produtos.</p>
      </div>

      <div className="flex gap-2">
        <div className="flex items-center gap-2 flex-1 border border-gray-200 px-3 py-2">
          <input type="color" value={newHex} onChange={e => setNewHex(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Nome da cor (ex: Preto)" className="flex-1 text-sm focus:outline-none bg-transparent" />
        </div>
        <button onClick={add} disabled={adding || !newName.trim()} className="flex items-center gap-2 px-4 py-2.5 bg-wine-900 text-white font-sans font-bold text-xs tracking-wider uppercase hover:bg-wine-800 disabled:opacity-50">
          <Plus size={14} /> Add
        </button>
      </div>

      {loading ? <p className="text-gray-400 text-sm font-sans">Carregando...</p> : colors.length === 0 ? (
        <p className="text-gray-400 text-sm font-sans text-center py-6">Nenhuma cor cadastrada.</p>
      ) : (
        <div className="space-y-1.5">
          {colors.map(c => (
            <div key={c.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
              {editingId === c.id ? (
                <>
                  <input type="color" value={editHex} onChange={e => setEditHex(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0" />
                  <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter') update(c.id); if (e.key === 'Escape') setEditingId(null) }} className="flex-1 border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-wine-900" />
                  <button onClick={() => update(c.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded"><X size={14} /></button>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full border border-gray-200 shrink-0" style={{ backgroundColor: c.hex }} />
                  <span className="flex-1 text-sm font-bold text-gray-800 font-sans">{c.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{c.hex}</span>
                  <button onClick={() => { setEditingId(c.id); setEditName(c.name); setEditHex(c.hex) }} className="p-1.5 text-gray-400 hover:text-wine-900 hover:bg-gray-50 rounded"><Pencil size={14} /></button>
                  <button onClick={() => remove(c.id, c.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ──── Abas ────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'slideshow',  label: 'Slideshow',          icon: LayoutTemplate },
  { id: 'menu',       label: 'Menu de Categorias', icon: ImageIcon      },
  { id: 'categorias', label: 'Categorias',          icon: Tag            },
  { id: 'tamanhos',   label: 'Tamanhos',            icon: Ruler          },
  { id: 'cores',      label: 'Cores',               icon: Palette        },
]

// ──── Página principal ────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [tab, setTab] = useState('slideshow')

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="font-serif text-2xl text-gray-800 font-medium">Configurações</h2>
        <p className="text-gray-500 text-sm mt-1">Personalize o visual e conteúdo da loja.</p>
      </div>

      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all',
              tab === t.id ? 'bg-white text-wine-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'slideshow'  && <SlideshowTab />}
        {tab === 'menu'       && <MenuTab />}
        {tab === 'categorias' && <CategoriasTab />}
        {tab === 'tamanhos'   && <TamanhosTab />}
        {tab === 'cores'      && <CoresTab />}
      </div>
    </div>
  )
}
