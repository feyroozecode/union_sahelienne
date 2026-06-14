"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Diamond } from "@/components/Motif";
import { getUser, getToken, clearSession } from "@/lib/session";
import type { AuthUser } from "@/lib/api";
import s from "./espace.module.css";

export default function EspacePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/connexion");
      return;
    }
    setUser(getUser());
    setReady(true);
  }, [router]);

  if (!ready) return null;

  const name = user?.firstName || "bienvenue";

  function logout() {
    clearSession();
    router.push("/");
  }

  return (
    <div className={s.page}>
      <header className={s.bar}>
        <Link href="/" className={s.brand}>
          <Diamond className={s.mark} color="var(--clay)" />
          <span>Union <em>Sahélienne</em></span>
        </Link>
        <button className="btn btn--ghost" onClick={logout}>Se déconnecter</button>
      </header>

      <main className={s.main}>
        <span className="eyebrow">Votre espace</span>
        <h1 className={s.hello}>Bonjour, {name}.</h1>
        <p className={s.lead}>
          Votre compte est activé. Voici les premières étapes pour donner toutes
          ses chances à votre profil.
        </p>

        <div className={s.cards}>
          <article className={s.todo}>
            <div className={s.todoNum}>1</div>
            <h3>Complétez votre profil</h3>
            <p>Ajoutez une photo et quelques mots sur vous pour inspirer confiance.</p>
            <span className={s.soon}>Bientôt disponible</span>
          </article>
          <article className={s.todo}>
            <div className={s.todoNum}>2</div>
            <h3>Vérifiez votre identité</h3>
            <p>La vérification renforce la confiance et débloque plus de profils.</p>
            <span className={s.soon}>Bientôt disponible</span>
          </article>
          <article className={s.todo}>
            <div className={s.todoNum}>3</div>
            <h3>Découvrez des profils</h3>
            <p>Parcourez des personnes compatibles et manifestez votre intérêt.</p>
            <span className={s.soon}>Bientôt disponible</span>
          </article>
        </div>

        <div className={s.note}>
          L&apos;application mobile Union Sahélienne offre l&apos;expérience complète —
          messagerie, profils détaillés et notifications.
        </div>
      </main>
    </div>
  );
}
