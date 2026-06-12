"use client";

import dynamic from "next/dynamic";
import HeroContent from "@/components/HeroContent";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function HomePage() {
  return (
    <>
      {/* 3D canvas — always fixed behind everything */}
      <div className="canvas-container">
        <Scene />
      </div>

      {/* Scroll experience: creates the 500 vh scroll space + text overlays */}
      <HeroContent />
    </>
  );
}
