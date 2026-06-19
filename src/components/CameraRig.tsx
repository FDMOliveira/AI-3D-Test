"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const CAMERA_STATES = [
  // 0 — High aerial: entire island visible from above
  {
    pos: new THREE.Vector3(0, 85, 25),
    target: new THREE.Vector3(0, 2, 8),
  },
  // 1 — Cinematic 3/4 approach: scale and architecture reveal
  {
    pos: new THREE.Vector3(28, 12, 25),
    target: new THREE.Vector3(8, 3.5, 8),
  },
  // 2 — Premium hero shot: cabin centred, ocean framing
  {
    pos: new THREE.Vector3(0, 3.5, 15),
    target: new THREE.Vector3(0, 3, 10),
  },
  // 3 — Premium hero shot: cabin centred, ocean framing
  {
    pos: new THREE.Vector3(0, 2, 10),
    target: new THREE.Vector3(0, 2, 8),
  },
  {
    pos: new THREE.Vector3(0, 1.5, 5),
    target: new THREE.Vector3(0, 1.5, 0),
  },
  {
    pos: new THREE.Vector3(0, 1.5, -0.1),
    target: new THREE.Vector3(0, 1.5, -5),
  },
] as const;

export const INITIAL_CAMERA_POS = CAMERA_STATES[0].pos.clone();

// Segment weights: [0→1, 1→2, 2→3] — proportional share of total scroll
const DURATIONS = [3, 2.75, 2.25, 2.0, 2.75] as const;

export default function CameraRig() {
  const { camera } = useThree();

  // GSAP mutates these Vector3 objects each rAF tick during scrub
  const pos = useRef(CAMERA_STATES[0].pos.clone());
  const target = useRef(CAMERA_STATES[0].target.clone());

  useEffect(() => {
    const el = document.getElementById("scroll-container");
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 4, // 2 s lag — cinematic, never mechanical
        },
      });

      CAMERA_STATES.slice(1).forEach(({ pos: p, target: t }, i) => {
        const dur = DURATIONS[i];
        // pos and target animate in parallel via "<" position label
        tl.to(pos.current, {
          x: p.x,
          y: p.y,
          z: p.z,
          duration: dur,
          ease: "power1.inOut",
        });
        tl.to(
          target.current,
          { x: t.x, y: t.y, z: t.z, duration: dur, ease: "power1.inOut" },
          "<",
        );
      });
    });

    return () => ctx.revert();
  }, []);

  useFrame(() => {
    camera.position.copy(pos.current);
    camera.lookAt(target.current);
    camera.updateMatrixWorld(true);
  });

  return null;
}
