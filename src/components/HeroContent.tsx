"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Narrative blocks ─────────────────────────────────────────────────────────
//
//  #scroll-container = 500 vh  →  max scroll ≈ 400 vh
//
//  "X% top"  fires when  scroll = X% × 500vh
//
//  Block  0 (aerial):   scroll  0 – 120 vh   →   0 –  24 %
//  Block  1 (descent):  scroll 120 – 280 vh  →  24 –  56 %
//  Block  2 (approach): scroll 260 – 370 vh  →  52 –  74 %
//  Block  3 (hero):     scroll 350 – 400 vh  →  70 –  80 %
//
const BLOCKS = [
  {
    label:   "The Isle",
    heading: "An island\nat the edge\nof the world.",
    sub:     "Untouched. Unreachable. Unforgettable.",
    align:   "center" as const,
    cta:     false,
  },
  {
    label:   "Discover",
    heading: "The journey\nbegins from\nabove.",
    sub:     "A remote speck of land rising from the deep blue.",
    align:   "left" as const,
    cta:     false,
  },
  {
    label:   "Approach",
    heading: "Your cabin\nawaits.",
    sub:     "Built from driftwood and salt air, it has been waiting for you.",
    align:   "right" as const,
    cta:     false,
  },
  {
    label:   "Arrive",
    heading: "Welcome\nhome.",
    sub:     "Reserve your escape. Limited stays. Zero distractions.",
    align:   "center" as const,
    cta:     true,
  },
];

// Scroll percentages [fadeIn start, fadeIn end, fadeOut start, fadeOut end]
// expressed as % of the 500 vh container ("X% top" syntax)
const TIMING = [
  [ 0,  3, 16, 24],   // block 0 — aerial
  [24, 32, 48, 56],   // block 1 — descent
  [52, 60, 66, 74],   // block 2 — approach
  [72, 80,  -1, -1],  // block 3 — hero (never fades out)
] as const;

export default function HeroContent() {
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = document.getElementById("scroll-container");
    if (!container) return;

    const ctx = gsap.context(() => {
      blockRefs.current.forEach((block, i) => {
        if (!block) return;

        const els = (i === BLOCKS.length - 1
          ? [
              block.querySelector(".t-label"),
              block.querySelector(".t-heading"),
              block.querySelector(".t-sub"),
              block.querySelector(".t-cta-1"),
              block.querySelector(".t-cta-2"),
            ]
          : [
              block.querySelector(".t-label"),
              block.querySelector(".t-heading"),
              block.querySelector(".t-sub"),
            ]
        ).filter(Boolean);

        const [fi0, fi1, fo0, fo1] = TIMING[i];

        // Fade in
        if (i === BLOCKS.length - 1) {
          // Last block: time-based with 1 s delay, triggered once on enter
          gsap.set(els, { opacity: 0, y: 38, filter: "blur(10px)" });
          ScrollTrigger.create({
            trigger: container,
            start: `${fi0}% top`,
            onEnter: () => {
              gsap.to(els, {
                opacity: 1, y: 0, filter: "blur(0px)",
                stagger: 0.1, duration: 0.8, delay: 1, ease: "power2.out",
                onComplete: () => {
                  block.querySelectorAll<HTMLElement>(".t-cta-1, .t-cta-2").forEach((btn) => {
                    btn.style.transition = "background-color 150ms, transform 150ms";
                  });
                },
              });
            },
            onLeaveBack: () => {
              block.querySelectorAll<HTMLElement>(".t-cta-1, .t-cta-2").forEach((btn) => {
                btn.style.transition = "none";
              });
              gsap.set(els, { opacity: 0, y: 38, filter: "blur(10px)" });
            },
          });
        } else {
          gsap.fromTo(
            els,
            { opacity: 0, y: 38, filter: "blur(10px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              stagger: 0.1,
              ease: "none",
              scrollTrigger: {
                trigger: container,
                start: `${fi0}% top`,
                end:   `${fi1}% top`,
                scrub: 1,
              },
            }
          );
        }

        // Fade out (skip for last block)
        if (fo0 >= 0) {
          gsap.to(els, {
            opacity: 0,
            y: -30,
            filter: "blur(8px)",
            stagger: 0.05,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: `${fo0}% top`,
              end:   `${fo1}% top`,
              scrub: 1,
            },
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="scroll-container"
      className="relative z-10 pointer-events-none"
      style={{ height: "500vh" }}
    >
      {/* ── Pinned viewport overlay ─────────────────────────────────────── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060d1a]/55 via-transparent to-[#060d1a]/35 pointer-events-none" />

        {/* Top navigation */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 pt-8 pointer-events-auto">
          <span className="text-white/90 text-sm font-medium tracking-[0.2em] uppercase">
            The Isle
          </span>
          <div className="flex items-center gap-8">
            <span className="text-white/50 text-sm tracking-wide hidden md:block">Escape</span>
            <span className="text-white/50 text-sm tracking-wide hidden md:block">Reserve</span>
            <button className="text-sm text-white/90 border border-white/20 px-5 py-2 rounded-full hover:bg-white/10 transition-colors tracking-wide">
              Book Now
            </button>
          </div>
        </nav>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/35 text-xs tracking-[0.35em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/35 to-transparent" />
        </div>
      </div>

      {/* ── Narrative text blocks ────────────────────────────────────────── */}
      {BLOCKS.map((block, i) => (
        <div
          key={i}
          ref={(el) => { blockRefs.current[i] = el; }}
          className="fixed inset-0 flex items-center pointer-events-none"
          style={{ zIndex: 20, ...(i === BLOCKS.length - 1 && { paddingBottom: "40vh" }) }}
        >
          <div
            className={[
              "absolute px-8 md:px-16 max-w-xl",
              block.align === "left"   ? "left-0"  : "",
              block.align === "right"  ? "right-0" : "",
              block.align === "center" ? "left-1/2 -translate-x-1/2 text-center" : "",
            ].join(" ")}
          >
            <span className="t-label block text-white/40 text-xs tracking-[0.35em] uppercase mb-4" style={{ opacity: 0 }}>
              {block.label}
            </span>
            <h2
              className="t-heading text-white text-4xl md:text-6xl font-light leading-[1.05] tracking-tight mb-6"
              style={{ whiteSpace: "pre-line", opacity: 0 }}
            >
              {block.heading}
            </h2>
            <p className="t-sub text-white/50 text-base md:text-lg font-light leading-relaxed" style={{ opacity: 0 }}>
              {block.sub}
            </p>
            {block.cta && (
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
                <button className="t-cta-1 text-sm bg-white text-[#060d1a] px-8 py-3.5 rounded-full font-medium tracking-wide hover:bg-white/90 hover:scale-[1.03] active:scale-100" style={{ opacity: 0 }}>
                  Reserve Your Isle
                </button>
                <button className="t-cta-2 text-sm text-white/70 border border-white/20 px-8 py-3.5 rounded-full font-light tracking-wide hover:bg-white/10" style={{ opacity: 0 }}>
                  Learn More
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
