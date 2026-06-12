"use client";

import { Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import CameraRig, { INITIAL_CAMERA_POS } from "@/components/CameraRig";

// Debug aid: flip to `true` to freeze the scripted camera and drop in free-look
// OrbitControls instead. Set back to `false` before shipping.
const DEBUG_ORBIT = false;

// ── Water shaders ────────────────────────────────────────────────────────────

const WATER_VERT = /* glsl */ `
  uniform float uTime;
  varying float vWave;
  varying vec3  vWorldPos;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    float wx = world.x;
    float wz = world.z;

    // Three calm, overlapping ripples — small amplitude, slow pace
    float w1 = sin(wx * 0.48 + uTime * 0.72) * 0.016;
    float w2 = sin(wz * 0.38 + uTime * 0.58) * 0.012;
    float w3 = sin((wx + wz * 0.65) * 0.22 + uTime * 0.44) * 0.007;

    // Slow tidal breath
    float tide = sin(uTime * 0.11) * 0.045;

    vWave     = w1 + w2 + w3;
    world.y  += vWave + tide;
    vWorldPos = world.xyz;

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const WATER_FRAG = /* glsl */ `
  uniform vec3  uColor0;     // pale aqua — near sand
  uniform vec3  uColor1;     // tropical turquoise — mid depth
  uniform vec3  uColor2;     // tropical blue — deep
  uniform float uWaterLevel;
  uniform float uTime;

  varying float vWave;
  varying vec3  vWorldPos;

  // Approximates the Sandbank height — angular variation omitted to avoid
  // atan/sin per-fragment (too expensive at full screen coverage).
  float sandY(float wx, float wz) {
    float rx = wx / 8.6;
    float rz = wz / 6.0;
    float r  = sqrt(rx * rx + rz * rz);
    float h  = 0.85 * exp(-r * r * 2.2);
    return h - pow(max(0.0, r - 0.5) / 2.0, 2.0) * 0.6 - 0.01;
  }

  void main() {
    // True vertical depth: water surface → sand below
    float rawDepth = uWaterLevel - sandY(vWorldPos.x, vWorldPos.z);

    // Subtle ripple — gently shifts the depth bands over time so the
    // turquoise mid-depth layer visibly undulates, like real shallow sea.
    float ripple = sin(vWorldPos.x * 0.6 + vWorldPos.z * 0.4 + uTime * 0.6) * 0.05
                 + sin(vWorldPos.x * 0.33 - vWorldPos.z * 0.5 + uTime * 0.9) * 0.03;

    // Tidal cycle — ONE clear oscillator drives the rise-and-fall, so the
    // band visibly climbs to a high-water mark and recedes back again in a
    // long, perceptible ~95s loop that runs forever — never a one-way drift.
    float tidePhase = sin(uTime * 0.066) * 0.5 + 0.5; // 0 = low tide … 1 = high tide

    // Irregular spatial reach — four mutually-irrational waves blended via
    // mixed sums and products (not a single multiply) decide HOW FAR the
    // tide climbs at each point, in soft, rounded, organic patches rather
    // than straight axis-aligned bands. Their drift never repeats, so each
    // tidal cycle reaches slightly different patches than the last.
    float cA = sin(vWorldPos.x * 0.17  + uTime * 0.051) * 0.5 + 0.5;
    float cB = sin(vWorldPos.z * 0.231 - uTime * 0.067) * 0.5 + 0.5;
    float cC = sin((vWorldPos.x - vWorldPos.z) * 0.113 + uTime * 0.041) * 0.5 + 0.5;
    float cD = sin((vWorldPos.x * 0.6 + vWorldPos.z * 1.4) * 0.097 - uTime * 0.058) * 0.5 + 0.5;
    float spatial = (cA * cB * cC) * 0.5 + (cB * cD) * 0.3 + cD * 0.2;
    float reach   = mix(0.55, 1.2, spatial);

    float tideRise = tidePhase * reach;

    float bandedDepth = max(0.0, rawDepth + tideRise + ripple);

    // 3-stop depth color: pale aqua → turquoise → tropical blue
    vec3 color = mix(uColor0, uColor1, smoothstep(0.0,  0.38, bandedDepth));
    color      = mix(color,   uColor2, smoothstep(0.60, 1.60, bandedDepth));

    // Gentle crest brightening — wave peaks catch more light
    color += vec3(max(0.0, vWave) * 0.06);

    float alpha = mix(0.12, 0.80, smoothstep(0.0, 0.68, bandedDepth));

    // Hide the 320×320 plane boundary
    float ex = min(vWorldPos.x + 160.0, 160.0 - vWorldPos.x);
    float ez = min(vWorldPos.z + 160.0, 160.0 - vWorldPos.z);
    float edgeFade = clamp(min(ex, ez) / 12.0, 0.0, 1.0);

    gl_FragColor = vec4(color, alpha * edgeFade);
  }
`;

// ── Water component ──────────────────────────────────────────────────────────

function Water() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWaterLevel: { value: 0.28 },
      uColor0: { value: new THREE.Color("#aaecf8") },
      uColor1: { value: new THREE.Color("#18bcd6") },
      uColor2: { value: new THREE.Color("#1465b8") },
    }),
    [],
  );

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: WATER_VERT,
        fragmentShader: WATER_FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
      }),
    [uniforms],
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.28, 0]}>
      <planeGeometry args={[320, 320, 48, 48]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ── Sandbank component ───────────────────────────────────────────────────────

function Sandbank() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(20, 14, 22, 16);
    const pos = g.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i); // local Y → world Z after -X rotation
      const rx = x / 8.6;
      const rz = z / 6.0;
      const r = Math.sqrt(rx * rx + rz * rz);

      let h = 1 * Math.exp(-r * r * 2.2);

      const angle = Math.atan2(rz, rx);
      h *= 1.0 + 0.18 * Math.sin(angle * 4.3) + 0.1 * Math.sin(angle * 7.1);

      const sink = Math.pow(Math.max(0, r - 0.5) / 2.0, 2) * 0.6;
      h -= sink;

      pos.setZ(i, h);
    }

    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  const alphaMap = useMemo(() => {
    const WATER_LEVEL = 0.28;
    const FADE = 0.05;
    const size = 512;
    const data = new Uint8Array(size * size * 4);

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const wx = (px / size - 0.5) * 20.0;
        const wz = (py / size - 0.5) * 14.0;
        const nx = wx / 8.6;
        const nz = wz / 6.0;
        const dist = Math.sqrt(nx * nx + nz * nz);
        const ang = Math.atan2(nz, nx);

        let h = Math.exp(-dist * dist * 2.2);
        h *= 1.0 + 0.18 * Math.sin(ang * 4.3) + 0.1 * Math.sin(ang * 7.1);
        h -= Math.pow(Math.max(0, dist - 0.5) / 2.0, 2) * 0.6;

        const submerged = 0.01;
        const a =
          h < WATER_LEVEL
            ? submerged
            : Math.min(
                1,
                submerged + (1 - submerged) * ((h - WATER_LEVEL) / FADE),
              );

        const i4 = (py * size + px) * 4;
        const v = Math.round(a * 255);
        data[i4] = data[i4 + 1] = data[i4 + 2] = v;
        data[i4 + 3] = 255;
      }
    }

    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <mesh
      geometry={geo}
      rotation-x={-Math.PI / 2}
      position={[0, -0.01, 0]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        color="#c8a255"
        roughness={0.93}
        metalness={0}
        alphaMap={alphaMap}
        alphaTest={0.05}
        alphaToCoverage
      />
    </mesh>
  );
}

// ── House component ──────────────────────────────────────────────────────────

function House() {
  const { scene } = useGLTF(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/house3.glb`, false, true);

  useMemo(() => {
    const TEX_KEYS = [
      "map", "normalMap", "roughnessMap", "metalnessMap",
      "emissiveMap", "aoMap", "lightMap", "alphaMap",
      "bumpMap", "displacementMap", "clearcoatMap",
      "clearcoatNormalMap", "clearcoatRoughnessMap",
      "sheenColorMap", "sheenRoughnessMap", "transmissionMap",
      "thicknessMap", "specularIntensityMap", "specularColorMap",
    ] as const;

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;

      // GLB exports sometimes assign textures to high UV channels (uv7, etc.)
      // that don't exist in the geometry, causing shader compile errors.
      // Reset all texture channels to 0 (the standard "uv" attribute).
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        TEX_KEYS.forEach((key) => {
          const tex = (mat as THREE.MeshPhysicalMaterial)[key as keyof THREE.MeshPhysicalMaterial];
          if (tex && (tex as THREE.Texture).isTexture) {
            (tex as THREE.Texture).channel = 0;
          }
        });
        (mat as THREE.Material).needsUpdate = true;
      });
    });
  }, [scene]);

  return <primitive object={scene} position={[0, 0.78, 0]} scale={[2, 2, 2]} />;
}

// ── Scene ────────────────────────────────────────────────────────────────────

export default function Scene() {
  const initialPos = INITIAL_CAMERA_POS;

  return (
    <Canvas
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{
        fov: 42,
        near: 0.1,
        far: 1600,
        position: [initialPos.x, initialPos.y, initialPos.z],
      }}
      shadows
      frameloop="always"
      dpr={
        typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1
      }
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <color attach="background" args={["#c8e8f5"]} />

      <directionalLight
        position={[30, 50, 20]}
        intensity={0.5}
        color="#ffd090"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      <Suspense fallback={null}>
        <Environment preset="sunset" />
      </Suspense>

      {!DEBUG_ORBIT && <CameraRig />}
      <Sandbank />
      <Water />
      <Suspense fallback={null}>
        <House />
      </Suspense>

      {DEBUG_ORBIT && <OrbitControls makeDefault />}
    </Canvas>
  );
}
