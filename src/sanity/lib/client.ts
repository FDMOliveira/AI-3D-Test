import { createClient } from '@sanity/client'
import type { SanityClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const apiVersion = '2024-01-01'

// Regular client — uses CDN in production for fast reads
export const client: SanityClient | null = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null

// Preview client — bypasses CDN so draft documents are visible
// Used when SANITY_API_READ_TOKEN is set (e.g. preview builds)
const readToken = process.env.SANITY_API_READ_TOKEN
export const previewClient: SanityClient | null =
  projectId && readToken
    ? createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: false,
        token: readToken,
        perspective: 'previewDrafts',
      })
    : null

export function getClient(preview = false): SanityClient | null {
  if (preview && previewClient) return previewClient
  return client
}
