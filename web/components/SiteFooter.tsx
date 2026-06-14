import Link from "next/link";
import { Diamond, Motif } from "./Motif";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Motif className={styles.band} color="var(--gold-soft)" opacity={0.5} />
      <div className={`container ${styles.inner}`}>
        <div className={styles.lead}>
          <div className={styles.brand}>
            <Diamond className={styles.mark} color="var(--gold-soft)" />
            <span>Union <em>Sahélienne</em></span>
          </div>
          <p className={styles.tag}>
            Le mariage, avec sérieux et respect. Pour des unions sincères à travers le Sahel.
          </p>
        </div>

        <div className={styles.cols}>
          <div>
            <h4>Plateforme</h4>
            <a href="/#valeurs">Nos valeurs</a>
            <a href="/#parcours">Comment ça marche</a>
            <a href="/#offres">Nos offres</a>
          </div>
          <div>
            <h4>Compte</h4>
            <Link href="/inscription">Créer un profil</Link>
            <Link href="/connexion">Se connecter</Link>
          </div>
          <div>
            <h4>Régions</h4>
            <span>Mali · Niger · Burkina</span>
            <span>Tchad · Mauritanie · Sénégal</span>
          </div>
        </div>
      </div>

      <div className={`container ${styles.base}`}>
        <span>© {new Date().getFullYear()} Union Sahélienne. Tous droits réservés.</span>
        <span className={styles.legal}>
          <a href="#">Confidentialité</a>
          <a href="#">Conditions</a>
        </span>
      </div>
    </footer>
  );
}
