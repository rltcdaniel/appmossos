# MossosPrep — integració SEO segura (11/08/2026)

Aquest directori parteix del repositori `appmossos-main.zip` aportat pel propietari i integra les millores SEO sense substituir l’aplicació.

## Què s’ha preservat
- `app.html`: app.html conserva íntegra la lògica, dades, Stripe, PWA i JavaScript; només s’han canviat dues metadades al <head> (descripció i robots noindex).
- `sw.js`, `manifest.webmanifest`, `cookie-consent.js`, `CNAME`, `ads.txt`, icones, Stripe i la resta de fitxers funcionals s’han conservat.
- Les pàgines de blog existents no s’han redirigit ni eliminat: mantenen les seves URLs i el seu contingut, amb correccions puntuals.
- `landing.html` no s’ha eliminat ni redirigit: continua funcionant, però queda `noindex,follow` i canonical a la home per evitar duplicació SEO.

## Què s’ha afegit
- Pàgines pilar: tests, oposició, convocatòria, examen, temari, Blocs A/B/C i psicotècnics.
- Pàgines de suport: requisits, places, dates examen, biodata/entrevista i aptituds psicotècniques.
- `seo-styles.css` (nom únic para no interferir amb CSS de l’app).
- `robots.txt` i `404.html`.
- Sitemap regenerat amb les URLs indexables.

## Correccions importants
- Convocatòria 46/26: 1.587 places.
- Llista provisional: 16/07/2026.
- Calendari orientatiu: llista definitiva prevista 21/09/2026 i primera prova prevista 17/10/2026.
- Prova de coneixements: 30 preguntes tipus test; eliminada la referència errònia de 100 preguntes/2 hores per a Mossos.
- `og:url` erroni de l’article 2026 corregit.
- Enllaç `/privacitat.html` dels HTML nous corregit a `/privacy.html`.

## Com desplegar amb risc mínim
1. Crea una branca nova, per exemple `seo-integracio`.
2. Copia el contingut d’aquest directori sobre el repositori.
3. Publica la branca en un entorn de prova o GitHub Pages temporal si en disposes.
4. Prova especialment: iniciar app, obrir tests, login/subscripció, Stripe, navegació mòbil i instal·lació PWA.
5. Quan tot funcioni, fes merge a `main`.
6. A Google Search Console envia `https://mossosprep.cat/sitemap.xml` i sol·licita indexació de les pàgines pilar.

## Nota sobre redireccions
No s’ha creat cap redirecció destructiva. GitHub Pages estàtic no permet un 301 real només amb HTML. Si més endavant vols consolidar URLs antigues, fes els 301 al CDN/proxy (p. ex. Cloudflare) després de verificar dades de Search Console.
