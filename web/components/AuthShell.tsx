import Link from "next/link";
import { Diamond, Motif } from "./Motif";
import styles from "./AuthShell.module.css";

export function AuthShell({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: { quote: string; author: string };
}) {
  return (
    <div className={styles.wrap}>
      {/* Editorial brand panel */}
      <aside className={styles.aside}>
        <Motif className={styles.asideBand} color="var(--gold-soft)" opacity={0.35} />
        <Link href="/" className={styles.brand}>
          <Diamond className={styles.brandMark} color="var(--gold-soft)" />
          <span>Union <em>Sahélienne</em></span>
        </Link>
        <div className={styles.asideBody}>
          <p className={styles.quote}>
            {aside?.quote ??
              "Le mariage est la moitié de la foi. Faites le premier pas, avec sérieux et confiance."}
          </p>
          <p className={styles.author}>{aside?.author ?? "Union Sahélienne"}</p>
        </div>
        <div className={styles.asideFoot}>
          <span className={styles.dot} /> Profils vérifiés · Cadre respectueux · Intentions sincères
        </div>
      </aside>

      {/* Form column */}
      <main className={styles.main}>
        <div className={styles.formCol}>{children}</div>
      </main>
    </div>
  );
}
