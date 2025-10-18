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
            <NavLink>Docs</NavLink>
            <NavLink>Roadmap</NavLink>
            <NavLink>Discord</NavLink>
            <NavLink>GitHub</NavLink>
          </div>
          <div className={styles.navRight}>
            <ChipBtn variant="outline" label="Get Started" />
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
          <ChipBtn variant="outline" label="Documentation" />
        </div>
      </div>
    </div>
  );
}

function ChipBtn({
  label,
  variant = "solid",
  leadingDot = false,
}: {
  label: string;
  variant?: "solid" | "outline" | "ghost";
  leadingDot?: boolean;
}) {
  const variantClass = variant === "solid" ? styles.chipBtnSolid 
    : variant === "outline" ? styles.chipBtnOutline 
    : styles.chipBtnGhost;
    
  return (
    <button className={`${styles.chipBtn} ${variantClass}`}>
      {leadingDot ? <span className={styles.leadingDot} /> : null}
      <span>{label}</span>
      <svg className={styles.btnIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z" clipRule="evenodd" />
      </svg>
    </button>
  );
}

function NavLink({ children }: { children: React.ReactNode }) {
  return (
    <a href="#" className={styles.navLink}>
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