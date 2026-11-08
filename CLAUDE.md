# Kilemannens apper (samlesida)
Startside som samler appene. Én HTML-fil (`index.html`). Lista over apper er `APPS` i skriptet (navn, tekst, `url`, ikon).
Nettside: https://kilemann.github.io/

## Regler for alt arbeid i dette repoet
- Svar brukeren på norsk. Commit-meldinger på norsk, med versjon først (f.eks. «Appnavn 1.4.0: kort beskrivelse»).
- Hver endring får nytt versjonsnummer (MAJOR.MINOR.PATCH) og en linje i endringsloggen. Versjonen skal være lik på alle stedene under.
- Lever rett på `main` når resultatet er godt nok og testene er grønne. Kjør `git fetch origin main` og rebase før push.
- Testdrevet utvikling (TDD) bare når brukeren ber om det. Eksisterende tester kjøres alltid før push.
- Tekniske påstander skal sjekkes mot dokumentasjon eller kilde, ikke gjettes.
- Publiseres med GitHub Pages fra `main` (rot). Det tar noen minutter før endringen er ute.
- Alle apper på denne sida skal vise navn, versjon og en (i)-knapp øverst til venstre, som Himmelur.

## Versjon står her
- `package.json`
- `index.html`: kommentaren øverst (`/* Kilemannens apper vX.Y.Z` + changelog-linje, nyeste først) og `<footer>Samleside vX.Y.Z</footer>`
- `README.md`: tittel og «Versjoner»

## Tester
`npm test` (Node 22). `test/hub.test.js` (kort, søk, versjonsvisning) og `test/release.test.js`.

## Viktig
- Hvert kort viser appens versjon, hentet fra `package.json` i appen (`<url>package.json`). En ny app må derfor ha `package.json` med `version`.
- Lenkene er relative (`/repo/`), så de følger brukernavnet.
