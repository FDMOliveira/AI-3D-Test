import { defineField, defineType } from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'scrollIndicatorLabel',
      title: 'Scroll Indicator Label',
      description: 'The small label shown at the bottom of the first screen (default: "Scroll").',
      type: 'string',
      initialValue: 'Scroll',
    }),
    defineField({
      name: 'scrollBlocks',
      title: 'Scroll Blocks',
      description:
        'The 4 narrative text panels that appear as the user scrolls through the scene. Keep exactly 4 blocks — their timing is fixed to the 3D camera animation.',
      type: 'array',
      validation: (Rule) => Rule.required().min(4).max(4),
      of: [
        {
          type: 'object',
          name: 'scrollBlock',
          title: 'Scroll Block',
          fields: [
            defineField({
              name: 'label',
              title: 'Section Label',
              description: 'Small uppercase label above the heading (e.g. "The Isle", "Discover").',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              description: 'Main heading text. Press Enter to create line breaks that control how the text wraps.',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sub',
              title: 'Subtext',
              description: 'Short supporting sentence below the heading.',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'align',
              title: 'Text Alignment',
              description: 'Controls where the text block is positioned on screen.',
              type: 'string',
              options: {
                list: [
                  { title: 'Left', value: 'left' },
                  { title: 'Center', value: 'center' },
                  { title: 'Right', value: 'right' },
                ],
                layout: 'radio',
              },
              initialValue: 'center',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'cta',
              title: 'Show CTA Buttons',
              description: 'Enable for the final block to show the "Reserve" and "Learn More" buttons.',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'ctaPrimaryLabel',
              title: 'Primary CTA Button Label',
              description: 'The filled button (e.g. "Reserve Your Isle"). Only shown when CTA Buttons is enabled.',
              type: 'string',
              hidden: ({ parent }) => !parent?.cta,
            }),
            defineField({
              name: 'ctaSecondaryLabel',
              title: 'Secondary CTA Button Label',
              description: 'The outlined button (e.g. "Learn More"). Only shown when CTA Buttons is enabled.',
              type: 'string',
              hidden: ({ parent }) => !parent?.cta,
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'heading' },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Home Page' }),
  },
})
