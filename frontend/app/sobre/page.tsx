import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star, Users, Leaf } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a história da Unity Girl Style — moda feminina com elegância e personalidade.',
}

const values = [
  { icon: Heart,  title: 'Autenticidade',  desc: 'Cada peça é escolhida para refletir a essência de quem a usa. Acreditamos que a moda deve ser sua.' },
  { icon: Star,   title: 'Qualidade',      desc: 'Trabalhamos apenas com tecidos e acabamentos que passam pelo nosso rigoroso critério de qualidade.' },
  { icon: Users,  title: 'Comunidade',     desc: 'Somos mais que uma loja. Somos uma comunidade de mulheres que se apoiam e se inspiram.' },
  { icon: Leaf,   title: 'Consciência',    desc: 'Buscamos fornecedores responsáveis e embalagens sustentáveis, cuidando do planeta e de você.' },
]

export default function SobrePage() {
  return (
    <>
      {/* Hero */}
      <div className="relative bg-wine-950 text-cream-100 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80"
            alt="Unity Girl Style"
            fill
            className="object-cover object-center"
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <p className="font-script text-gold-400 text-3xl mb-2">nossa história</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">Sobre Nós</h1>
          <div className="flex items-center gap-3 justify-center">
            <span className="flex-1 max-w-12 h-px bg-cream-100/30" />
            <span className="font-sans text-[9px] text-cream-100/50 tracking-[0.28em] uppercase">Unity Girl Style</span>
            <span className="flex-1 max-w-12 h-px bg-cream-100/30" />
          </div>
        </div>
      </div>

      {/* História */}
      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <p className="font-script text-wine-900 text-2xl mb-2">quem somos</p>
            <h2 className="font-serif text-2xl md:text-3xl text-gray-800 font-light mb-5">Nascemos do amor pela moda feminina</h2>
            <div className="space-y-4 font-sans text-sm text-gray-500 leading-relaxed">
              <p>
                A Unity Girl Style nasceu em Brasília — DF, do sonho de oferecer moda feminina com personalidade, qualidade e preço justo. Somos uma equipe apaixonada por estilo e acreditamos que toda mulher merece se sentir única e poderosa.
              </p>
              <p>
                Nossa curadoria é feita com cuidado: blusas, bodies, calças e conjuntos pensados para o dia a dia, para o trabalho e para os momentos especiais. Peças que combinam entre si e que valorizam cada tipo de corpo.
              </p>
              <p>
                Desde o início, a nossa missão é clara: fazer você se apaixonar pelo que veste e se sentir confiante em qualquer situação.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80"
              alt="Unity Girl Style"
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine-950/30 to-transparent" />
          </div>
        </div>

        {/* Números */}
        <div className="grid grid-cols-2 gap-4 mb-16 max-w-sm mx-auto">
          {[
            { number: '4',  label: 'Categorias exclusivas' },
            { number: '7d', label: 'Troca sem complicação' },
          ].map(({ number, label }) => (
            <div key={label} className="bg-cream-100 p-6 text-center border border-cream-300">
              <p className="font-script text-wine-900 text-4xl mb-1">{number}</p>
              <p className="font-sans text-xs text-gray-500 tracking-wider uppercase">{label}</p>
            </div>
          ))}
        </div>

        {/* Valores */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="font-script text-wine-900 text-2xl mb-1">o que nos guia</p>
            <h2 className="font-serif text-2xl text-gray-800 font-light">Nossos Valores</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-cream-200 flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-wine-900" />
                </div>
                <h3 className="font-serif text-gray-800 text-base mb-2">{title}</h3>
                <p className="font-sans text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-wine-900 text-cream-100 p-10 text-center">
          <p className="font-script text-gold-400 text-2xl mb-2">faça parte</p>
          <p className="font-serif text-xl font-light mb-2">Junte-se à comunidade Unity Girl</p>
          <p className="font-sans text-sm text-cream-100/60 mb-6">Siga-nos no Instagram e seja a primeira a saber das novidades, promoções e lançamentos.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://instagram.com/useunitygirl"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold-400 text-wine-950 font-sans font-bold text-xs tracking-widest uppercase px-6 py-3 hover:bg-gold-300 transition-colors"
            >
              @useunitygirl no Instagram
            </a>
            <Link
              href="/produtos"
              className="border border-cream-100/30 text-cream-100 font-sans font-bold text-xs tracking-widest uppercase px-6 py-3 hover:bg-cream-100/10 transition-colors"
            >
              Ver Coleção
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
