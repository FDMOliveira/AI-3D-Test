import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'openGraphTitle',
      title: 'Open Graph Title',
      description: 'Falls back to Site Title if left empty.',
      type: 'string',
    }),
    defineField({
      name: 'openGraphDescription',
      title: 'Open Graph Description',
      description: 'Falls back to Site Description if left empty.',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: { title: 'siteTitle' },
  },
})
