import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Motif, Diamond } from "@/components/Motif";
import s from "./page.module.css";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Shield = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M8.5 12l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Heart = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" fill="var(--bone)" />
  </svg>
);
const Hands = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 21s-6.5-3.8-9-8c-1.5-2.5.2-6 3.2-6 1.8 0 2.9 1.1 3.8 2.3M12 21s6.5-3.8 9-8c1.5-2.5-.2-6-3.2-6-1.8 0-2.9 1.1-3.8 2.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8.6V13M9.6 10.8h4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        {/* ============ HERO ============ */}
        <section className={s.hero}>
          <div className="container">
            <div className={s.heroGrid}>
              <div className={s.heroCopy}>
                <span className="eyebrow reveal" style={{ animationDelay: "0.05s" }}>
                  Plateforme matrimoniale du Sahel
                </span>
                <h1 className={`${s.heroTitle} reveal`} style={{ animationDelay: "0.12s" }}>
                  Le mariage,<br />avec <em>sérieux</em><br />et <span className={s.clay}>respect</span>.
                </h1>
                <p className={`${s.heroSub} reveal`} style={{ animationDelay: "0.22s" }}>
                  Des profils vérifiés, un cadre fidèle à nos valeurs, et des
                  rencontres guidées par une intention sincère&nbsp;: fonder une
                  union qui dure. Du Mali au Sénégal.
                </p>
                <div className={`${s.heroCta} reveal`} style={{ animationDelay: "0.32s" }}>
                  <Link href="/inscription" className="btn btn--clay">
                    Créer mon profil
                  </Link>
                  <Link href="/connexion" className="btn btn--ghost">
                    J&apos;ai déjà un compte
                  </Link>
                </div>
                <div className={`${s.heroProof} reveal`} style={{ animationDelay: "0.42s" }}>
                  <div className={s.avatars}>
                    {[
                      { i: "A", c: "var(--clay)" },
                      { i: "F", c: "var(--indigo)" },
                      { i: "M", c: "var(--acacia)" },
                      { i: "S", c: "var(--gold)" },
                    ].map((a) => (
                      <span key={a.i} style={{ background: a.c }}>{a.i}</span>
                    ))}
                  </div>
                  <p className={s.proofText}>
                    <b>2&nbsp;400+ membres</b> engagés dans une démarche
                    sincère à travers le Sahel.
                  </p>
                </div>
              </div>

              {/* Hero visual */}
              <div className={`${s.heroVisual} reveal-fade`} style={{ animationDelay: "0.3s" }}>
                <div className={s.card}>
                  <div className={s.cardPortrait}>
                    <Motif className={s.cardMotif} color="#fff" />
                    <Diamond className={s.cardGlyph} color="var(--gold-soft)" />
                    <div className={s.cardName}>
                      <strong>Aïssata &amp; Ibrahim</strong>
                      <span>Mariés en 2025 · Niamey</span>
                    </div>
                  </div>
                  <div className={s.cardRow}>
                    <span className={s.verified}>
                      <Shield /> Profil vérifié
                    </span>
                    <span className={s.heart}><Heart /></span>
                  </div>
                </div>
                <div className={`${s.floatChip} ${s.chipTop}`}>
                  <span className={s.chipDot} /> Compatibilité 94%
                </div>
                <div className={`${s.floatChip} ${s.chipBot}`}>
                  <Shield /> Identité confirmée
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TRUST STRIP ============ */}
        <section className={s.strip}>
          <div className="container">
            <div className={s.stripInner}>
              {[
                { n: <>2,4<em>k</em></>, l: "Membres actifs" },
                { n: <>98<em>%</em></>, l: "Profils vérifiés" },
                { n: <>6</>, l: "Pays du Sahel" },
                { n: <>310<em>+</em></>, l: "Unions célébrées" },
              ].map((st, i) => (
                <div className={s.stat} key={i}>
                  <div className={s.statNum}>{st.n}</div>
                  <div className={s.statLabel}>{st.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ VALUES ============ */}
        <section className={s.section} id="valeurs">
          <div className="container">
            <div className={s.head}>
              <span className="eyebrow">Nos valeurs</span>
              <h2>Une rencontre qui honore qui vous êtes.</h2>
              <p>
                Union Sahélienne n&apos;est pas une application de rencontre comme
                les autres. C&apos;est un espace pensé pour le mariage, dans le
                respect des traditions et de la dignité de chacun.
              </p>
            </div>
            <div className={s.values}>
              <article className={s.valueCard}>
                <div className={s.valueIcon}><Shield /></div>
                <h3>Profils vérifiés</h3>
                <p>
                  Chaque membre confirme son identité. Vous échangez avec des
                  personnes réelles, sérieuses et engagées — jamais de faux profils.
                </p>
              </article>
              <article className={s.valueCard}>
                <div className={s.valueIcon}><Hands /></div>
                <h3>Respect des valeurs</h3>
                <p>
                  Un cadre fidèle à nos cultures et à notre foi, où la pudeur et
                  l&apos;intention de mariage guident chaque échange.
                </p>
              </article>
              <article className={s.valueCard}>
                <div className={s.valueIcon}><Heart /></div>
                <h3>Des intentions sincères</h3>
                <p>
                  Un équilibre respecté entre les membres et un accompagnement
                  attentif, pour des rencontres qui mènent à l&apos;essentiel&nbsp;: l&apos;union.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ============ PARCOURS ============ */}
        <section className={`${s.section} ${s.parcours}`} id="parcours">
          <div className="container">
            <div className={s.head}>
              <span className="eyebrow">Comment ça marche</span>
              <h2>Trois étapes vers une union sincère.</h2>
            </div>
            <div className={s.steps}>
              {[
                { t: "Créez votre profil", d: "Inscrivez-vous et présentez qui vous êtes, vos valeurs et vos attentes. Confirmez votre identité pour rejoindre une communauté de confiance." },
                { t: "Découvrez des profils", d: "Parcourez des profils compatibles, présentés avec soin et respect. Manifestez votre intérêt à ceux qui partagent votre vision." },
                { t: "Échangez en confiance", d: "Lorsque l'intérêt est mutuel, ouvrez un dialogue privé et serein, dans un cadre protégé, pour avancer vers le mariage." },
              ].map((st, i) => (
                <div className={s.step} key={i}>
                  <div className={s.stepLine} />
                  <div className={s.stepNum}>{i + 1}</div>
                  <h3>{st.t}</h3>
                  <p>{st.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ OFFRES ============ */}
        <section className={s.section} id="offres">
          <div className="container">
            <div className={`${s.head} ${s.center}`}>
              <span className="eyebrow">Nos offres</span>
              <h2>Choisissez votre formule.</h2>
              <p>Commencez gratuitement. Passez à une formule supérieure quand vous êtes prêt à vous engager pleinement.</p>
            </div>
            <div className={s.plans}>
              <article className={s.plan}>
                <h3 className={s.planName}>Découverte</h3>
                <p className={s.planDesc}>Pour faire vos premiers pas en toute liberté.</p>
                <div className={s.planPrice}><strong>0</strong><span>FCFA / mois</span></div>
                <ul className={s.planList}>
                  <li><Check /> Profil vérifié</li>
                  <li><Check /> Parcourir les profils</li>
                  <li><Check /> 3 marques d&apos;intérêt / mois</li>
                </ul>
                <Link href="/inscription" className="btn btn--ghost btn--block">Commencer</Link>
              </article>

              <article className={`${s.plan} ${s.planFeatured}`}>
                <span className={s.planBadge}>Le plus choisi</span>
                <h3 className={s.planName}>Engagement</h3>
                <p className={s.planDesc}>Pour rencontrer sérieusement, sans limite.</p>
                <div className={s.planPrice}><strong>9&nbsp;000</strong><span>FCFA / mois</span></div>
                <ul className={s.planList}>
                  <li><Check /> Tout l&apos;offre Découverte</li>
                  <li><Check /> Marques d&apos;intérêt illimitées</li>
                  <li><Check /> Messagerie privée complète</li>
                  <li><Check /> Mise en avant du profil</li>
                </ul>
                <Link href="/inscription" className="btn btn--clay btn--block">Choisir Engagement</Link>
              </article>

              <article className={s.plan}>
                <h3 className={s.planName}>Prestige</h3>
                <p className={s.planDesc}>Un accompagnement personnalisé et discret.</p>
                <div className={s.planPrice}><strong>25&nbsp;000</strong><span>FCFA / mois</span></div>
                <ul className={s.planList}>
                  <li><Check /> Tout l&apos;offre Engagement</li>
                  <li><Check /> Conseiller dédié</li>
                  <li><Check /> Sélection de profils sur-mesure</li>
                </ul>
                <Link href="/inscription" className="btn btn--ghost btn--block">Choisir Prestige</Link>
              </article>
            </div>
          </div>
        </section>

        {/* ============ CLOSING ============ */}
        <section className={`${s.section} ${s.closing}`}>
          <div className="container">
            <div className={s.closeCard}>
              <Motif className={s.closeMotif} color="#fff" />
              <h2>Votre histoire commence ici.</h2>
              <p>
                Rejoignez des milliers de membres du Sahel qui ont choisi une
                voie sincère vers le mariage. Votre profil, en quelques minutes.
              </p>
              <div className={s.closeCta}>
                <Link href="/inscription" className="btn">Créer mon profil</Link>
                <Link href="/connexion" className="btn btn--ghost">Se connecter</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
