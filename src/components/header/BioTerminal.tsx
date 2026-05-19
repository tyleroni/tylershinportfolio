import { useEffect, useRef } from 'react';
import { BIO_LINES } from '@/config/bio-lines';
import styles from './BioTerminal.module.scss';

/* ============================================================
   POSITION OFFSETS

   PRINCIPLE: If you change anything that affects `promptWidth` (e.g. the
   prompt's margin-right in CSS), the avatar's position will shift by the
   same amount because both top_/bottom_getNessLeft use promptWidth as the
   base. To keep the avatar visually anchored: when you add N pixels of
   spacing to promptWidth, SUBTRACT N from TOP_OFFSET and BOTTOM_OFFSET.
   Net effect: text shifts, avatar stays.

   These offsets were tuned in the standalone preview (Departure Mono).
   The project uses JetBrains Mono so they may need ±5-10px adjustment
   to look pixel-perfect — but the math is measurement-based so the
   relative positioning still works correctly.
   ============================================================ */

const TOP_OFFSET = 65; // sprite-left = textEndX + TOP_OFFSET
const BOTTOM_OFFSET = 75; // sprite-left = textStartX - SPRITE_SIZE + BOTTOM_OFFSET

// Mirror X compensation. The Ness GIF has asymmetric transparent padding,
// so when scaleX(-1) is applied (facing left), the visible body shifts
// sideways within the bounding box. This offset is added to sprite-left
// whenever Ness is facing left, keeping his visible body anchored.
const MIRROR_X_OFFSET = 7;

// Fixed hop duration — snappy direction flip. Used for both same-row hops
// and the relevant half of cross-row transitions.
const HOP_DURATION = 400;

// Walk duration — the lerp between rows in cross-row transitions.
const TRANSITION_DURATION = 800;

// Pause between phases when text is settled.
const HOLD_DURATION = 300;

// Typewriter speed.
const MS_PER_CHAR = 80;

// Sprite size in pixels.
const SPRITE_SIZE = 64;

// Both the text reveal AND Ness's position complete at this fraction of
// raw phase progress, not at 1.0. Avoids the triple-stutter at phase end.
const TEXT_COMPLETION_FRACTION = 0.92;

// ============================================================
// PHASE MODEL
// ============================================================

type PhaseName = 'writeCmd' | 'writeOut' | 'eraseOut' | 'eraseCmd';
type RuntimePhase = PhaseName | 'hold' | 'transition';
type RowName = 'top' | 'bottom';
type Direction = 'left' | 'right';

type PhaseConfig = {
  row: RowName;
  direction: Direction;
  target: 'cmd' | 'out';
};

const PHASE_ORDER: PhaseName[] = ['writeCmd', 'writeOut', 'eraseOut', 'eraseCmd'];

const PHASE_CONFIG: Record<PhaseName, PhaseConfig> = {
  writeCmd: { row: 'top', direction: 'right', target: 'cmd' },
  writeOut: { row: 'bottom', direction: 'left', target: 'out' },
  eraseOut: { row: 'bottom', direction: 'right', target: 'out' },
  eraseCmd: { row: 'top', direction: 'left', target: 'cmd' },
};

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Bio terminal with an animated Ness sprite that walks across two terminal
 * rows, writing and erasing bio lines.
 *
 * Phases cycle: writeCmd → hold → transition → writeOut → ... and so on,
 * with hop-flip animations for direction changes, an in-place flip for
 * same-row transitions, and a walk-and-hop combo for cross-row transitions.
 *
 * All measurements (charWidth, promptWidth, row positions) come from the
 * actual rendered DOM, so the layout adapts to font and viewport changes.
 */
