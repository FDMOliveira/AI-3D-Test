export interface SiteSettings {
  siteTitle: string
  siteDescription: string
  openGraphTitle?: string
  openGraphDescription?: string
}

export interface NavLink {
  label: string
  href?: string
}

export interface Navigation {
  brandName: string
  navLinks: NavLink[]
  ctaLabel: string
}

export interface ScrollBlock {
  label: string
  heading: string
  sub: string
  align: 'left' | 'right' | 'center'
  cta: boolean
  ctaPrimaryLabel?: string
  ctaSecondaryLabel?: string
}

export interface HomePage {
  scrollIndicatorLabel: string
  scrollBlocks: ScrollBlock[]
}
