---
name: glossario
description: Nomi dell'interfaccia di Column (redazione - Piece, Copy, Clips, Editions, Queries, Rundown, Typewriter) e regole delle traduzioni. Da usare quando si scrivono o cambiano testi visibili, chiavi i18n (it.ts, en.ts) o nomi di funzioni nell'interfaccia.
---

# Glossario di Column

Column usa il lessico della redazione e delle macchine da scrivere: nomi propri **uguali in ogni
lingua**. Eccezione: in italiano il Piece e' il **pezzo**.

| Nome | Cos'e' | In Alexandria |
| --- | --- | --- |
| Piece / pezzo (it) | il documento (file `.clmn`) | Scroll |
| Copy | l'editor | Scriptorium |
| Clips | blocchi e collegamenti del pezzo | Tabula / Armarium |
| Editions | l'albero delle versioni | Palimpsestus |
| Queries | i commenti | Marginalia |
| Rundown | la struttura del testo | Index |
| Typewriter | la scrittura minimale | Silentium |

## Regole
- Il timer resta "timer pomodoro" (Deadline e' stato scartato). Compendium resta: e' il nome del
  vault di Alexandria, dove si porta un pezzo.
- Da evitare: i nomi latini di Alexandria (colonna a destra), fogli/sheets, whiteboard, lavagna,
  history, cronologia, index, indice, sommario, outline, zen. "Copy" come comando degli appunti
  (`cmd.edit.copy`) e' escluso dal controllo.
- Gli identificatori interni restano inglesi e possono essere quelli vecchi (`sheet`, `tabula`...).
- Ogni stringa visibile passa da `t()` (`src/i18n/`), con la chiave sia in `it.ts` sia in `en.ts`;
  le variabili `{nome}` devono coincidere fra le lingue.
- Elenco e controlli: `src/i18n/glossary.ts` e i test in `src/i18n/`.
