"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Diamond } from "./Motif";
import styles from "./SiteNav.module.css";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Union Sahélienne, accueil">
          <Diamond className={styles.brandMark} color="var(--clay)" />
          <span className={styles.brandText}>
            Union <em>Sahélienne</em>
          </span>
        </Link>

        <nav className={`${styles.links} ${open ? styles.linksOpen : ""}`}>
          <a href="/#valeurs" onClick={() => setOpen(false)}>Nos valeurs</a>
          <a href="/#parcours" onClick={() => setOpen(false)}>Comment ça marche</a>
          <a href="/#offres" onClick={() => setOpen(false)}>Nos offres</a>
          <Link href="/connexion" className={styles.signin} onClick={() => setOpen(false)}>
            Se connecter
          </Link>
          <Link href="/inscription" className="btn btn--clay" onClick={() => setOpen(false)}>
            Commencer
          </Link>
        </nav>

        <button
          className={styles.burger}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