export default function BioTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const rowCmdRef = useRef<HTMLDivElement>(null);
  const rowOutRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLSpanElement>(null);
  const cmdTextRef = useRef<HTMLSpanElement>(null);
  const outTextRef = useRef<HTMLSpanElement>(null);
  const measurerRef = useRef<HTMLSpanElement>(null);
  const nessRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const terminal = terminalRef.current;
    const rowCmd = rowCmdRef.current;
    const rowOut = rowOutRef.current;
    const prompt = promptRef.current;
    const cmdText = cmdTextRef.current;
    const outText = outTextRef.current;
    const measurer = measurerRef.current;
    const ness = nessRef.current;

    if (!terminal || !rowCmd || !rowOut || !prompt || !cmdText || !outText || !measurer || !ness) {
      return;
    }

    // ----- MEASUREMENTS -----
    let charWidth = 13;
    let promptWidth = 24;
    let yTop = 0;
    let yBot = 0;
    let ready = false;

    function measure() {
      measurer!.textContent = 'MMMMMMMMMM';
      charWidth = measurer!.getBoundingClientRect().width / 10;

      const promptRect = prompt!.getBoundingClientRect();
      const rowRect = rowCmd!.getBoundingClientRect();
      promptWidth = promptRect.right - rowRect.left + 18;
      terminal!.style.setProperty('--prompt-indent', `${promptWidth}px`);

      const tr = terminal!.getBoundingClientRect();
      const cr = rowCmd!.getBoundingClientRect();
      const or = rowOut!.getBoundingClientRect();
      yTop = cr.top - tr.top + (cr.height - SPRITE_SIZE) / 2;
      yBot = or.top - tr.top + (or.height - SPRITE_SIZE) / 2;

      ready = true;
    }

    document.fonts.ready.then(measure);

    const resizeObserver = new ResizeObserver(() => {
      if (ready) measure();
    });
    resizeObserver.observe(terminal);

    // ----- ANIMATION STATE -----
    let bioIndex = 0;
    let phase: RuntimePhase = 'writeCmd';
    let phaseStartTime = 0;
    let prePhase: PhaseName | null = null;
    let transitionFrom = { x: 0, y: 0 };
    let transitionTo = { x: 0, y: 0 };
    let rafId = 0;

    // ----- TEXT PROGRESS / PHASE GEOMETRY -----

    function textProgress(rawProgress: number) {
      return Math.min(1, rawProgress / TEXT_COMPLETION_FRACTION);
    }

    function top_visibleCharCount(phaseName: PhaseName, progress: number) {
      const line = BIO_LINES[bioIndex];
      const tp = textProgress(progress);
      if (phaseName === 'writeCmd') return tp * line.cmd.length;
      return (1 - tp) * line.cmd.length;
    }

    function top_getNessLeft(phaseName: PhaseName, progress: number) {
      const textEndX = promptWidth + top_visibleCharCount(phaseName, progress) * charWidth;
      return textEndX + TOP_OFFSET;
    }

    function bottom_leadingCharIdx(phaseName: PhaseName, progress: number) {
      const line = BIO_LINES[bioIndex];
      const tp = textProgress(progress);
      if (phaseName === 'writeOut') return (1 - tp) * line.out.length;
      return tp * line.out.length;
    }

    function bottom_getNessLeft(phaseName: PhaseName, progress: number) {
      const textStartX = promptWidth + bottom_leadingCharIdx(phaseName, progress) * charWidth;
      return textStartX - SPRITE_SIZE + BOTTOM_OFFSET;
    }

    function computeNessLeft(phaseName: PhaseName, progress: number) {
      return PHASE_CONFIG[phaseName].row === 'top'
        ? top_getNessLeft(phaseName, progress)
        : bottom_getNessLeft(phaseName, progress);
    }

    function computeNessEndLeft(phaseName: PhaseName) {
      return computeNessLeft(phaseName, 1.0);
    }

    function getPhasePosition(phaseName: PhaseName, endpoint: 'start' | 'end') {
      const cfg = PHASE_CONFIG[phaseName];
      const progress = endpoint === 'start' ? 0 : 1;
      return {
        x: computeNessLeft(phaseName, progress),
        y: cfg.row === 'top' ? yTop : yBot,
      };
    }

    // ----- PHASE MACHINE -----

    function getPhaseDuration(p: RuntimePhase): number {
      if (p === 'transition') {
        const sameRow = Math.abs(transitionTo.y - transitionFrom.y) < 1;
        return sameRow ? HOP_DURATION : HOP_DURATION + TRANSITION_DURATION;
      }
      if (p === 'hold') return HOLD_DURATION;
      const cfg = PHASE_CONFIG[p];
      const line = BIO_LINES[bioIndex];
      const text = cfg.target === 'cmd' ? line.cmd : line.out;
      return text.length * MS_PER_CHAR;
    }

    function advancePhase(now: number) {
      if (phase === 'transition' && prePhase) {
        phase = prePhase;
        prePhase = null;
      } else if (phase === 'hold' && prePhase) {
        const idx = PHASE_ORDER.indexOf(prePhase);
        let nextPhase: PhaseName;
        if (idx === PHASE_ORDER.length - 1) {
          bioIndex = (bioIndex + 1) % BIO_LINES.length;
          nextPhase = PHASE_ORDER[0];
        } else {
          nextPhase = PHASE_ORDER[idx + 1];
        }
        transitionFrom = getPhasePosition(prePhase, 'end');
        transitionTo = getPhasePosition(nextPhase, 'start');
        prePhase = nextPhase;
        phase = 'transition';
      } else if (phase !== 'transition' && phase !== 'hold') {
        prePhase = phase as PhaseName;
        phase = 'hold';
      }
      phaseStartTime = now;
    }

    // ----- RENDER -----

    function renderState(p: PhaseName, progress: number) {
      const line = BIO_LINES[bioIndex];
      const tp = textProgress(progress);

      if (p === 'writeCmd') {
        const len = Math.floor(tp * line.cmd.length);
        cmdText!.textContent = line.cmd.substring(0, len);
        outText!.textContent = '';
      } else if (p === 'writeOut') {
        cmdText!.textContent = line.cmd;
        const len = Math.floor(tp * line.out.length);
        const visible = line.out.substring(line.out.length - len);
        outText!.textContent = ' '.repeat(line.out.length - len) + visible;
      } else if (p === 'eraseOut') {
        cmdText!.textContent = line.cmd;
        const len = Math.floor((1 - tp) * line.out.length);
        const visible = line.out.substring(line.out.length - len);
        outText!.textContent = ' '.repeat(line.out.length - len) + visible;
      } else {
        const len = Math.floor((1 - tp) * line.cmd.length);
        cmdText!.textContent = line.cmd.substring(0, len);
        outText!.textContent = '';
      }
    }

    function applyNess(left: number, row: RowName, facingLeft: boolean) {
      const compensatedLeft = facingLeft ? left + MIRROR_X_OFFSET : left;
      ness!.style.left = `${compensatedLeft}px`;
      ness!.style.top = `${row === 'top' ? yTop : yBot}px`;
      ness!.style.width = `${SPRITE_SIZE}px`;
      ness!.style.height = `${SPRITE_SIZE}px`;
      ness!.classList.toggle(styles.facingLeft, facingLeft);
    }

    function render(now: number) {
      if (!ready) return;

      const elapsed = now - phaseStartTime;
      const duration = getPhaseDuration(phase);
      const progress = Math.max(0, Math.min(1, elapsed / duration));

      if (phase === 'transition' && prePhase) {
        const sameRow = Math.abs(transitionTo.y - transitionFrom.y) < 1;
        const nextIdx = PHASE_ORDER.indexOf(prePhase);
        const justEndedPhase = PHASE_ORDER[(nextIdx + PHASE_ORDER.length - 1) % PHASE_ORDER.length];
        const prevFacingLeft = PHASE_CONFIG[justEndedPhase].direction === 'left';
        const nextFacingLeft = PHASE_CONFIG[prePhase].direction === 'left';

        let x: number, y: number, facingLeft: boolean;

        if (sameRow) {
          // HOP IN PLACE
          const hopHeight = SPRITE_SIZE * 0.4;
          const hopOffset = 4 * progress * (1 - progress) * hopHeight;
          x = transitionFrom.x;
          y = transitionFrom.y - hopOffset;
          facingLeft = progress < 0.5 ? prevFacingLeft : nextFacingLeft;
        } else {
          // CROSS-ROW: walk-first for writeCmd→writeOut, hop-first otherwise
          const walkFirst = justEndedPhase === 'writeCmd';
          const totalMs = HOP_DURATION + TRANSITION_DURATION;
          const elapsedMs = progress * totalMs;

          if (walkFirst) {
            if (elapsedMs < TRANSITION_DURATION) {
              const walkProgress = elapsedMs / TRANSITION_DURATION;
              const eased = easeInOut(walkProgress);
              x = transitionFrom.x + (transitionTo.x - transitionFrom.x) * eased;
              y = transitionFrom.y + (transitionTo.y - transitionFrom.y) * eased;
              facingLeft = prevFacingLeft;
            } else {
              const hopProgress = (elapsedMs - TRANSITION_DURATION) / HOP_DURATION;
              const hopHeight = SPRITE_SIZE * 0.4;
              const hopOffset = 4 * hopProgress * (1 - hopProgress) * hopHeight;
              x = transitionTo.x;
              y = transitionTo.y - hopOffset;
              facingLeft = hopProgress < 0.5 ? prevFacingLeft : nextFacingLeft;
            }
          } else {
            if (elapsedMs < HOP_DURATION) {
              const hopProgress = elapsedMs / HOP_DURATION;
              const hopHeight = SPRITE_SIZE * 0.4;
              const hopOffset = 4 * hopProgress * (1 - hopProgress) * hopHeight;
              x = transitionFrom.x;
              y = transitionFrom.y - hopOffset;
              facingLeft = hopProgress < 0.5 ? prevFacingLeft : nextFacingLeft;
            } else {
              const walkProgress = (elapsedMs - HOP_DURATION) / TRANSITION_DURATION;
              const eased = easeInOut(walkProgress);
              x = transitionFrom.x + (transitionTo.x - transitionFrom.x) * eased;
              y = transitionFrom.y + (transitionTo.y - transitionFrom.y) * eased;
              facingLeft = nextFacingLeft;
            }
          }
        }

        ness!.style.left = `${facingLeft ? x + MIRROR_X_OFFSET : x}px`;
        ness!.style.top = `${y}px`;
        ness!.style.width = `${SPRITE_SIZE}px`;
        ness!.style.height = `${SPRITE_SIZE}px`;
        ness!.classList.toggle(styles.facingLeft, facingLeft);

        renderState(justEndedPhase, 1.0);
        return;
      }

      if (phase === 'hold' && prePhase) {
        renderState(prePhase, 1.0);
        const cfg = PHASE_CONFIG[prePhase];
        const x = computeNessEndLeft(prePhase);
        applyNess(x, cfg.row, cfg.direction === 'left');
        return;
      }

      // Real phase
      const realPhase = phase as PhaseName;
      const cfg = PHASE_CONFIG[realPhase];
      renderState(realPhase, progress);

      const spriteLeft = computeNessLeft(realPhase, progress);
      const maxX = terminal!.clientWidth - SPRITE_SIZE;
      const clampedLeft = Math.max(-SPRITE_SIZE * 0.25, Math.min(maxX, spriteLeft));

      applyNess(clampedLeft, cfg.row, cfg.direction === 'left');
    }

    function frame(now: number) {
      if (ready) {
        if (phaseStartTime === 0) phaseStartTime = now;
        const elapsed = now - phaseStartTime;
        const duration = getPhaseDuration(phase);
        if (elapsed >= duration) advancePhase(now);
        render(now);
      }
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);

  const first = BIO_LINES[0];

  return (
    <div ref={terminalRef} className={styles.terminal}>
      <div ref={rowCmdRef} className={styles.row}>
        <span ref={promptRef} className={styles.prompt}>
          &gt;
        </span>
        <span ref={cmdTextRef} className={styles.text}>
          {first.cmd}
        </span>
      </div>
      <div ref={rowOutRef} className={styles.row}>
        <span ref={outTextRef} className={`${styles.text} ${styles.muted}`} />
      </div>
      <span ref={measurerRef} className={styles.measurer} aria-hidden="true">
        M
      </span>
      <img
        ref={nessRef}
        src="/ness.gif"
        alt=""
        aria-hidden="true"
        className={styles.ness}
      />
    </div>
  );
}
