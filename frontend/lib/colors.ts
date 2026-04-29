export const PRESET_COLORS = [
  { name: 'Preto',    hex: '#1a1a1a' },
  { name: 'Branco',   hex: '#f5f5f0' },
  { name: 'Bege',     hex: '#d4b896' },
  { name: 'Vinho',    hex: '#7B0D1E' },
  { name: 'Marsala',  hex: '#964F4C' },
  { name: 'Rosa',     hex: '#e8a5b4' },
  { name: 'Azul',     hex: '#5b7fa6' },
  { name: 'Marinho',  hex: '#1a2f4a' },
  { name: 'Verde',    hex: '#4a7c59' },
  { name: 'Vermelho', hex: '#c0392b' },
  { name: 'Cinza',    hex: '#8e8e8e' },
  { name: 'Caramelo', hex: '#c68642' },
  { name: 'Lilás',    hex: '#b39ddb' },
  { name: 'Único',    hex: '#d4b896' },
]

/** Retorna o hex de uma cor: prioriza o valor salvo no banco, cai para lookup por nome, cai para fallback. */
export function colorHex(name: string | null | undefined, stored?: string | null): string {
  // Sanitize stored value — ignore null strings and the known wrong default '#cccccc'
  const hex = (stored && stored !== 'null' && stored !== 'undefined' && stored.trim() !== '#cccccc')
    ? stored.trim()
    : null
  if (hex && hex.startsWith('#')) return hex
  
  if (!name || name === 'null' || name === 'undefined') return '#cccccc'
  
  const cleanName = name.trim()
  return PRESET_COLORS.find(c => c.name.toLowerCase() === cleanName.toLowerCase())?.hex ?? '#cccccc'
}
