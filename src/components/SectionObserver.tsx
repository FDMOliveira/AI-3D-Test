"use client";

import { useEffect } from "react";
import { useCameraStore } from "@/hooks/useCameraStore";

export default function SectionObserver() {
  useEffect(() => {
    let touchStartY = 0;

    function navigate(dir: 1 | -1) {
      const { isAnimating, currentSection, sectionCount, setCurrentSection } =
        useCameraStore.getState();
      if (isAnimating) return;
      const next = currentSection + dir;
      if (next < 0 || next >= sectionCount) return;
      setCurrentSection(next);
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      navigate(e.deltaY > 0 ? 1 : -1);
    }

    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 40) return;
      navigate(delta > 0 ? 1 : -1);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return null;
}
