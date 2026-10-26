---
name: build-e-pacchetti
description: Prove dell'interfaccia sul Mac, build e pacchetto portable di Column. Da usare quando si compila, si prepara la cartella portable o si prova l'interfaccia su macOS.
---

# Build e pacchetti di Column

## Interfaccia
- `npx vite --port 1430 --strictPort` e
  `CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/cdp.mjs http://localhost:1430 <script.mjs>`.

## Build sul Mac
- Prima: `export PATH="$HOME/.cargo/bin:$PATH" SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk`
  (con l'SDK 27 il linker fallisce su `libiconv.tbd`: "unknown architecture"). Vale anche per
  `npm run test:rust`.

## Portable
- `npm run column:portable` (`-- --release` per il profilo release, `-- --skip-web`, `-- --out <cartella>`):
  `~/Desktop/Column-portable/` con `Column.app` o `Column.exe` e `Column-data/`. I dati gia' in
  `Column-data/` restano; si sostituisce solo l'app.
- Prova dell'app vera fuori schermo: `node scripts/app-test.mjs <exe> <prova.mjs> <dati>` con
  `COLUMN_DATA_DIR` (mai i dati veri) e `COLUMN_TEST_OFFSCREEN`.
