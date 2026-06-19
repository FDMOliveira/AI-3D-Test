"use client";

import { useEffect, useState } from "react";

const INK = "#0f2a3d";
const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";
const REVEAL = `transition-all duration-[2000ms] ${EASE}`;
const HIDDEN = "opacity-0 blur-[10px] translate-y-5";
const VISIBLE = "opacity-100 blur-none translate-y-0";

const titleClass = "absolute left-[6%] top-[7%] max-w-xl";
const secondaryTitleClass =
  "absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 text-center max-w-xl";
const headingClass = `text-4xl md:text-6xl font-light tracking-tight leading-[1.05] ${REVEAL}`;
const subClass = `text-lg md:text-2xl font-light mt-3 max-w-md delay-200 ${REVEAL}`;
const textShadow = "0 2px 18px rgba(255,255,255,0.35)";

export default function ScrollTitles() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primaryVisible = progress > 0.2;
  const secondaryVisible = progress > 0.65;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20"
      style={{ color: INK }}
    >
      <div className={titleClass}>
        <h2
          className={`${headingClass} ${primaryVisible ? VISIBLE : HIDDEN}`}
          style={{ textShadow }}
        >
          The Sandbank Pavilion asdadas
        </h2>
        <p
          className={`${subClass} ${primaryVisible ? VISIBLE : HIDDEN}`}
          style={{ color: `${INK}b3`, textShadow }}
        >
          A private retreat suspended between sky and sea.
        </p>
      </div>

      <div className={secondaryTitleClass}>
        <h2
          className={`${headingClass} ${secondaryVisible ? VISIBLE : HIDDEN}`}
          style={{ textShadow }}
        >
          Inside the Pavilion
        </h2>
        <p
          className={`${subClass} ${secondaryVisible ? VISIBLE : HIDDEN}`}
          style={{ color: `${INK}b3`, textShadow }}
        >
          Where ocean light moves freely through every room.
        </p>
      </div>
    </div>
  );
}
