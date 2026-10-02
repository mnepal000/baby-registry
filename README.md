# Baby Registry

A custom, static baby registry site for the Nepal family. Live at **https://mnepal000.github.io/baby-registry/**

## What it does

- Warm, mobile-friendly one-page registry with a live countdown to the due date
- 29 curated gift items with real store links, prices, photos, and short "why we picked it" notes
- Category chips, priority filter (must-have / nice-to-have), search, and hide-purchased toggle
- "Mark as purchased" buttons backed by `localStorage`, plus a claimed-gifts progress bar
- How-it-works section, alternative gift ideas (diaper fund, meal train, books), and FAQ
- No build step, no backend, no tracking. Just open `index.html` or serve the folder.

## Editing

All content lives in **`data.js`**:

- `REGISTRY`: baby name, family name, due date (`YYYY-MM-DD`), due-month label, contact email. The countdown and all name mentions update automatically.
- `ITEMS`: add, remove, or edit items. Each item needs `id`, `name`, `brand` (or `null`), `category`, `priority` (`"must"` or `"nice"`), `price`, `store`, `url`, `img`, and `blurb`.
- Item photos live in `assets/img/<id>.jpg`.

To add an item: drop a photo in `assets/img/`, then append an entry to `ITEMS`.

## Publishing

```sh
cd ~/workspace/baby-registry
git add -A && git commit -m "Update registry" && git push origin main
```

GitHub Pages serves the `main` branch. Changes go live within a minute or two.

## Notes

- Prices were checked on 2026-10-01 and will drift; the site says so in the How-it-works section.
- "Purchased" marks are stored per-visitor in the browser (`localStorage`), not shared. If shared claimed-state is ever wanted, the Google Sheets pattern used on the Kaalo Diary site would work here too.
- No home address is published on the site. The FAQ asks gifters to email for the shipping address.
