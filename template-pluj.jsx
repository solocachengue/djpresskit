// ═══════════════════════════════════════════════════════════════════════════
// P.LUJ — DESIGN SYSTEM
// Risograph print: brick ink on cream stock, everything shot through a
// halftone screen and dragged over a scratched plate.
//
// Where the Eskay system is foil on black — precious, radius 0, one hue used
// sparingly — this one is the opposite discipline: a two-ink print where the
// SECOND ink is the ground. Brick covers whole panels, cream covers whole
// panels, and the composition alternates between them spread to spread. There
// is no third colour anywhere.
//
// WHAT MAKES IT READ AS PRINT, not as a web page:
//  · Duotone. Every photograph is reduced to brick+cream. No full-colour image
//    exists in this brand.
//  · Halftone. Photographs carry a visible 45° dot screen — the dots are the
//    point, not an artefact to minimise.
//  · Misregistration. The display type prints twice, brick under cream, offset
//    a few pixels. That "mistake" is the signature.
//  · Wear. Scratches and dust sit over every ground; edges are notched rather
//    than rounded, as if trimmed by hand.
//
// CONTENT RULES:
//  · Sections are numbered 01, 02, 03 in a squared stencil face, and the number
//    is always a separate object — a tag, a box — never inline with the title.
//  · Display titles are UPPERCASE. Always.
//  · Lists are chips: each item its own tag with a notched corner and a star.
//  · Body copy is justified in the brick panels, ragged on cream.
// ═══════════════════════════════════════════════════════════════════════════

const PLUJ_TOKENS = {
  // Two inks, measured off the source spreads.
  "--pj-brick":      "#9F4C3F",   // the ground ink
  "--pj-brick-deep": "#7A3529",   // panels and boxes sitting on brick
  "--pj-ink":        "#5C2A22",   // type on cream
  "--pj-ink-soft":   "#8A4436",
  "--pj-cream":      "#D8D0C6",   // the paper
  "--pj-cream-lit":  "#E6E0D6",   // tags and chips
  "--pj-black":      "#1B1413",
  "--pj-rule":       "rgba(216,208,198,.55)",
  "--pj-rule-ink":   "rgba(92,42,34,.45)",

  // One heavy face for the wordmark, one condensed for section titles, one
  // squared stencil for numbers, one text face for copy.
  "--pj-font-mark":    "'Archivo Black', 'Arial Black', sans-serif",
  "--pj-font-display": "'Oswald', 'Arial Narrow', sans-serif",
  "--pj-font-stencil": "'Chakra Petch', 'Courier New', monospace",
  "--pj-font-body":    "'Mulish', -apple-system, sans-serif",

  // The plates. Halftone multiplies over photographs; scratch overlays every
  // ground; paper multiplies over the cream.
  "--pj-halftone": 'url("assets/pluj-halftone.png")',
  "--pj-scratch":  'url("assets/pluj-scratch.png")',
  "--pj-paper":    'url("assets/pluj-paper.png")',

  // El duotono se arma por fusión de capas (ver .pj-photo en el CSS), no con una
  // cadena de filtros: sepia()+hue-rotate() deriva al oliva. Estos dos quedan
  // solo para los recortes, que se tintan sin capa encima.
  "--pj-duo-brick": "grayscale(1) contrast(1.2) sepia(.55) saturate(1.9) hue-rotate(-18deg) brightness(.95)",
};

const PLUJ_FONTS =
  "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Oswald:wght@500;600;700" +
  "&family=Chakra+Petch:wght@600;700&family=Mulish:ital,wght@0,400;0,700;0,800;1,700;1,800&display=block";

// ═══════════════════════════════════════════════════════════════════════════
// ARTBOARDS
// The source is 16:9, the ratio of a screen and of the venue LED wall these
// end up on — not the 1.95:1 print spread the Eskay kit uses.
// ═══════════════════════════════════════════════════════════════════════════
const PLUJ_FORMATS = {
  landscape: {
    id: "landscape", label: "Horizontal", w: 1280, h: 720,
    page: "297mm 167mm", maxScale: 1,
    desc: "16:9, como el original",
  },
  portrait: {
    id: "portrait", label: "Vertical", w: 432, h: 768,
    page: "148mm 263mm", maxScale: 2.1,
    desc: "9:16, la del teléfono",
  },
};

