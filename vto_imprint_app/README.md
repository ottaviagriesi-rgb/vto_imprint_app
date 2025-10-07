# Micro‑app VTO + Imprint (per Framer Embed)

Questa app React fornisce:
- `/` Gate vocale con parole chiave (instrada ai 3 mondi)
- `/vto?item=earring|necklace|corset&asset=/PATH&brand=...` Try‑on con webcam
- `/checkout?imprint=/PATH/IMPRONTA.mp4&reward=Testo` Pagamento fittizio con video impronta

## Installazione rapida
1. **Aggiungi i font**: copia i file WOFF2 di *Commuter Sans* in `public/fonts/` e rinomina `CommuterSans-Variable.woff2` oppure modifica `styles.css`.
2. `npm i`
3. `npm run dev` (sviluppo) / `npm run build` + deploy su Vercel/Netlify

## Percorsi asset
Metti le immagini in `public/` (puoi copiare le cartelle dal tuo `MATERIALI_ORGANIZZATI/`).

Esempi URL da usare come Embed in Framer (dopo il deploy, sostituisci dominio):
- `https://TUO-DOMINIO.app/vto?item=earring&asset=/AETERNA_orecchino/main.png&brand=ÆTHERNA`
- `https://TUO-DOMINIO.app/vto?item=necklace&asset=/AEONIC_collana/main.png&brand=ÆONIC`
- `https://TUO-DOMINIO.app/vto?item=corset&asset=/AERMOR_corsetto/main.png&brand=ÆRMOR`
- `https://TUO-DOMINIO.app/checkout?imprint=/AUDIO/impronta.mp4&reward=Scelta%20impeccabile`

## Note
- La camera è elaborata solo in locale.
- Tracking “leggero” oggi; per Pose avanzata (corsetto) si pianifica Fase 2.
