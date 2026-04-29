import type { Metadata } from 'next'
import { Cormorant_Garamond, Great_Vibes, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import ShellWrapper from '@/components/layout/ShellWrapper'
import QueryProvider from '@/components/providers/QueryProvider'
import ScrollReveal from '@/components/ui/ScrollReveal'

// ─── Fontes da marca carregadas com next/font ─────────────────────────────
const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  style:    ['normal', 'italic'],
  variable: '--font-serif',
  display:  'swap',
})

const greatVibes = Great_Vibes({
  subsets:  ['latin'],
  weight:   ['400'],
  variable: '--font-script',
  display:  'swap',
})

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-sans',
  display:  'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://unitygirl.com.br'),
  title: {
    default:  'Unity Girl Style — Elegância em cada detalhe',
    template: '%s | Unity Girl Style',
  },
  description: 'Moda feminina com elegância e estilo. Vestidos, blusas, calças e muito mais. Frete grátis acima de R$ 199.',
  keywords: ['moda feminina', 'roupas femininas', 'unity girl', 'vestidos', 'blusas', 'elegância'],
  openGraph: {
    type:     'website',
    locale:   'pt_BR',
    siteName: 'Unity Girl Style',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${greatVibes.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-dvh" suppressHydrationWarning>
        <QueryProvider>
          <ShellWrapper>
            {children}
          </ShellWrapper>
          <ScrollReveal />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background:  '#7b0d1e',
                color:       '#f5f0e8',
                fontFamily:  'var(--font-sans)',
                fontSize:    '14px',
                borderRadius:'0',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
