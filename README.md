# Eskay Da Real — Press Kit Template

Press kit de DJ construido sobre el design system de **Eskay Da Real**: copper foil estampado sobre negro, atravesado por grano de película. Siete spreads apaisados (1280×655, el ratio de los artboards originales), todos editables en el navegador y exportables a PDF.

Un solo diseño. Lo que cambia es el contenido.

## Los siete spreads

| # | Spread | Qué es |
|---|---|---|
| 01 | Cover | Wordmark en foil, prop flotante, footline tracked |
| 02 | Story / About | Fondo papel, bio justificada con guionado, retrato cálido |
| 03 | Social Media | Retrato b&n a sangre, wordmark fantasma, fila de contacto |
| 04 | Music / Style | Índice numerado de géneros, cover art, vinilo |
| 05 | Degree & Skills | Credenciales numeradas, logos de partners, rail de redes |
| 06 | They Trust | Índice de venues a dos columnas sobre foto de venue |
| 07 | Back Cover | Collage de papel rasgado en diagonal, wordmark fantasma |

Podés reordenarlos, sacarlos o repetirlos desde **☰ Spreads**.

## Los dos presets de contenido

El botón **◆ Contenido** cambia el contenido, no el diseño:

- **Eskay Da Real** — el kit original, con sus fotos, props y copy.
- **Hardwell** — el mismo sistema cargado con otro artista. **Viene sin fotos a propósito**: no existen assets de Hardwell, así que todos los slots de imagen abren vacíos como drop zones. Sirve para ver que el sistema aguanta cualquier contenido y que todo se reemplaza.

Cargar un preset reemplaza textos y listas. Las fotos que subiste se mantienen.

## Todo es editable

- **Textos** — click en cualquier texto con el modo **✎ Editar** activo. Títulos, eyebrows, bio, handles, footlines.
- **Listas numeradas** — géneros, credenciales y venues se agregan, editan y borran fila por fila.
- **Imágenes** — *todas*. No hay ninguna imagen soldada al layout: retratos, cover art, foto de venue, y también los props de marca (auriculares, vinilo, sticker die-cut, sprays de spray-paint, logos de partners). Click en cualquiera para reemplazarla, `◐` para regular el brillo, `✕` para vaciarla.

Los props que quedan vacíos simplemente desaparecen del spread — nunca sale un placeholder punteado en el PDF.

Todo se guarda en el `localStorage` del navegador, así que cada persona que abre el sitio tiene su propia versión.

## Exportar a PDF

**↓ PDF** abre el diálogo de impresión. La página está definida en 338×173mm — el mismo ratio 1.954:1 que los spreads — así que cada spread sale a página completa sin bandas.

Activá **"Gráficos de fondo"** en el diálogo, si no se pierden las fotos, el grano y el foil.

## Deploy de un click

Sitio estático puro, sin build. Cualquiera de estos botones clona el repo en tu cuenta y lo deja online:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/solocachengue/djpresskit)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsolocachengue%2Fdjpresskit)

El botón te pide autorizar GitHub, hace un fork a tu cuenta y despliega. Después, cada push a ese fork redeploya solo.

## Correrlo local

Necesita un servidor HTTP: los `.jsx` se transpilan en el navegador con Babel y no cargan por `file://`.

```bash
python3 -m http.server 8000    # y abrí http://localhost:8000
```

O `npm start`, que corre `npx serve .`.

## Archivos

- `index.html` — entry point: tokens del design system en CSS, layout de spreads, reglas de impresión.
- `design-system.jsx` — primitivas de marca (Wordmark, DisplayTitle, Eyebrow, GhostWord, IndexRow, SocialRow/Rail, Icon), inventario de spreads y los dos presets de contenido.
- `presskit.jsx` — los siete spreads, la infraestructura de edición y la app.
- `tweaks-panel.jsx` — panel flotante de ajustes.
- `assets/` — fotos, props y texturas del kit original.

## El design system, en corto

Las reglas que hacen que esto se vea como se ve, por si agregás spreads:

- **Color.** Monocromo más un solo tono: la rampa copper (`#E8926A` en el centro). Todo lo demás es tinta (`#0C0B0B`) o papel (`#F4F3F1`). El copper aparece solo en títulos, numerales y reglas de índice, e íconos — nunca como relleno grande ni fondo. Los fondos alternan **stage** (negro) y **paper** (crudo); nunca se mezclan en una misma superficie.
- **Tipografía.** Una sola grotesca geométrica en extremos. Display: minúscula siempre, peso 800, tracking `-.03em`, enorme. Eyebrow: MAYÚSCULA, peso 300, tracking `.42em`. Sin serif, sin mono, sin itálica.
- **Listas.** Toda lista de más de dos cosas es un índice numerado: `01.` con punto, y una regla copper hasta la etiqueta.
- **Fondos.** Nunca planos: siempre grano de película sobre negro (50%) o papel (28%).
- **Formas.** Radio 0 por defecto. Lo único redondo es lo que es redondo de verdad: el vinilo, el sticker, los badges de íconos.
- **Sombras.** Solo exteriores, grandes y suaves — sombra de objeto apoyado sobre una mesa, no jerarquía de UI.
- **Sin emoji. Sin ilustración vectorial.** El kit original no tiene ninguno de los dos.

> **Nota de tipografía:** el kit original no venía con los binarios de la fuente. Va **Figtree** (Google Fonts) como el match libre más cercano a la grotesca geométrica del original. Se cambia en una línea, en el `<link>` de `index.html` y en `--font-display`.

## Créditos y assets

Las fotos, props y texturas de `assets/` vienen del press kit de Eskay Da Real y son material suyo. Si vas a usar este template para otro artista, reemplazalos — para eso todos los slots son editables.
