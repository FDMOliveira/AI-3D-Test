import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemas } from './src/sanity/schemas'

export default defineConfig({
  name: 'the-isle',
  title: 'The Isle',
  projectId: 'tz5hfq96',
  dataset: 'production',

  plugins: [
    structureTool({
      // Enforce singletons: each document type has a fixed _id so only one
      // instance can exist. The studio structure removes the "new document"
      // button for these types.
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Site Settings'),
              ),
            S.listItem()
              .title('Navigation')
              .id('navigation')
              .child(
                S.document()
                  .schemaType('navigation')
                  .documentId('navigation')
                  .title('Navigation'),
              ),
            S.listItem()
              .title('Home Page')
              .id('homePage')
              .child(
                S.document()
                  .schemaType('homePage')
                  .documentId('homePage')
                  .title('Home Page'),
              ),
          ]),
    }),
  ],

  schema: {
    types: schemas,
  },
})
