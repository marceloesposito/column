# Column — contesto per Claude Code

App desktop portable (Tauri) per scrivere un pezzo alla volta: l'app sorella leggera di
**Alexandria** (`marceloesposito/alexandria`). Fino al 18/10/2026 si chiamava **Folium**; fino al
26/10/2026 viveva sul ramo `column` di alexandria, poi spostata in questa repo con tutta la storia.
Piano, decisioni e avanzamento: `docs/COLUMN.md` (sezione "Avanzamento" e revisioni). Storia delle
versioni: `CHANGELOG.md` (va aggiornata con ogni PR).

## Principi non negoziabili

- **Offline totale e leggera**: nessun codice remoto, nessuna analytics, font inclusi nel
  pacchetto. La CSP sta in `src-tauri/tauri.conf.json`.
- **Dentro l'app nessun servizio americano** (decisione del committente, 12/10/2026). Lo
  *sviluppo* invece resta su GitHub (repo, PR, CI).
- **Solo portable**: accanto all'app la cartella `Column-data/` (stato, bozza, dati della webview).
- **Il Rust fa solo I/O** (`src-tauri/src/fsops.rs`, `portable.rs`). La logica di dominio sta in
  **funzioni pure testate** con vitest; quella condivisa con Alexandria nel nucleo **`logos`**
  (repo `marceloesposito/logos`, MIT, dipendenza git con tag).
- **Un pezzo e' un file `.clmn`** scelto dall'utente (Salva, Salva come); finche' non ha un file
  sta nella bozza (`bozza.clmn` nei dati). Niente cartelle create dall'app. I vecchi `.folium` si
  aprono ancora.

## Comandi

Prima di ogni commit: `npm test`, `npm run build` e `npm run test:rust` verdi.

## Struttura

- `src/column/` — tutto il frontend (ingresso `src/main.tsx`): store, editor (Copy), Clips
  (`tabula/`), Editions (`versions/`), Queries (`comments/`), timer, import ed export.
- `src/platform/` — contratto `Platform`: `tauri.ts` (comandi Rust) e `memory.ts` (file system
  simulato, per il browser e i test). Nessun componente chiama `invoke` direttamente.
- `logos` (in `node_modules/logos/src/`) — per cambiarlo: PR su `logos`, nuovo tag, poi
  `npm install logos@github:marceloesposito/logos#vX.Y.Z` qui (in locale `npm link ../logos`).

## Convenzioni

- Commenti e messaggi di commit in italiano, identificatori in inglese. Interfaccia bilingue: ogni
  stringa visibile passa da `t()` (`src/i18n/`), con la chiave sia in `it.ts` sia in `en.ts`.
- Nomi dell'interfaccia (Piece/pezzo, Copy, Clips, Editions, Queries, Rundown, Typewriter):
  skill `glossario`.
- Colori solo dai token di `src/styles/tokens.css` (tema chiaro, scuro, di sistema).
- Nessun `dangerouslySetInnerHTML` con contenuto esterno.

## Come si lavora (concordato con il committente)

- Il lavoro si fa sia su Windows sia su un Mac del committente: **prima di iniziare `git fetch` e
  `gh pr list`**.
- Branch + PR per ogni lavoro, merge **solo a CI verde** (se il job macOS e' "cancelled":
  `gh run rerun <id> --failed`). Commit, push e merge senza chiedere conferma.
- Prove: interfaccia con `npx vite --port 1430` + `node scripts/cdp.mjs`; app vera con
  `npm run column:portable` (cartella `Column-portable/` sul Desktop) e
  `node scripts/app-test.mjs <exe> <prova.mjs> <dati>` (`COLUMN_DATA_DIR`, `COLUMN_TEST_OFFSCREEN`).
  Dettagli: skill `build-e-pacchetti`.
- Mai rubare il focus al committente; non chiudere la sua app senza dirlo.

## Insidie gia' trovate

- Merge di conflitti in CSS/i18n "tenendo entrambe le parti": puo' perdere una graffa.
- Heredoc bash e script Python su Windows: `\n`, `\t`, `"\b"` in stringhe non raw si corrompono;
  usare Edit o stringhe raw. Controllo: `grep -rlP '\x08' src`.
- Vite in sviluppo: dopo un aggiornamento a caldo `import('/src/...')` da CDP restituisce un'altra
  istanza degli store; riavviare vite.
- Altre insidie di singole parti: skill `insidie-del-codice`.
