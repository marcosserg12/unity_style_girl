'use client'

import { useState }     from 'react'
import Link             from 'next/link'
import { useRouter }    from 'next/navigation'
import { useForm }      from 'react-hook-form'
import { zodResolver }  from '@hookform/resolvers/zod'
import { z }            from 'zod'
import toast            from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight }  from 'lucide-react'
import { authApi }      from '@/lib/api'
import { motion }       from 'framer-motion'

const loginSchema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    try {
      const { data: res } = await authApi.login(data.email, data.password)
      localStorage.setItem('ug_token', res.token)
      localStorage.setItem('ug_user',  JSON.stringify(res.user))
      window.dispatchEvent(new Event('storage'))
      toast.success(`Bem-vinda de volta!`)
      
      if (res.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/conta')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-20 bg-[#fffaf8] relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-wine-900/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-wine-900/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[450px] relative z-10"
      >
        {/* Card de Login */}
        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-script text-wine-900 text-5xl block mb-2"
              >
                Unity Girl Style
              </motion.span>
              <h1 className="font-serif text-xl text-gray-400 tracking-widest uppercase text-[10px] md:text-xs">
                Acesse sua conta
              </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-[10px] font-sans font-semibold text-gray-400 mb-2 uppercase tracking-widest">E-mail corporativo</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-wine-900/10 transition-all font-sans text-sm outline-none"
                  placeholder="exemplo@email.com"
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-400 text-[10px] mt-1.5 font-medium ml-1">{errors.email.message}</p>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-widest">Sua senha</label>
                  <Link href="/esqueci-minha-senha" className="text-[10px] font-sans text-wine-900/60 hover:text-wine-900 transition-colors uppercase tracking-widest font-semibold">
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-wine-900/10 transition-all font-sans text-sm outline-none pr-12"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-wine-900 transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-[10px] mt-1.5 font-medium ml-1">{errors.password.message}</p>}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                type="submit"
                disabled={loading}
                className="w-full bg-wine-900 hover:bg-wine-950 text-white py-5 rounded-xl font-sans text-sm font-semibold tracking-widest uppercase transition-all shadow-lg shadow-wine-900/20 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Entrar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-10 pt-8 border-t border-gray-50 text-center"
            >
              <p className="font-sans text-xs text-gray-400 tracking-wide">
                Novo por aqui?{' '}
                <Link href="/cadastro" className="text-wine-900 font-bold hover:underline ml-1">
                  CRIAR CONTA
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Rodapé do Login */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-[10px] text-gray-400 uppercase tracking-[0.3em] hover:text-wine-900 transition-colors font-semibold">
            ← Voltar para a loja
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
