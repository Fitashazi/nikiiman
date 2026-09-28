# Nikiman

This is the **Nikiman** interiors-atelier website.

Folder name: **`nikiman`** (renamed from `lumen` so it stays clear).

## Open it locally

```bash
cd nikiman
python3 -m http.server 4174
```

Then open http://127.0.0.1:4174/

## Pages you can edit

| File | What it is |
| --- | --- |
| `index.html` | Homepage: hero carousel, intro, latest work |
| `work/index.html` | Full work list |
| `work/orbis.html` | Casa Orbis case |
| `work/nocturne.html` | Nocturne Athletic case |
| `work/vena.html` | Vena Baths case |
| `work/liminal.html` | Liminal Desk case |
| `services.html` | Hospitality, wellness, private water |
| `about.html` | Studio |
| `contact.html` | Inquiry form |

## How to change the work in detail

1. **Copy and photos** live in `assets/js/projects.js`.
2. **Look and type** live in `assets/css/style.css`.
3. **Homepage motion / circle tilt** lives in `assets/js/app.js` (`const TILT = …`).

## Contact

The form opens a mail draft to `info@nikiiman.com`.
