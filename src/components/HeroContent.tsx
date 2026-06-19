"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ScrollBlock, Navigation } from "@/sanity/lib/types";

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
const DEFAULT_BLOCKS: ScrollBlock[] = [
  {
    label: "The Isle",
    heading: "An island\nat the edge\nof the world.",
    sub: "Untouched. Unreachable. Unforgettable.",
    align: "center",
    cta: false,
  },
  {
    label: "Discover",
    heading: "The journey\nbegins from\nabove.",
    sub: "A remote speck of land rising from the deep blue.",
    align: "left",
    cta: false,
  },
  {
    label: "Approach",
    heading: "Your cabin\nawaits.",
    sub: "Built from driftwood and salt air, it has been waiting for you.",
    align: "right",
    cta: false,
  },
  {
    label: "Arrive",
    heading: "Welcome\nhome.",
    sub: "Reserve your escape. Limited stays. Zero distractions.",
    align: "center",
    cta: true,
    ctaPrimaryLabel: "Reserve Your Isle",
    ctaSecondaryLabel: "Learn More",
  },
];

const DEFAULT_NAV: Navigation = {
  brandName: "The Isle",
  navLinks: [{ label: "Escape" }, { label: "Reserve" }],
  ctaLabel: "Book Now",
};

const DEFAULT_SCROLL_LABEL = "Scroll";

// Scroll percentages [fadeIn start, fadeIn end, fadeOut start, fadeOut end]
// expressed as % of the 500 vh container ("X% top" syntax)
const TIMING = [
  [0, 10, 16, 24], // block 0 — aerial
  [24, 32, 48, 56], // block 1 — descent
  [52, 60, 66, 74], // block 2 — approach
  [72, 80, -1, -1], // block 3 — hero (never fades out)
] as const;

interface HeroContentProps {
  blocks?: ScrollBlock[] | null;
  navigation?: Navigation | null;
  scrollIndicatorLabel?: string | null;
}

