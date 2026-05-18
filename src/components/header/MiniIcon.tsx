import { useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TOKENS } from '@/config/design-tokens';
import { lerpEmissive } from '../icon-3d/three-helpers';
import styles from './MiniIcon.module.scss';

type Props = {
  /** Function that builds the THREE.Group for this icon. */
  build: () => THREE.Group;
  /** Click handler — usually opens a URL or runs an action. */
  onClick: () => void;
  /** Accessible label for screen readers. */
  ariaLabel: string;
};

/**
 * A tiny 3D icon button. Each instance gets its own Canvas (its own
 * Three.js renderer and scene). This is a bit wasteful at scale, but
 * for 4 small icons it's perfectly fine and keeps the encapsulation
 * clean — each icon is independent.
 *
 * Hover behavior:
 *  - Scale up to 1.15 (smooth lerp)
 *  - Emissive glow in its own brand color
 *  - Rotation speed STAYS constant — does NOT speed up
 */
export default function MiniIcon({ build, onClick, ariaLabel }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={styles.miniIcon}
      onClick={onClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Generous lighting + a small baseline emissive (set per-frame in
            MiniMesh) keeps these icons reading as vivid colored buttons
            rather than dull 3D blocks. The main desktop icons are kept
            darker on purpose; this is mini-icon-specific. */}
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 3, 4]} intensity={1.5} />
        <directionalLight position={[-2, 1, 2]} intensity={0.6} />
        <MiniMesh build={build} isHovered={isHovered} />
      </Canvas>
    </button>
  );
}

function MiniMesh({ build, isHovered }: { build: () => THREE.Group; isHovered: boolean }) {
  // Build the mesh exactly once (useMemo)
  const mesh = useMemo(() => build(), [build]);

  // Baseline emissive at rest. The main desktop icons sit at 0 (matte
  // until hovered); mini icons get a small constant glow so they read as
  // vivid buttons even when idle. Hover ramps this up further.
  const MINI_BASELINE_GLOW = 0.18;

  useFrame(() => {
    // Mini icons no longer rotate — too much visual noise alongside the
    // main desktop icons. They stay static and face the camera head-on
    // (rotation zeroed in the useEffect below).

    // Hover scale
    const targetScale = isHovered ? TOKENS.MINI_HOVER_SCALE : 1.0;
    const cur = mesh.scale.x;
    mesh.scale.setScalar(cur + (targetScale - cur) * TOKENS.HOVER_LERP_RATE);

    // Glow ramps between baseline → hover. At rest the icons keep a soft
    // self-lit feel; hover bumps it further to confirm the interaction.
    const glowTarget = isHovered ? TOKENS.MINI_HOVER_GLOW : MINI_BASELINE_GLOW;
    lerpEmissive(mesh, glowTarget, TOKENS.HOVER_LERP_RATE);
  });

  // Face the camera head-on. We deliberately don't tilt these — the
  // perspective angle was making the icons read as "fake 3D" rather than
  // as clean buttons. With zero rotation the front face fills the tile
  // squarely; the extrusion still gives subtle depth at the edges from
  // the lighting falloff, but the logo itself stays perfectly readable.
  useEffect(() => {
    mesh.rotation.y = 0;
    mesh.rotation.x = 0;
  }, [mesh]);

  return <primitive object={mesh} />;
}
