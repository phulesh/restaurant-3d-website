export interface BusinessInfo {
  name: string
  tagline: string
  phoneDisplay: string
  phoneHref: string
  email: string
  addressLines: string[]
  addressShort: string
  rating: number
  reviewCount: number
  mapsUrl: string
  mapsEmbed: string
  mapsDirections: string
}

export const BUSINESS: BusinessInfo = {
  name: 'Samrat Electronics',
  tagline: 'Delivering Comfort with Precision & Performance.',
  phoneDisplay: '+91 79998 10119',
  phoneHref: 'tel:+917999810119',
  email: 'samratpr@gmail.com',
  addressLines: [
    'Shop No. C-4, Sharda Chowk, RDA Bldg,',
    'Raipur, Chhattisgarh 492001, India',
  ],
  addressShort: 'Sharda Chowk, Raipur, Chhattisgarh 492001',
  rating: 4.0,
  reviewCount: 39,
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sharda+Chowk%2C+Raipur%2C+Chhattisgarh+492001',
  mapsEmbed: 'https://www.google.com/maps?q=Sharda+Chowk,+Raipur,+Chhattisgarh+492001&z=15&output=embed',
  mapsDirections: 'https://www.google.com/maps/dir/?api=1&destination=Sharda+Chowk%2C+Raipur%2C+Chhattisgarh+492001',
}

export interface NavLink {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Brands', href: '#brands' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Projects', href: '#projects' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

export const BRAND_COLORS: Record<string, string> = {
  'Mitsubishi Electric': 'from-sky-400/30 via-cyan-500/20 to-transparent',
  Voltas: 'from-amber-400/30 via-orange-500/20 to-transparent',
  'Blue Star': 'from-blue-500/30 via-indigo-500/20 to-transparent',
  Daikin: 'from-emerald-400/30 via-teal-500/20 to-transparent',
  'O General': 'from-rose-400/30 via-red-500/20 to-transparent',
  LG: 'from-violet-400/30 via-purple-500/20 to-transparent',
}
