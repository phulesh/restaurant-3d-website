export interface Service {
  title: string
  blurb: string
  icon: string
  gradient: string
}

export const SERVICES: Service[] = [
  {
    title: 'VRF Systems',
    blurb:
      'Multi-zone Variable Refrigerant Flow systems engineered for precise, energy-efficient comfort across large buildings.',
    icon: 'network',
    gradient: 'from-cyan-500/25 via-sky-500/10 to-transparent',
  },
  {
    title: 'Cassette AC',
    blurb:
      'Ceiling-mounted cassette units that blend into interiors while delivering powerful, even airflow.',
    icon: 'square',
    gradient: 'from-sky-500/25 via-blue-500/10 to-transparent',
  },
  {
    title: 'Ductable AC',
    blurb:
      'Concealed ducted systems for hotels, offices and showrooms — quiet, clean and completely hidden.',
    icon: 'fan',
    gradient: 'from-blue-500/25 via-indigo-500/10 to-transparent',
  },
  {
    title: 'Hi-Wall AC',
    blurb:
      'High-wall split air conditioners from India\u2019s most trusted brands, sized and installed to match every room.',
    icon: 'wall',
    gradient: 'from-teal-500/25 via-cyan-500/10 to-transparent',
  },
  {
    title: 'HVAC Design',
    blurb:
      'Load calculations, duct layouts and system selection by experienced engineers — before a single unit is ordered.',
    icon: 'design',
    gradient: 'from-indigo-500/25 via-violet-500/10 to-transparent',
  },
  {
    title: 'Product Supply',
    blurb:
      'Genuine indoor and outdoor units, VRF branch boxes and accessories supplied directly as authorized dealers.',
    icon: 'supply',
    gradient: 'from-violet-500/25 via-purple-500/10 to-transparent',
  },
  {
    title: 'Installation',
    blurb:
      'Certified installation teams following manufacturer standards for piping, refrigerant, drainage and electricals.',
    icon: 'install',
    gradient: 'from-sky-500/25 via-cyan-500/10 to-transparent',
  },
  {
    title: 'AMC',
    blurb:
      'Annual Maintenance Contracts with scheduled servicing, filters, coil cleaning and priority breakdown support.',
    icon: 'shield',
    gradient: 'from-cyan-500/25 via-teal-500/10 to-transparent',
  },
]

export interface Application {
  id: string
  title: string
  emoji: string
  description: string
  points: string[]
  gradient: string
  scene: string
}

export const APPLICATIONS: Application[] = [
  {
    id: 'hospitals',
    title: 'Hospitals',
    emoji: '🏥',
    description:
      'Controlled temperature, ventilation and air purity for ICUs, OT suites, wards and diagnostics — where comfort supports care.',
    points: ['VRF & cassette zoning', 'Ducted ventilation planning', 'Low-noise, hygiene-first installs'],
    gradient: 'from-rose-500/25 via-red-500/10 to-transparent',
    scene: 'hospital',
  },
  {
    id: 'commercial',
    title: 'Commercial',
    emoji: '🏢',
    description:
      'Offices, retail and hospitality spaces stay productive and welcoming with quiet, energy-efficient conditioning.',
    points: ['VRF multi-zone efficiency', 'Concealed ductable units', 'Zoned control & scheduling'],
    gradient: 'from-sky-500/25 via-blue-500/10 to-transparent',
    scene: 'commercial',
  },
  {
    id: 'residential',
    title: 'Residential',
    emoji: '🏠',
    description:
      'Homes, villas and apartments get whisper-quiet cooling matched to every room\u2019s size, sun and usage.',
    points: ['Hi-wall & cassette options', 'Smart, quiet compressors', 'Clean, room-matched installs'],
    gradient: 'from-emerald-500/25 via-teal-500/10 to-transparent',
    scene: 'residential',
  },
]

export interface ProcessStep {
  step: string
  title: string
  blurb: string
  icon: string
}

export const PROCESS: ProcessStep[] = [
  {
    step: '01',
    title: 'Design',
    blurb: 'Site survey, cooling load calculation and a system design that fits your space and budget.',
    icon: 'design',
  },
  {
    step: '02',
    title: 'Supply',
    blurb: 'Genuine units from authorized brands, sourced and delivered with complete documentation.',
    icon: 'supply',
  },
  {
    step: '03',
    title: 'Installation',
    blurb: 'Manufacturer-standard installation by trained technicians — piping, drainage, power and testing.',
    icon: 'install',
  },
  {
    step: '04',
    title: 'AMC',
    blurb: 'Scheduled servicing and priority support that keep your system performing year after year.',
    icon: 'shield',
  },
]

export interface GalleryImage {
  src: string
  alt: string
  caption: string
  span?: string
}

/** Client-provided showroom photographs. Replace/rename files in /public/photos to update. */
export const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: '/photos/showroom-1.jpg',
    alt: 'Samrat Electronics showroom display of split air conditioners',
    caption: 'Showroom – AC display wall',
    span: 'sm:col-span-2 sm:row-span-2',
  },
  {
    src: '/photos/showroom-2.jpg',
    alt: 'Ceiling cassette air conditioner display at Samrat Electronics',
    caption: 'Cassette AC display',
  },
  {
    src: '/photos/showroom-3.jpg',
    alt: 'VRF and ductable HVAC equipment on display at the Raipur showroom',
    caption: 'VRF & ductable range',
  },
  {
    src: '/photos/showroom-4.jpg',
    alt: 'Authorized brand indoor units at Samrat Electronics showroom',
    caption: 'Authorized brand range',
  },
  {
    src: '/photos/showroom-5.jpg',
    alt: 'Outdoor condenser units at the Samrat Electronics showroom',
    caption: 'Outdoor units',
  },
  {
    src: '/photos/showroom-6.jpg',
    alt: 'Samrat Electronics counter and storefront at Sharda Chowk, Raipur',
    caption: 'Storefront – Sharda Chowk',
    span: 'lg:col-span-2',
  },
  {
    src: '/photos/showroom-7.jpg',
    alt: 'HVAC accessories and spare parts at Samrat Electronics',
    caption: 'Accessories & spares',
  },
  {
    src: '/photos/showroom-8.jpg',
    alt: 'Samrat Electronics team at the Raipur HVAC showroom',
    caption: 'Team & service desk',
  },
]
