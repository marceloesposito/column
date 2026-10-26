# Column

*A portable, offline writing app: one piece, nothing else.*
*Un'app di scrittura portable e offline: un pezzo, nient'altro.*

Column è l'app sorella leggera di [Alexandria](https://github.com/marceloesposito/alexandria),
pensata per scrivere in mobilità, anche da una chiavetta USB. Ogni pezzo è un file `.clmn`
indipendente che salvi dove vuoi; quando è pronto lo porti in un Compendium di Alexandria.

- **Copy**: l'editor, con una barra in alto da 40 px e una barretta flottante.
- **Queries**: commenti con il clic destro, esportati anche nel .docx.
- **Clips**: blocchi e collegamenti accanto al testo.
- **Editions**: l'albero delle versioni del pezzo.
- **Typewriter**, **Rundown**, **timer pomodoro**.
- Export in .docx (con i commenti), Markdown e PDF.

Nessun account, nessun server, nessuna telemetria.

## Sviluppo

```sh
npm install
npm run dev              # interfaccia nel browser (file system simulato)
npm run column:portable  # app portable in ~/Desktop/Column-portable
npm test && npm run build && npm run test:rust
```

Licenza MIT.
