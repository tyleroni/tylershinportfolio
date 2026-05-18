import { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo } from 'react';
import { TOKENS } from '@/config/design-tokens';
import { lerpEmissive, makeMaterial, makeRoundedBase } from '../icon-3d/three-helpers';
import styles from './WindowControlButton.module.scss';

type Variant = 'minimize' | 'maximize' | 'close';

type Props = {
  variant: Variant;
  onClick: () => void;
  disabled?: boolean;
};

/**
 * Tiny 3D button in the window title bar (the min/max/close cluster).
 *
 * Visual:
 *  - A small rounded tile with a glyph extruded on top
 *  - Each variant has its own color (close = red, max = gray, min = gray)
 *  - Hover: scale up + emissive glow (no rotation, matches the header mini icons)
 *
 * Behavior:
 *  - Close: actually does something (closes the active tab)
 *  - Min/Max: decorative — they hover-glow but onClick is a no-op
 *    (we keep onClick required so the API is consistent; pass () => {} for decorative)
 */

const COLORS: Record<Variant, number> = {
  minimize: 0x3a4150,
  maximize: 0x3a4150,
  close: 0xc63030,
};

export default function WindowControlButton({ variant, onClick, disabled }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={`${styles.btn} ${disabled ? styles.disabled : ''}`}
      onClick={disabled ? undefined : onClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      aria-label={variant}
      title={variant}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 3.2], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 2, 3]} intensity={0.9} />
        <ControlMesh variant={variant} isHovered={isHovered && !disabled} />
      </Canvas>
    </button>
  );
}

function ControlMesh({ variant, isHovered }: { variant: Variant; isHovered: boolean }) {
  const mesh = useMemo(() => buildControlMesh(variant), [variant]);

  useEffect(() => {
    // Slight angled rest pose
    mesh.rotation.y = -0.3;
    mesh.rotation.x = 0.2;
  }, [mesh]);

  useFrame(() => {
    const targetScale = isHovered ? 1.15 : 1.0;
    const cur = mesh.scale.x;
    mesh.scale.setScalar(cur + (targetScale - cur) * TOKENS.HOVER_LERP_RATE);

    lerpEmissive(mesh, isHovered ? 0.5 : 0, TOKENS.HOVER_LERP_RATE);
  });

  return <primitive object={mesh} />;
}

/**
 * Build the 3D mesh for a control button. The glyph (—, □, ×) is
 * extruded from primitives onto a rounded base.
 */
function buildControlMesh(variant: Variant): THREE.Group {
  const group = new THREE.Group();
  const base = makeRoundedBase(COLORS[variant], 1.4, 1.4, 0.18);
  base.position.z = -0.15;
  group.add(base);

  const glyphMat = makeMaterial(0xffffff, { roughness: 0.4 });

  if (variant === 'minimize') {
    // Horizontal bar
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.18), glyphMat);
    bar.position.set(0, -0.25, 0.18);
    group.add(bar);
  } else if (variant === 'maximize') {
    // Square outline (4 thin bars forming a frame)
    const W = 0.7;
    const T = 0.12;
    const positions: [number, number, number, number, number][] = [
      [0, W / 2, 0.18, W + T, T], // top
      [0, -W / 2, 0.18, W + T, T], // bottom
      [-W / 2, 0, 0.18, T, W], // left
      [W / 2, 0, 0.18, T, W], // right
    ];
    for (const [x, y, z, sw, sh] of positions) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, 0.18), glyphMat);
      bar.position.set(x, y, z);
      group.add(bar);
    }
  } else if (variant === 'close') {
    // X shape — two crossed bars
    const W = 0.9;
    const T = 0.16;
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(W, T, 0.18), glyphMat);
    bar1.rotation.z = Math.PI / 4;
    bar1.position.z = 0.18;
    group.add(bar1);
    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(W, T, 0.18), glyphMat);
    bar2.rotation.z = -Math.PI / 4;
    bar2.position.z = 0.18;
    group.add(bar2);
  }

  return group;
}
