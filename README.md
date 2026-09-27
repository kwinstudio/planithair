# Planit Hair

Static marketing website for Planit Hair.

## Editing content
Primary editable content lives in `data/site.json` and is configured for Pages CMS via `.pages.yml`.

## Local preview
Run any static HTTP server in the project directory, for example:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Deployment
Designed for Vercel as a static site. `vercel.json` includes basic security headers and clean URLs.
