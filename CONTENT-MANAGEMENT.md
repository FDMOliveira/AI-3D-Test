# Content Management — The Isle

All website copy is managed through [Sanity Studio](https://www.sanity.io).
The 3D scene, animations, scroll timing, and layout are defined in code and cannot be changed from the CMS.

---

## One-time setup

### 1. Create a Sanity project

```bash
npx sanity@latest init --env
```

Follow the prompts. Note the **Project ID** and **Dataset** name that are created.

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3. Run the studio locally

```bash
npm run studio:dev
```

The studio opens at `http://localhost:3333`.

### 4. Seed initial content

On first launch the studio will show three empty documents.
Open each one, fill in the fields below, and **Publish**.

---

## Content documents

The studio has exactly three singleton documents (one instance each).
They cannot be duplicated or deleted from the UI.

---

### Site Settings

Controls the browser tab title and social-share preview card.

| Field | Example |
|---|---|
| Site Title | `The Isle — A Hidden Escape` |
| Site Description | `Discover a pristine island cabin, untouched by the world.` |
| Open Graph Title | _(leave empty to inherit Site Title)_ |
| Open Graph Description | _(leave empty to inherit Site Description)_ |

---

### Navigation

Controls the top navigation bar visible on every screen.

| Field | Example |
|---|---|
| Brand Name | `The Isle` |
| Nav Links → Label | `Escape`, `Reserve` |
| Nav Links → URL | _(optional, currently decorative)_ |
| CTA Button Label | `Book Now` |

---

### Home Page

Controls the four narrative text panels that appear as the user scrolls
through the 3D scene.

**Scroll Indicator Label** — the small word at the bottom of the first screen (default: `Scroll`).

**Scroll Blocks** — exactly 4 blocks, one per camera movement.
Keep the count at 4; removing or adding blocks will break the scroll timing.

| Block | Label | Alignment | Has CTA? |
|---|---|---|---|
| 0 – Aerial | `The Isle` | Center | No |
| 1 – Descent | `Discover` | Left | No |
| 2 – Approach | `Approach` | Right | No |
| 3 – Arrive | `Arrive` | Center | Yes |

Each block has:

- **Section Label** — small uppercase text above the heading
- **Heading** — main large text; press **Enter** inside the field to add line breaks
- **Subtext** — short supporting sentence
- **Text Alignment** — where the block sits on screen (Left / Center / Right)
- **Show CTA Buttons** — enable only on the last block (Arrive)
- **Primary CTA Label** — text for the filled button (e.g. `Reserve Your Isle`)
- **Secondary CTA Label** — text for the outlined button (e.g. `Learn More`)

---

## Publishing workflow

1. Edit any field in the studio.
2. Click **Publish** — unpublished changes appear only in preview builds.
3. Trigger a new site build to deploy the change to the live site.

---

## Preview (draft) builds

To build the site with unpublished draft content:

1. Create a **read-only API token** in [Sanity Manage](https://sanity.io/manage) → your project → API → Tokens.
2. Add it to `.env.local`:
   ```env
   SANITY_API_READ_TOKEN=skXXXXXXXXXXXX
   ```
3. Build normally — the preview client fetches draft documents automatically when the token is present.

Live in-studio preview (Sanity Presentation tool) requires server-side rendering.
If you deploy the site to Vercel or another platform without `output: "export"`,
you can enable the Presentation plugin in `sanity.config.ts`.

---

## Deploying the studio

To publish the studio to `https://the-isle.sanity.studio` (or your chosen hostname):

```bash
npm run studio:deploy
```

Studio deployments are free on Sanity's hosted infrastructure.

---

## Deploying the website

```bash
npm run deploy   # builds and pushes to GitHub Pages
```

The build fetches content from the Sanity CDN at build time and bakes it into static HTML.
Re-run `npm run deploy` whenever content changes in the studio.
