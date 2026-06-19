import type { Metadata } from "next";
import "./globals.css";
import { getClient } from "@/sanity/lib/client";
import { siteSettingsQuery } from "@/sanity/lib/queries";
import type { SiteSettings } from "@/sanity/lib/types";

const fallbackMetadata: Metadata = {
  title: "The Isle — A Hidden Escape",
  description: "Discover a pristine island cabin, untouched by the world.",
  openGraph: {
    title: "The Isle — A Hidden Escape",
    description: "Discover a pristine island cabin, untouched by the world.",
    type: "website",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const sanity = getClient();
  if (!sanity) return fallbackMetadata;

  const settings = await sanity
    .fetch<SiteSettings>(siteSettingsQuery)
    .catch(() => null);

  if (!settings) return fallbackMetadata;

  return {
    title: settings.siteTitle,
    description: settings.siteDescription,
    openGraph: {
      title: settings.openGraphTitle ?? settings.siteTitle,
      description: settings.openGraphDescription ?? settings.siteDescription,
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
