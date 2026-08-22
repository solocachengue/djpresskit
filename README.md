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

## Estilo: color y textura

El botón **● Estilo** en la barra abre los controles de marca.

**Color principal.** El naranja no es un valor suelto: es una rampa de 8 pasos de la que sale el degradado del foil. Al cambiarlo se regenera todo — títulos, numerales, reglas de índice e íconos. Los pasos se derivan aplicando al color nuevo los mismos factores de saturación y luminosidad medidos en la rampa cobre original, así que cualquier tono sigue leyéndose como foil metálico y no como color plano. Hay seis presets (cobre, oro, plata, carmesí, verdigrís, violeta) y selector libre.

**Textura.** El grano es una propiedad del kit entero, no de una foto suelta: un press kit se imprime en un solo stock. Hay cuatro opciones — Fino, Medio (el del kit original), Grueso y Sin grano — más un control de intensidad. Cada estilo trae un par: una placa casi negra que hace `screen` sobre los fondos oscuros y una casi blanca que hace `multiply` sobre los de papel. Las seis son tiles de 400px sin costura.

## Todo es editable

- **Textos** — click en cualquier texto con el modo **✎ Editar** activo. Títulos, eyebrows, bio, handles, footlines.
- **Listas numeradas** — géneros, credenciales y venues se agregan, editan y borran fila por fila.
- **Links y redes** — en **◆ Contenido → Links y redes**. Una sola lista alimenta los tres spreads que muestran contacto: la fila de *social media* y los rieles verticales de *degree & skills* y la contratapa. De cada link editás plataforma, texto y URL, y podés agregar, reordenar y borrar. El texto se ve solo en la fila; en los rieles va el ícono solo.
- **Imágenes** — *todas*. No hay ninguna imagen soldada al layout: retratos, cover art, foto de venue, y también los props de marca (auriculares, vinilo, sticker die-cut, sprays de spray-paint, logos de partners). Click en cualquiera para reemplazarla, `◐` para regular el brillo, `✕` para vaciarla.

Los props que quedan vacíos simplemente desaparecen del spread — nunca sale un placeholder punteado en el PDF.

Todo se guarda en el `localStorage` del navegador mientras editás. Para que los cambios salgan de tu navegador, mirá la sección siguiente.

## Llevarte los cambios (publicar tu contenido)

Lo que editás vive en tu navegador. Eso alcanza para exportar un PDF, pero **no** para publicar: si deployás sin más, tu sitio muestra el contenido del template, y quien abra tu link no ve lo tuyo.

El puente es un archivo `content.json`. El contenido se resuelve en tres capas, de mayor a menor prioridad:

1. **`localStorage`** — lo que estás editando en este navegador, sin publicar.
2. **`content.json`** — el kit publicado, commiteado en el repo. Es lo que ve cualquier visitante.
3. **El preset** — los valores por defecto.

El flujo completo:

1. Editá todo lo que quieras.
2. **◆ Contenido → Exportar**.
3. Descomprimí el zip **encima del repo**, respetando las carpetas.
4. Push. Netlify o Vercel redeployan solos, y tu URL ya muestra **tu** press kit — en cualquier navegador y para cualquiera.

**Importar** hace el camino inverso: cargás un `content.json` y recuperás ese kit en el navegador que sea. Sirve para seguir editando desde otra compu o para pasarle el kit a otra persona.

Si no hay `content.json` en el repo, la app usa el preset. Es el caso normal de un clon recién hecho.

**Qué te bajás.** Si no subiste fotos propias, un `content.json` suelto de unos pocos KB. Si subiste, un `presskit-content.zip` con esta forma:

```
content.json                    ← en la raíz del repo
assets/kit-so-portrait.jpg      ← una por cada foto que subiste
assets/kit-st-portrait.jpg
```

Las fotos **no** van embebidas en el JSON: salen como archivos y el JSON se queda solo con sus rutas. Así el texto pesa unos KB, las imágenes conservan su tamaño natural en vez de inflarse un tercio en base64, y el CDN las cachea por separado en lugar de rebajar todo el contenido cada vez que cambiás una palabra.

Para **importar** alcanza con el `content.json`; las fotos las toma del repo una vez desplegado.

## Exportar a PDF

**↓ PDF** abre el diálogo de impresión. La página está definida en 338×173mm — el mismo ratio 1.954:1 que los spreads — así que cada spread sale a página completa sin bandas.

Activá **"Gráficos de fondo"** en el diálogo, si no se pierden las fotos, el grano y el foil.

## Deploy de un click

Sitio estático puro, sin build. Los botones están **dentro de la app**, en *● Estilo → Publicar tu copia*, y hay un acceso directo a Netlify en la barra superior. También desde acá:

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
- `content.json` — *(opcional, lo generás vos)* el contenido publicado. Si existe, la app lo usa como base.

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
