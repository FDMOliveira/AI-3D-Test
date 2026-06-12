import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Isle — A Hidden Escape",
  description: "Discover a pristine island cabin, untouched by the world.",
  openGraph: {
    title: "The Isle — A Hidden Escape",
    description: "Discover a pristine island cabin, untouched by the world.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
