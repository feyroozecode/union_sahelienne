# Union Sahélienne — Admin Panel

Interface d'administration Next.js pour la plateforme Union Sahélienne.

## Pages

- **Dashboard** — 8 KPI, graphique inscriptions 30j, répartition par genre
- **Utilisateurs** — tableau paginé, filtre rôle, détail, désactiver/supprimer
- **Paiements** — reçus Wave, validation/rejet
- **Profils** — documents d'identité, vérification
- **Matches** — statuts avec filtre
- **File d'attente** — quota 75/25, déblocage
- **Admins** — gestion des administrateurs
- **Paramètres** — changement mot de passe

## Développement

```bash
npm install
npm run dev        # → http://localhost:3022
```

L'API backend doit tourner sur http://localhost:3020.
