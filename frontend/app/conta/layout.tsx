import Link      from 'next/link'
import { User, Package, MapPin, Lock, LogOut } from 'lucide-react'

const NAV = [
  { href: '/conta',          label: 'Minha Conta',   Icon: User    },
  { href: '/conta/pedidos',  label: 'Pedidos',        Icon: Package },
  { href: '/conta/enderecos', label: 'Endereços',    Icon: MapPin  },
  { href: '/conta/senha',    label: 'Alterar Senha',  Icon: Lock    },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="font-script text-wine-900 text-2xl">minha</p>
        <h1 className="font-serif text-3xl text-gray-800 font-light -mt-1">Conta</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <nav className="md:col-span-1">
          <ul className="bg-white shadow-card">
            {NAV.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-5 py-4 font-sans text-sm text-gray-600 hover:text-wine-900 hover:bg-cream-100 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <button className="flex items-center gap-3 w-full px-5 py-4 font-sans text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={16} />
                Sair
              </button>
            </li>
          </ul>
        </nav>

        {/* Conteúdo */}
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  )
}
