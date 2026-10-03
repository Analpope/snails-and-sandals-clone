# Snails and Sandals

Egy böngészős, rajzfilmstílusú turn-based harci játék, amelyet "Swords and Sandals" ihletett, de csigák főszereplésével.

## Funkciók

- Három csigaosztály választása
- Körökre osztott harc
- Támadás, képesség, védekezés és gyógyítás
- Ellenfélgenerálás és aréna szintlépés
- Gold, aranyjutalom és új körök
- Cartoon stílusú 2D HTML/CSS grafikák
- Nincs szükség telepítésre: csak nyisd meg a böngészőben

## Futtatás

A projekt statikus HTML/CSS/JS, ezért egyszerűen elindíthatod egyikéből:

1. A repo gyökérkönyvtárában nyiss meg egy terminált.
2. Futtasd:

```bash
python3 -m http.server 8000
```

3. A böngészőben nyisd meg:

```text
http://localhost:8000
```

## Szerkezet

- `index.html` – játékmenet és UI
- `style.css` – cartoon grafika és layout
- `game.js` – játékszabályok és logika

## Játék menete

1. Válassz egy csigaosztályt.
2. Kezdődjön a harc az arénában.
3. Használj támadást, képességet vagy védekezést.
4. Legyőzd az ellenfeleket és haladj a következő szintre.
5. Ha az ellenfél túl erős, a kör újraindítható a menüben.

## Készítette

A projekt célja egy gyors, játszható klón elkészítése a Swords and Sandals hangulatára, csigás tematizálással.
