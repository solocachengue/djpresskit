# DJ Presskit Template

Presskit modular para DJs — 6 páginas editables (Cover, Bio, Live, Music, Press, Rider) + 10 páginas opcionales (Discography, Manifesto, Festivals, Services, Timeline, Tour Map, Brands, Radio, Streaming, Contact). 20 templates predefinidos, selector de tipografía, exportá a PDF con un click.

## Archivos

- `index.html` — entry point. Contiene todo el CSS + monta los scripts JSX.
- `presskit.jsx` — componente principal + 6 páginas core (Cover, Bio, Live, Music, Press, Rider).
- `pages-extra.jsx` — 10 páginas opcionales adicionales.
- `templates.jsx` — los 20 templates (estructura + paleta + tipografía).
- `tweaks-panel.jsx` — panel de Tweaks reutilizable.

## Cómo correrlo localmente

Necesita un servidor HTTP (los scripts JSX no se cargan abriendo el archivo directo por `file://`).

**Opción A — Python (en cualquier Mac/Linux ya viene):**
```bash
cd proyecto
python3 -m http.server 8000
```
Después abrí `http://localhost:8000` en tu navegador.

**Opción B — Node:**
```bash
npx serve proyecto
```

**Opción C — VS Code:** instalá la extensión "Live Server" → click derecho en `index.html` → "Open with Live Server".

## Deploy a Vercel

1. Subí esta carpeta entera a un repo de GitHub.
2. Andá a [vercel.com/new](https://vercel.com/new) e importá el repo.
3. Vercel detecta que es un sitio estático y deploya automáticamente.
4. URL gratis, HTTPS, deploy en cada push.

**Sin GitHub** → instalá Vercel CLI y ejecutá:
```bash
npm i -g vercel
cd proyecto
vercel
```

## Deploy a Netlify (alternativa)

Andá a [app.netlify.com/drop](https://app.netlify.com/drop) y arrastrá la carpeta. Listo.

## Editar el código

Los archivos `.jsx` se transpilan en el navegador con Babel (perfecto para prototipos / templates como este). Editás el archivo, refrescás, ves el cambio.

Para producción a gran escala conviene precompilar con un bundler (Vite, esbuild) — pero para este caso de uso (un presskit personal), no hace falta.

## Personalizar

- Los datos editables se guardan en `localStorage` del navegador. Cada DJ que use el presskit tiene los suyos.
- Los 20 templates están en `templates.jsx` — agregá los tuyos copiando una entrada existente.
- Los tipos de página están en `pages-extra.jsx` (los nuevos) y `presskit.jsx` (los core).
- Las fuentes de Google Fonts se importan en `index.html`.

## Licencia

Tuyo. Hacé lo que quieras.
