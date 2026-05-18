import { useRef } from 'react';
import { useTypingBio } from '@/hooks/useTypingBio';
import { BIO_LINES } from '@/config/bio-lines';
import styles from './BioTerminal.module.scss';

/**
 * Top-left of the desktop: a small terminal-style block where commands
 * type out and output appears below them, cycling through BIO_LINES.
 *
 * The first line is pre-rendered (so there's no blank period on initial
 * load); the useTypingBio hook handles all subsequent transitions.
 */
export default function BioTerminal() {
  const cmdRef = useRef<HTMLSpanElement>(null);
  const outRef = useRef<HTMLDivElement>(null);

  useTypingBio(cmdRef, outRef);

  const first = BIO_LINES[0];

  return (
    <div className={styles.terminal}>
      <div className={styles.cmd}>
        <span className={styles.prompt}>&gt;</span>
        <span ref={cmdRef} className={styles.cmdText}>
          {first.cmd}
        </span>
        <span className={styles.cursor}>_</span>
      </div>
      <div ref={outRef} className={styles.out}>
        {first.out}
      </div>
    </div>
  );
}
