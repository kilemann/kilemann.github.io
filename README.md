# Kilemannens apper v1.5.0
Samleside for appene mine: https://kilemann.github.io/

Hvert kort viser appens versjon. Den hentes fra `package.json` i hver app, så tallet er det som faktisk ligger ute.

## Legge til en app
Kopier en blokk i `APPS` i `index.html`. Appen må ha `package.json` med `version` for at versjonen skal vises.

## Tester
```
npm test
```
Krever Node 22 eller nyere. Ingen avhengigheter. Ved ny versjon: skriv testen først, sett `version` i `package.json`, og oppdater kommentaren og bunnteksten i `index.html`.

## Versjoner
- 1.5.0 – Prutt-O-Teket lagt til.
- 1.4.0 – Solblikk lagt til.
- 1.3.0 – Versjon vises i hvert kort, hentet automatisk. Automatiske tester.
- 1.2.1 – Nytt brukernavn kilemann, relative lenker.
- 1.2.0 – Kronekikk lagt til.
- 1.1.2 – Løpespiller omdøpt til Lommespiller.
- 1.1.1 – Løpespiller viser til nedlastingssiden.
- 1.1.0 – Løpespiller lagt til.
- 1.0.0 – Første versjon.
