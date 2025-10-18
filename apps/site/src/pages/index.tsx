import React from 'react';
import styles from './index.module.css';

export default function Page() {
  return <GrokCliHero />;
}

function GrokCliHero() {
  return (
    <div className={styles.hero}>
      {/* === LIGHT STACK =================================================== */}
      <div className={styles.lightStack} aria-hidden>
        <div className={styles.lightGradient1} />
        <div className={styles.lightGradient2} />
        <div className={styles.lightOverlay1} />
        <div className={styles.lightOverlay2} />
      </div>

      {/* === CONTENT ======================================================= */}
      <div className={styles.content}>
        {/* Top nav */}
        <div className={styles.topNav}>
          <div className={styles.navLeft}>
            <LogoMark />
            <NavLink href="/docs/overview">Docs</NavLink>
            <NavLink href="/docs/roadmap">Roadmap</NavLink>
            <NavLink href="https://discord.com/channels/1315720379607679066/1315822328139223064">Discord</NavLink>
            <NavLink href="https://github.com/hinetapora/grok-cli-hurry-mode">GitHub</NavLink>
          </div>
          <div className={styles.navRight}>
            <ChipBtn variant="outline" label="Get Started" href="/docs/getting-started/installation" />
          </div>
        </div>

        {/* Hero center row */}
        <div className={styles.heroCenter}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Claude Code-Level Intelligence in Your Terminal
            </h1>

            {/* Single hero pill */}
            <div className={styles.heroButtons}>
              <ChipBtn variant="solid" label="npm install -g grok-cli-hurry-mode@latest" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom overlays aligned to main container width */}
      <div className={styles.bottomOverlay}>
        <div className={styles.bottomContent}>
          <div className={styles.bottomIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={styles.arrowIcon}>
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
          </div>
          <ChipBtn variant="outline" label="Documentation" href="/docs/overview" />
        </div>
      </div>

      {/* X.AI Style Hero Card */}
      <div className={styles.heroCardContainer}>
        <div className={styles.heroCard}>
          <div className={styles.heroCardBackground}>
            <video className={styles.heroCardVideo} autoPlay muted loop playsInline>
              <source src="/img/grok-hero-video.mp4" type="video/mp4" />
            </video>
          </div>
          <div className={styles.heroCardOverlay}></div>
          <div className={styles.heroCardContent}>
            <div className={styles.heroCardText}>
              <h3 className={styles.heroCardTitle}>Grok CLI</h3>
              <p className={styles.heroCardDescription}>Experience Claude Code-level intelligence in your terminal. Built for developers who need powerful AI assistance without leaving their workflow.</p>
              
              <div className={styles.featureGrid}>
                <div className={styles.featureItem}>
                  <strong className={styles.featureLabel}>Modalities</strong>
                  <span className={styles.featureValue}>🗣️ → 📝</span>
                </div>
                <div className={styles.featureItem}>
                  <strong className={styles.featureLabel}>Tools Available</strong>
                  <span className={styles.featureValue}>15+</span>
                </div>
              </div>

              <div className={styles.featureList}>
                <ul>
                  <li>Advanced file operations</li>
                  <li>Code-aware editing</li>
                  <li>Multi-file transactions</li>
                  <li>Web integration</li>
                  <li>MCP protocol support</li>
                </ul>
              </div>
            </div>

            <div className={styles.cardActions}>
              <a className={styles.btnPrimary} href="/docs/getting-started/installation">Get Started</a>
              <a className={styles.btnSecondary} href="/docs/getting-started/quickstart">View Quickstart</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChipBtn({
  label,
  variant = "solid",
  leadingDot = false,
  href,
}: {
  label: string;
  variant?: "solid" | "outline" | "ghost";
  leadingDot?: boolean;
  href?: string;
}) {
  const variantClass = variant === "solid" ? styles.chipBtnSolid 
    : variant === "outline" ? styles.chipBtnOutline 
    : styles.chipBtnGhost;
    
  const Element = href ? 'a' : 'button';
  
  return (
    <Element 
      className={`${styles.chipBtn} ${variantClass}`}
      {...(href ? { href } : {})}
    >
      {leadingDot ? <span className={styles.leadingDot} /> : null}
      <span>{label}</span>
      <svg className={styles.btnIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z" clipRule="evenodd" />
      </svg>
    </Element>
  );
}

function NavLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a href={href} className={styles.navLink}>
      {children}
    </a>
  );
}

function LogoMark() {
  return (
    <div className={styles.logo}>
      <div className={styles.logoIcon}>
        G
      </div>
      <span className={styles.logoText}>grok-cli</span>
    </div>
  );
}