import BioTerminal from './BioTerminal';
import MiniIcon from './MiniIcon';
import {
  buildGithubIcon,
  buildLinkedinIcon,
  buildEmailIcon,
  buildPowerIcon,
} from '../icon-3d/mini-icons';
import styles from './Header.module.scss';

type Props = {
  onPowerClick: () => void;
};

/**
 * The top header bar on the desktop.
 *
 * Left side: terminal-style bio (commands type, lines cycle).
 * Right side: 4 mini 3D icons — GitHub, LinkedIn, Email, Power.
 *
 * The header always spans the full TV-screen width (edge-to-edge),
 * NOT constrained by the content-band max width. This is intentional:
 * the bio and icons want to anchor to the corners on any monitor size.
 */
export default function Header({ onPowerClick }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <BioTerminal />
      </div>
      <div className={styles.right}>
        <MiniIcon
          build={buildGithubIcon}
          ariaLabel="GitHub"
          onClick={() => window.open('https://github.com/tyleroni', '_blank', 'noopener,noreferrer')}
        />
        <MiniIcon
          build={buildLinkedinIcon}
          ariaLabel="LinkedIn"
          onClick={() => window.open('https://linkedin.com/in/tylerjshin', '_blank', 'noopener,noreferrer')}
        />
        <MiniIcon
          build={buildEmailIcon}
          ariaLabel="Email"
          onClick={() => (window.location.href = 'mailto:tylerjunoshin@gmail.com')}
        />
        <MiniIcon build={buildPowerIcon} ariaLabel="Power off" onClick={onPowerClick} />
      </div>
    </header>
  );
}
