"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Eye, EyeOff, Sparkles } from "lucide-react"
import { authApi } from "@/lib/api"
import { motion } from "framer-motion"

const schema = z.object({
  name:             z.string().min(3, "Nome muito curto"),
  email:            z.string().email("E-mail inválido"),
  phone:            z.string().optional(),
  password:         z.string().min(8, "Mínimo 8 caracteres"),
  password_confirmation: z.string(),
  terms:            z.boolean().refine(v => v, "Aceite os termos"),
}).refine(d => d.password === d.password_confirmation, {
  message: "Senhas não coincidem",
  path: ["password_confirmation"],
})

type FormData = z.infer<typeof schema>

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
}

export default function CadastroPage() {
  const [showPass,  setShowPass]  = useState(false)
  const [showPass2, setShowPass2] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { data: res } = await authApi.register({ name: data.name, email: data.email, password: data.password, password_confirmation: data.password_confirmation, phone: data.phone })
      localStorage.setItem("ug_token", res.token)
      toast.success(`Bem-vinda, ${res.user.name.split(" ")[0]}!`)
      router.push("/conta")
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Erro ao criar conta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex">
      {/* Painel esquerdo — visual */}
      <div className="hidden lg:flex lg:w-2/5 bg-wine-950 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Padrão decorativo */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute border border-cream-100/30 rounded-full" style={{ width: `${(i+1)*12}%`, height: `${(i+1)*12}%`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
          ))}
        </div>
        {/* Partículas */}
        {[{ top:"15%",left:"10%",delay:0 }, { top:"60%",left:"8%",delay:1.5 }, { top:"80%",left:"20%",delay:0.8 }, { top:"25%",right:"10%",delay:0.3 }, { top:"70%",right:"8%",delay:2 }].map((p,i) => (
          <motion.div key={i} className="absolute" style={p as any} animate={{ y:[0,-12,-4,0], opacity:[0.2,0.6,0.3,0.2] }} transition={{ duration:6+i, repeat:Infinity, ease:"easeInOut" }}>
            <Sparkles size={12+i*2} className="text-gold-400" style={{ filter:"drop-shadow(0 0 6px rgba(212,175,55,0.8))" }} />
          </motion.div>
        ))}
        <div className="relative z-10 text-center">
          <p className="font-script text-cream-100/40 text-5xl mb-4">Unity Girl</p>
          <h2 className="font-serif text-cream-100 text-3xl font-light mb-6 leading-snug">
            Faça parte da<br />nossa comunidade
          </h2>
          <div className="w-12 h-px bg-gold-400/60 mx-auto mb-6" />
          <p className="font-sans text-cream-100/50 text-sm leading-relaxed max-w-xs">
            Crie sua conta e tenha acesso a ofertas exclusivas, histórico de pedidos e muito mais.
          </p>
          <div className="mt-10 space-y-3">
            {["Ofertas exclusivas para membros","Rastreamento de pedidos em tempo real","Wishlist personalizada","Atendimento prioritário"].map((b, i) => (
              <div key={i} className="flex items-center gap-3 text-left">
                <div className="w-1.5 h-1.5 bg-gold-400 rounded-full shrink-0" />
                <span className="font-sans text-xs text-cream-100/60">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-cream-200">
        <div className="w-full max-w-md">
          <motion.div initial="hidden" animate="visible" className="text-center mb-10">
            <motion.div variants={fadeUp} custom={0}>
              <span className="font-script text-wine-900 text-4xl block mb-1">Unity Girl</span>
              <h1 className="font-serif text-2xl text-gray-700 font-light">Criar sua conta</h1>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="bg-white shadow-card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
                <label className="block text-xs font-sans font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Nome completo</label>
                <input {...register("name")} className="input-elegant" placeholder="Seu nome completo" autoComplete="name" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </motion.div>

              <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible">
                <label className="block text-xs font-sans font-medium text-gray-600 mb-1.5 uppercase tracking-wider">E-mail</label>
                <input {...register("email")} type="email" className="input-elegant" placeholder="seu@email.com" autoComplete="email" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </motion.div>

              <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible">
                <label className="block text-xs font-sans font-medium text-gray-600 mb-1.5 uppercase tracking-wider">WhatsApp <span className="text-gray-400 normal-case">(opcional)</span></label>
                <input {...register("phone")} type="tel" className="input-elegant" placeholder="(00) 00000-0000" autoComplete="tel" />
              </motion.div>

              <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible">
                <label className="block text-xs font-sans font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <input {...register("password")} type={showPass ? "text" : "password"} className="input-elegant pr-10" placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </motion.div>

              <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible">
                <label className="block text-xs font-sans font-medium text-gray-600 mb-1.5 uppercase tracking-wider">Confirmar senha</label>
                <div className="relative">
                  <input {...register("password_confirmation")} type={showPass2 ? "text" : "password"} className="input-elegant pr-10" placeholder="Repita a senha" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass2(!showPass2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation.message}</p>}
              </motion.div>

              <motion.div variants={fadeUp} custom={6} initial="hidden" animate="visible">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input {...register("terms")} type="checkbox" className="mt-0.5 accent-wine-900" />
                  <span className="font-sans text-xs text-gray-500 leading-relaxed">
                    Concordo com os{" "}
                    <Link href="/termos" className="text-wine-900 hover:underline">Termos de Uso</Link>
                    {" "}e{" "}
                    <Link href="/privacidade" className="text-wine-900 hover:underline">Política de Privacidade</Link>
                  </span>
                </label>
                {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms.message}</p>}
              </motion.div>

              <motion.div variants={fadeUp} custom={7} initial="hidden" animate="visible">
                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base justify-center mt-2">
                  {loading ? "Criando conta..." : "Criar conta grátis"}
                </button>
              </motion.div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="font-sans text-sm text-gray-500">
                Já tem conta?{" "}
                <Link href="/login" className="text-wine-900 font-medium hover:underline">Entrar</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

