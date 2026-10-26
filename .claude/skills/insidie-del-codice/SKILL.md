---
name: insidie-del-codice
description: Insidie gia' incontrate in parti specifiche di Column - salvataggio dei pezzi, nomi di file che differiscono solo per le maiuscole su macOS, import .docx con mammoth, aggiornare il nucleo logos. Da leggere prima di toccare sheets.ts/store.ts, importDoc, o la dipendenza logos.
---

# Insidie di singole parti del codice

- **Salvataggio dei pezzi** (`sheets.ts`): le scritture passano in coda una alla volta e scrivono
  direttamente il `.clmn` (l'atomicita' la fa `write_atomic` nel Rust). Un temporaneo gestito anche
  dal JS faceva fallire due salvataggi insieme con "No such file or directory".
- **macOS non distingue le maiuscole nei nomi di file**: due file che differiscono solo per le
  maiuscole nella stessa cartella rompono tsc. Nomi diversi, non solo per maiuscole.
- **mammoth**: la versione per node (test) vuole `buffer`, quella per il browser `arrayBuffer`; si
  passano entrambi. Nei test jsdom `import.meta.url` non e' un file: usare `__dirname`.
- **`logos`**: aspettare la CI della PR anche per un commit che cambia solo la versione, poi merge e
  tag; qui `npm install logos@github:marceloesposito/logos#vX.Y.Z`.
