import { useEffect, useState } from 'react';
import styles from './SystemTray.module.scss';

/**
 * Bottom-right system tray clock + date.
 * Updates once per second. Format: M/D/YYYY on top, HH:MM (24hr) below.
 */
export default function SystemTray() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Update every second. Cleared when the component unmounts.
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${h}:${m}`;

  return (
    <div className={styles.tray}>
      <div className={styles.date}>{dateStr}</div>
      <div className={styles.time}>{timeStr}</div>
    </div>
  );
}
