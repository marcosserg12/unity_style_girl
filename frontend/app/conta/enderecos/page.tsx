import { MapPin } from 'lucide-react'

export default function EnderecosPage() {
  return (
    <div className="bg-white shadow-card p-10 flex flex-col items-center justify-center text-center min-h-[320px]">
      <div className="w-16 h-16 bg-cream-100 flex items-center justify-center mb-5">
        <MapPin size={28} className="text-wine-900/40" />
      </div>
      <p className="font-script text-wine-900 text-2xl mb-1">em breve</p>
      <h2 className="font-serif text-xl text-gray-700 font-light mb-3">Gerenciamento de Endereços</h2>
      <p className="font-sans text-sm text-gray-400 max-w-xs leading-relaxed">
        Em breve você poderá cadastrar e gerenciar seus endereços de entrega por aqui.
      </p>
    </div>
  )
}
