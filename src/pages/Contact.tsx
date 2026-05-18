import styles from './page.module.scss';

/**
 * Contact page. Rendered when the Recycle Bin tab (Contact) is active.
 * Lists ways to get in touch — email, social, etc.
 */
export default function Contact() {
  const links = [
    { label: 'Email', value: 'tylerjunoshin@gmail.com', href: 'mailto:tylerjunoshin@gmail.com' },
    { label: 'GitHub', value: 'github.com/tyleroni', href: 'https://github.com/tyleroni' },
    { label: 'LinkedIn', value: 'linkedin.com/in/tylerjshin', href: 'https://linkedin.com/in/tylerjshin' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Contact</h1>
          <p className={styles.subtitle}>open to work · let's build something</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.h2}>$ ways_to_reach_me</h2>
          <ul className={styles.stackList}>
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={{ textDecoration: 'none' }}
                >
                  {link.label} — {link.value}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>$ based_in</h2>
          <p>Los Angeles &amp; San Diego, California. Available for remote work globally.</p>
        </section>
      </div>
    </div>
  );
}