export default function HeroContent({
  blocks: blocksProp,
  navigation: navProp,
  scrollIndicatorLabel: scrollLabelProp,
}: HeroContentProps = {}) {
  const BLOCKS = blocksProp ?? DEFAULT_BLOCKS;
  const nav = navProp ?? DEFAULT_NAV;
  const scrollLabel = scrollLabelProp ?? DEFAULT_SCROLL_LABEL;

  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = document.getElementById("scroll-container");
    if (!container) return;

    const ctx = gsap.context(() => {
      blockRefs.current.forEach((block, i) => {
        if (!block) return;

        const els = (
          i === BLOCKS.length - 1
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
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                stagger: 0.2,
                duration: 0.8,
                delay: 1,
                ease: "power2.out",
                onComplete: () => {
                  block
                    .querySelectorAll<HTMLElement>(".t-cta-1, .t-cta-2")
                    .forEach((btn) => {
                      btn.style.transition =
                        "background-color 150ms, transform 150ms";
                      btn.style.pointerEvents = "auto";
                    });
                },
              });
            },
          });
          // Separate trigger for the scroll-back exit, positioned a touch
          // earlier than the entry point so it kicks in sooner going up.
          ScrollTrigger.create({
            trigger: container,
            start: `${fi0 + 3}% top`,
            onLeaveBack: () => {
              block
                .querySelectorAll<HTMLElement>(".t-cta-1, .t-cta-2")
                .forEach((btn) => {
                  btn.style.transition = "none";
                  btn.style.pointerEvents = "none";
                });
              gsap.to(els, {
                opacity: 0,
                y: 38,
                filter: "blur(10px)",
                stagger: { each: 0.08, from: "end" },
                duration: 0.6,
                ease: "power2.in",
              });
            },
          });
        } else {
          // Enter in appearance order (label → heading → sub). All start
          // together at the top of the window, but finish at different
          // points — label finishes first, sub last — mirroring the exit.
          const fadeInTl = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              start: `${fi0}% top`,
              end: `${fi1}% top`,
              scrub: 1,
            },
          });
          const HEADING_LINE_STAGGER = 0.35;
          const headingLineCount = 3;
          const headingDuration = ((1 + 1) / els.length) * 2;
          const headingEnd =
            HEADING_LINE_STAGGER * (headingLineCount - 1) + headingDuration;

          els.forEach((el, idx) => {
            const duration = (idx + 1) / els.length;
            const isFirstHeading = i === 0 && idx === 1;
            const isSubAfterFirstHeading = i === 0 && idx === 2;

            // First heading is rendered as 3 manual line spans (not the
            // SplitText plugin, which mis-measured the forced line breaks).
            // Animate those lines with a slight stagger instead of the
            // single element, same fade/blur treatment otherwise.
            if (isFirstHeading) {
              const lines = block.querySelectorAll<HTMLElement>(".t-heading-line");
              fadeInTl.fromTo(
                lines,
                { opacity: 0, y: 38, filter: "blur(10px)" },
                {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  ease: "none",
                  duration: headingDuration,
                  stagger: HEADING_LINE_STAGGER,
                  immediateRender: false,
                },
                0,
              );
              return;
            }

            // Sub only starts once the heading's last line has fully appeared.
            if (isSubAfterFirstHeading) {
              fadeInTl.fromTo(
                el,
                { opacity: 0, y: 38, filter: "blur(10px)" },
                {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  ease: "none",
                  duration: 0.5,
                  immediateRender: false,
                },
                headingEnd,
              );
              return;
            }

            fadeInTl.fromTo(
              el,
              { opacity: 0, y: 38, filter: "blur(10px)" },
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                ease: "none",
                duration,
                immediateRender: false,
              },
              0,
            );
          });
        }

        // Fade out (skip for last block)
        if (fo0 >= 0) {
          // Exit in reverse appearance order (sub → heading → label), but
          // every element finishes exactly at the end of the scroll window
          // — only the start is offset, so nothing disappears prematurely.
          const exitOrder = [...els].reverse();
          const exitGap = 0.15;
          const fadeOutTl = gsap.timeline({
            scrollTrigger: {
              trigger: container,
              start: `${fo0}% top`,
              end: `${fo1}% top`,
              scrub: 1,
            },
          });
          exitOrder.forEach((el, idx) => {
            const start = idx * exitGap;
            fadeOutTl.fromTo(
              el,
              { opacity: 1, y: 0, filter: "blur(0px)" },
              {
                opacity: 0,
                y: -30,
                filter: "blur(8px)",
                ease: "none",
                duration: 1 - start,
                immediateRender: false,
              },
              start,
            );
          });
        }
      });
    });

    return () => ctx.revert();
  }, [BLOCKS]);

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
            {nav.brandName}
          </span>
          <div className="flex items-center gap-8">
            {nav.navLinks.map((link) => (
              <span
                key={link.label}
                className="text-white/50 text-sm tracking-wide hidden md:block"
              >
                {link.label}
              </span>
            ))}
            <button className="text-sm text-white/90 border border-white/20 px-5 py-2 rounded-full hover:bg-white/10 transition-colors tracking-wide">
              {nav.ctaLabel}
            </button>
          </div>
        </nav>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/35 text-xs tracking-[0.35em] uppercase">
            {scrollLabel}
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-white/35 to-transparent" />
        </div>
      </div>

      {/* ── Narrative text blocks ────────────────────────────────────────── */}
      {BLOCKS.map((block, i) => (
        <div
          key={i}
          ref={(el) => {
            blockRefs.current[i] = el;
          }}
          className="fixed inset-0 flex items-center pointer-events-none"
          style={{
            zIndex: 20,
            ...(i === BLOCKS.length - 1 && { paddingBottom: "40vh" }),
          }}
        >
          <div
            className={[
              "absolute px-8 md:px-16 max-w-xl",
              block.align === "left" ? "left-0" : "",
              block.align === "right" ? "right-0" : "",
              block.align === "center"
                ? "left-1/2 -translate-x-1/2 text-center"
                : "",
            ].join(" ")}
            style={
              i === 0
                ? {
                    transform:
                      block.align === "center"
                        ? "translate(-50%, 15vh)"
                        : "translateY(15vh)",
                  }
                : undefined
            }
          >
            <span
              className="t-label block text-white/40 text-xs tracking-[0.35em] uppercase mb-4"
              style={{ opacity: 0 }}
            >
              {block.label}
            </span>
            <h2
              className="t-heading text-white text-4xl md:text-6xl font-light leading-[1.05] tracking-tight mb-6"
              style={i === 0 ? undefined : { whiteSpace: "pre-line", opacity: 0 }}
            >
              {i === 0
                ? block.heading.split("\n").map((line, lineIdx) => (
                    <span
                      key={lineIdx}
                      className="t-heading-line block"
                      style={{ opacity: 0 }}
                    >
                      {line}
                    </span>
                  ))
                : block.heading}
            </h2>
            <p
              className="t-sub text-white/50 text-base md:text-lg font-light leading-relaxed"
              style={{ opacity: 0 }}
            >
              {block.sub}
            </p>
            {block.cta && (
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
                <button
                  className="t-cta-1 text-sm bg-white text-[#060d1a] px-8 py-3.5 rounded-full font-medium tracking-wide hover:bg-white/90 hover:scale-[1.03] active:scale-100"
                  style={{ opacity: 0, pointerEvents: "none" }}
                >
                  {block.ctaPrimaryLabel ?? "Reserve Your Isle"}
                </button>
                <button
                  className="t-cta-2 text-sm text-white/70 border border-white/20 px-8 py-3.5 rounded-full font-light tracking-wide hover:bg-white/10"
                  style={{ opacity: 0, pointerEvents: "none" }}
                >
                  {block.ctaSecondaryLabel ?? "Learn More"}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
