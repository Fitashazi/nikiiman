# Nikiman

Standalone interiors-atelier site. This is its own project — not the portfolio, not Novera.

Live demo (old one-page copy): https://fitashazi.github.io/atelier-demos/website/

This folder is the one to work in from now on.

## Open it locally

```bash
cd lumen
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

1. **Copy and photos** live in `assets/js/projects.js`. Each project has `brief`, `approach`, `materials`, `rooms`, `result`, and `images`.
2. **To add a project:** append an object in `projects.js`, duplicate `work/orbis.html` as `work/<id>.html`, and set `data-project="<id>"` on `<body>`.
3. **Look and type** live in `assets/css/style.css`.
4. **Homepage motion** lives in `assets/js/app.js`. Do not mix this with the Flutter app in the repo root.

## Languages

The homepage still switches EN / TR / RU. Inner pages are English first so you can write them with your manager in detail, then we can translate.

## Contact

The form opens a mail draft to `studio@nikiiman.com`. Change that address in `contact.html` and the homepage footer when the studio address is final.
