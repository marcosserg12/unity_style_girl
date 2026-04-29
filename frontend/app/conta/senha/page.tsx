'use client'

import { useState } from 'react'
import { Lock, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'

export default function AlterarSenhaPage() {
  const [form, setForm]     = useState({ current_password: '', password: '', password_confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors]   = useState<Record<string, string>>({})

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await api.post('/auth/change-password', form)
      setSuccess(true)
      setForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err: any) {
      const data = err?.response?.data
      if (data?.errors) {
        const mapped: Record<string, string> = {}
        for (const [k, v] of Object.entries(data.errors)) {
          mapped[k] = (v as string[])[0]
        }
        setErrors(mapped)
      } else {
        setErrors({ general: data?.message ?? 'Erro ao alterar senha.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-cream-200 flex items-center justify-center">
          <Lock size={16} className="text-wine-900" />
        </div>
        <h2 className="font-serif text-xl text-gray-800 font-light">Alterar Senha</h2>
      </div>

      {success ? (
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-14 h-14 bg-cream-100 flex items-center justify-center mb-4">
            <CheckCircle size={28} className="text-wine-900" />
          </div>
          <p className="font-serif text-lg text-gray-800 font-light mb-1">Senha alterada!</p>
          <p className="font-sans text-sm text-gray-500">Sua senha foi atualizada com sucesso.</p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-6 font-sans text-xs text-wine-900 underline hover:no-underline"
          >
            Alterar novamente
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          {errors.general && (
            <p className="font-sans text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2">
              {errors.general}
            </p>
          )}

          <div>
            <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">
              Senha Atual
            </label>
            <input
              type="password"
              required
              value={form.current_password}
              onChange={set('current_password')}
              className="w-full border border-gray-200 px-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-wine-900 transition-colors bg-white"
              placeholder="••••••••"
            />
            {errors.current_password && (
              <p className="font-sans text-xs text-red-600 mt-1">{errors.current_password}</p>
            )}
          </div>

          <div>
            <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">
              Nova Senha
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={set('password')}
              className="w-full border border-gray-200 px-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-wine-900 transition-colors bg-white"
              placeholder="Mínimo 8 caracteres"
            />
            {errors.password && (
              <p className="font-sans text-xs text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block font-sans text-xs text-gray-500 uppercase tracking-wider mb-1.5">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              required
              value={form.password_confirmation}
              onChange={set('password_confirmation')}
              className="w-full border border-gray-200 px-4 py-3 font-sans text-sm text-gray-800 focus:outline-none focus:border-wine-900 transition-colors bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wine-900 hover:bg-wine-800 text-cream-100 font-sans font-bold text-xs tracking-widest uppercase py-3.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-cream-100/30 border-t-cream-100 rounded-full animate-spin" />
            ) : (
              <><Lock size={13} /> Salvar nova senha</>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