const PLUJ_SPREAD_TYPES = {
  cover:   { label: "Portada",        desc: "Foto a sangre, recorte del artista, wordmark con eco" },
  bio:     { label: "Biografía",      desc: "Panel ladrillo + panel crema, sellos y logos" },
  artists: { label: "Artistas",       desc: "Título apilado y lista de nombres en chips" },
  photo:   { label: "Foto a sangre",  desc: "Respiro: una imagen en duotono con destellos" },
  rider:   { label: "Rider",          desc: "Técnico sobre foto + hospitalario sobre crema" },
  contact: { label: "Contacto",       desc: "Foto a sangre con la lista de contacto" },
};

const PLUJ_DEFAULT_SPREADS = ["cover", "bio", "artists", "photo", "rider", "contact"];

const PLUJ_IMAGE_SLOTS = {
  "pj-cover-bg":   { hint: "foto de fondo de portada (a sangre)" },
  "pj-cover-cut":  { hint: "recorte del artista (PNG sin fondo)" },
  "pj-bio-cut":    { hint: "recorte del artista (PNG sin fondo)" },
  "pj-logo1":      { hint: "logo de sello" },
  "pj-logo2":      { hint: "logo de sello" },
  "pj-logo3":      { hint: "logo de sello" },
  "pj-artists-ph": { hint: "foto enmarcada" },
  "pj-photo":      { hint: "foto a sangre" },
  "pj-rider-bg":   { hint: "foto de equipo (fondo)" },
  "pj-contact-bg": { hint: "foto a sangre de contacto" },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSITIONS
// Landscape places brick and cream side by side; portrait stacks them, because
// a 432px column cannot hold two panels abreast and still be read.
// ═══════════════════════════════════════════════════════════════════════════
const PLUJ_LAYOUT = {
  cover: {
    landscape: { pad: 54, top: 42, mark: 132, sub: 26, tag: 15, cut: { w: 460, h: 660, left: 20, bottom: 0 },
                 markLeft: 470, markTop: 250 },
    portrait:  { pad: 26, top: 26, mark: 62,  sub: 14, tag: 11, cut: { w: 300, h: 400, left: -30, bottom: 0 },
                 markLeft: 26, markTop: 250 },
  },
  bio: {
    landscape: {
      split: "58%", pad: 44, tagNum: 46, tagTitle: 34, box: { w: 420, fs: 14.5 },
      panelTitle: 46, panelSub: 20, panelBody: 13.5,
      cut: { w: 430, h: 620, left: "44%", bottom: 0 },
      logos: 74, stack: false,
    },
    portrait: {
      split: "52%", pad: 22, tagNum: 30, tagTitle: 21, box: { w: "100%", fs: 10.5 },
      panelTitle: 30, panelSub: 13, panelBody: 10,
      cut: { w: 240, h: 330, left: "50%", bottom: 0 },
      logos: 42, stack: true,
    },
  },
  artists: {
    landscape: { pad: 44, stackFs: 46, stackW: 132, num: 54, star: 92, frame: { w: 300, h: 560 },
                 title: 46, chipFs: 17, chipGap: 15, chipPad: "11px 22px" },
    portrait:  { pad: 22, stackFs: 26, stackW: 76, num: 30, star: 52, frame: { w: 150, h: 250 },
                 title: 27, chipFs: 11, chipGap: 8,  chipPad: "7px 13px" },
  },
  photo: {
    landscape: { inset: 26, star: 150, spark: 70 },
    portrait:  { inset: 14, star: 90,  spark: 44 },
  },
  rider: {
    landscape: { split: "52%", pad: 48, num: 62, title: 50, boxFs: 15,
                 title2: 42, rowFs: 15, burst: 150 },
    portrait:  { split: "46%", pad: 22, num: 34, title: 27, boxFs: 10.5,
                 title2: 24, rowFs: 10.5, burst: 80 },
  },
  contact: {
    landscape: { pad: 66, title: 62, rowFs: 22, icon: 30, gap: 20 },
    portrait:  { pad: 28, title: 34, rowFs: 13, icon: 19, gap: 12 },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE CONTENT
// The source kit, verbatim, so the template opens as a finished thing a DJ can
// read and then overwrite — not as a grid of placeholders.
// ═══════════════════════════════════════════════════════════════════════════
const PLUJ_PRESETS = {
  pluj: {
    id: "pluj",
    name: "P.Luj",
    desc: "El kit original — DJ y productor, Chaco, Argentina",
    wordmark: "P.LUJ",
    // Recortes de zonas limpias de los spreads originales: el ejemplo tiene que
    // abrir como una pieza terminada, no como una grilla de marcadores. Los dos
    // slots de recorte quedan vacíos a propósito — necesitan un PNG con
    // transparencia real y no se pueden fabricar desde una composición aplanada.
    images: {
      "pj-cover-bg":   "assets/pluj-ex-cover.jpg",
      "pj-photo":      "assets/pluj-ex-photo.jpg",
      "pj-artists-ph": "assets/pluj-ex-artists.jpg",
      "pj-rider-bg":   "assets/pluj-ex-rider.jpg",
      "pj-contact-bg": "assets/pluj-ex-contact.jpg",
    },
    text: {
      "pj-cv-left": "SP.",
      "pj-cv-right": "ARG",
      "pj-cv-mark": "P.LUJ",
      "pj-cv-sub": "PRESSKIT",
      "pj-cv-tag": "(SCROLL DOWN)",

      "pj-bio-num": "01",
      "pj-bio-title": "BIOGRAFÍA",
      "pj-bio-p1": "Pablo Luján, a.k.a P.Luj es un DJ y productor de Chaco, Argentina. Su estilo ecléctico fusiona géneros como house, minimal, deep, breaks, acid, garage y funk, destacándolo en la escena. Sus sets son auténticos paisajes sonoros que conectan con el público.",
      "pj-bio-p2": "Se ha presentado en clubes importantes como Feuer, Chilli Street Club, Basement, entre otros, llevando su innovadora propuesta musical por el país y el exterior.",
      "pj-bio-panel-title": "SELLOS",
      "pj-bio-panel-sub": "Y LANZAMIENTOS",
      "pj-bio-panel-body": "Sus lanzamientos originales y remixes se han ganado un lugar en las listas de reproducción de DJs influyentes. Logró lanzar música a través de los sellos: BLISS, MNML4U, Moiss Black, Urban Garden, Don't Play, entre otros",

      "pj-ar-num": "02",
      "pj-ar-stack": "ARTISTAS",
      "pj-ar-title": "COMPARTIÓ\nCABINA:",
      "pj-ar-more": "Entre otros (+++)",

      "pj-rd-num": "03",
      "pj-rd-title": "RIDER TÉCNICO",
      "pj-rd-title2": "RIDER HOSPITALARIO",

      "pj-ct-title": "CONTACTO",
    },
    // Cada chip es un artista con el que compartió cabina.
    artists: [
      { label: "Hector Couto", detail: "ESP" },
      { label: "Nacho Bolognani", detail: "ARG" },
      { label: "Tomás Saenz", detail: "ARG" },
      { label: "Franco Cinelli", detail: "ARG" },
      { label: "Mateo Dufour", detail: "ARG" },
    ],
    rider: [
      { label: "2/3 CDJ 3000 NEXUS + MIXER DJM V10 o Allen & Heat XONE96", detail: "confirmar disponibilidad" },
      { label: "Monitores estéreo (L/R) + Sub", detail: "" },
    ],
    hospitality: [
      { label: "ALOJAMIENTO", detail: "Hotel 5 estrellas, o en su defecto 4 estrellas." },
      { label: "TRASLADO", detail: "Aéreo o Driver privado" },
      { label: "VIÁTICOS", detail: "Alimentos y bebidas — Absolut + Red Bulls" },
      { label: "INVITACIONES", detail: "Lista de invitaciones al evento." },
    ],
    social: [
      { icon: "mail",       label: "pluj.music@gmail.com", href: "mailto:pluj.music@gmail.com" },
      { icon: "whatsapp",   label: "364-4712354",          href: "https://wa.me/543644712354" },
      { icon: "soundcloud", label: "/pluj",                href: "https://soundcloud.com/pluj" },
      { icon: "instagram",  label: "/_p.luj",              href: "https://instagram.com/_p.luj" },
      { icon: "spotify",    label: "P.Luj",                href: "https://open.spotify.com/" },
      { icon: "beatport",   label: "P.Luj",                href: "https://www.beatport.com/" },
    ],
  },

  // Contenido real de KESSLER, tomado de djkessler.com. Los números y las
  // plazas son suyos; el rider va marcado "a confirmar" porque no está
  // publicado y no corresponde inventarlo.
  kessler: {
    id: "kessler",
    name: "KESSLER",
    desc: "Reggaetón y cachengue, Buenos Aires — fundador de Solo Cachengue",
    wordmark: "KESSLER",
    images: {
      "pj-cover-bg":   "assets/kess-cover.jpg",
      "pj-photo":      "assets/kess-photo.jpg",
      "pj-artists-ph": "assets/kess-artists.jpg",
      "pj-rider-bg":   "assets/kess-rider.jpg",
      "pj-contact-bg": "assets/kess-contact.jpg",
    },
    text: {
      "pj-cv-left": "BA.",
      "pj-cv-right": "ARG",
      "pj-cv-mark": "KESSLER",
      "pj-cv-sub": "PRESSKIT",
      "pj-cv-tag": "(SCROLL DOWN)",

      "pj-bio-num": "01",
      "pj-bio-title": "BIOGRAFÍA",
      "pj-bio-p1": "KESSLER es DJ y productor de Buenos Aires. Empezó a tocar en 2011 y desde 2017 se afianzó en clubes y festivales de Argentina, Uruguay, Bolivia y Chile, con un sonido que cruza el reggaetón con el cachengue.",
      "pj-bio-p2": "Productor desde 2018, fundó Solo Cachengue, la comunidad de DJs más grande de Argentina y Uruguay, con más de 1.000 miembros. Hoy además dirige la identidad sonora de varios clubes.",
      "pj-bio-panel-title": "NÚMEROS",
      "pj-bio-panel-sub": "Y COMUNIDAD",
      "pj-bio-panel-body": "1.000.000 de oyentes mensuales en Spotify alcanzados en 2021. Más de 25 millones de reproducciones acumuladas y presencia en el Top 50 de más de 40 países. Solo Cachengue reúne a más de 1.000 DJs de Argentina y Uruguay.",

      "pj-ar-num": "02",
      "pj-ar-stack": "PLAZAS",
      "pj-ar-title": "TOCÓ EN:",
      "pj-ar-more": "Y muchos más (+++)",

      "pj-rd-num": "03",
      "pj-rd-title": "RIDER TÉCNICO",
      "pj-rd-title2": "RIDER HOSPITALARIO",

      "pj-ct-title": "CONTACTO",
    },
    artists: [
      { label: "JET BA", detail: "ARG" },
      { label: "Tokyo", detail: "ARG" },
      { label: "Costa 7070", detail: "ARG" },
      { label: "Big Charco", detail: "UY" },
      { label: "Wynwood", detail: "Santa Cruz, BO" },
      { label: "Fiestas Like", detail: "CL" },
    ],
    rider: [
      { label: "2x CDJ 3000 + MIXER DJM-A9", detail: "" },
      { label: "Monitores estéreo (L/R) + Sub", detail: "" },
    ],
    hospitality: [
      { label: "ALOJAMIENTO", detail: "A confirmar según plaza." },
      { label: "TRASLADO", detail: "A confirmar según plaza." },
      { label: "VIÁTICOS", detail: "A confirmar." },
      { label: "INVITACIONES", detail: "Lista de invitaciones al evento." },
    ],
    social: [
      { icon: "mail",      label: "djkessleroficial@gmail.com", href: "mailto:djkessleroficial@gmail.com" },
      { icon: "whatsapp",  label: "+54 9 2229 511398",          href: "https://wa.me/5492229511398" },
      { icon: "instagram", label: "@djkessler_",                href: "https://instagram.com/djkessler_" },
      { icon: "spotify",   label: "KESSLER",                    href: "https://open.spotify.com/artist/0yC2pt2fUIn0qqGNJDFIyc" },
      { icon: "tiktok",    label: "@djkessler",                 href: "https://tiktok.com/@djkessler" },
      { icon: "youtube",   label: "@DjKessler",                 href: "https://youtube.com/@DjKessler" },
    ],
  }
};

function applyPlujTokens() {
  const root = document.documentElement;
  for (const k of Object.keys(PLUJ_TOKENS)) root.style.setProperty(k, PLUJ_TOKENS[k]);
}

Object.assign(window, {
  PLUJ_TOKENS, PLUJ_FONTS, PLUJ_FORMATS, PLUJ_SPREAD_TYPES, PLUJ_DEFAULT_SPREADS,
  PLUJ_IMAGE_SLOTS, PLUJ_LAYOUT, PLUJ_PRESETS, applyPlujTokens,
});
