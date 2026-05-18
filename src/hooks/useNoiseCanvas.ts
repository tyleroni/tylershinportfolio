import { useEffect } from 'react';

/**
 * Paint a grayscale random-noise texture into a <canvas>.
 *
 * The intrinsic canvas resolution is sized to (clientSize / GRAIN_PX), so
 * each noise pixel renders as a ~GRAIN_PX × GRAIN_PX block on screen. This
 * gives a CONSISTENT grain size regardless of how big the canvas is
 * displayed — a tiny 200px canvas and a huge 2000px canvas both end up
 * with ~3px speckle.
 *
 * Why this matters: the previous implementation used a fixed 400×300
 * intrinsic resolution. When CSS stretched that to e.g. 1600×800 on a
 * full-screen desktop, the x-scale was 4× and y-scale was 2.67× —
 * different stretches on each axis, so the noise pixels became RECTANGLES
 * instead of squares. The result looked like horizontal-weave camo
 * instead of a uniform charcoal speckle.
 *
 * We also listen for ResizeObserver so the intrinsic resolution updates
 * if the displayed size changes (window resize, devtools open, etc.) — the
 * pattern repaints to keep the grain size consistent.
 */
const GRAIN_PX = 3;

function paintNoise(canvas: HTMLCanvasElement) {
  // Size intrinsic resolution proportional to displayed size. Math.max
  // guards against zero-sized canvases (would crash createImageData).
  const w = Math.max(1, Math.floor(canvas.clientWidth / GRAIN_PX));
  const h = Math.max(1, Math.floor(canvas.clientHeight / GRAIN_PX));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export function useNoiseCanvas(ref: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    paintNoise(canvas);

    // Re-paint whenever the canvas's display size changes (responsive
    // layout, devtools toggle, etc.). The repaint produces a fresh
    // random pattern at the new intrinsic resolution — which IS a
    // visible change, but it's a deliberate trade-off: better to have a
    // fresh grain than stretched-rectangle camo.
    const ro = new ResizeObserver(() => paintNoise(canvas));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [ref]);
}

/**
 * Variant for the press-start screen — runs at 60fps for animated TV static.
 * Returns a "stop" function so the parent can cancel the loop when transitioning.
 */
export function useAnimatedNoiseCanvas(
  ref: React.RefObject<HTMLCanvasElement>,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;

    function tick() {
      if (cancelled || !canvas || !ctx) return;
      // Resize the intrinsic buffer to match displayed size, scaled down 3x
      // for the chunky-grain look
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth / 3));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight / 3));
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelled = true;
    };
  }, [ref, enabled]);
}
