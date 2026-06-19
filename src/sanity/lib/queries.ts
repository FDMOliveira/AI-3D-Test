import groq from 'groq'

export const siteSettingsQuery = groq`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    siteTitle,
    siteDescription,
    openGraphTitle,
    openGraphDescription,
  }
`

export const navigationQuery = groq`
  *[_type == "navigation" && _id == "navigation"][0]{
    brandName,
    navLinks[]{ label, href },
    ctaLabel,
  }
`

export const homePageQuery = groq`
  *[_type == "homePage" && _id == "homePage"][0]{
    scrollIndicatorLabel,
    scrollBlocks[]{
      label,
      heading,
      sub,
      align,
      cta,
      ctaPrimaryLabel,
      ctaSecondaryLabel,
    },
  }
`
