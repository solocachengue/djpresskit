// ═══════════════════════════════════════════════════════════════════════════
// ESKAY DA REAL — DESIGN SYSTEM
// Copper foil stamped on black, shot through film grain.
//
// This file holds the brand primitives (Wordmark, DisplayTitle, Eyebrow,
// IndexList, GhostWord, SocialRow/Rail, Icon), the spread inventory, and the
// two content presets. The layouts themselves live in presskit.jsx.
//
// CONTENT RULES baked into these components:
//  · Display titles are lowercase, heavy (800), tight (-.03em), foil-filled.
//  · Eyebrows are UPPERCASE, light (300), tracked to .42em.
//  · Every list is a numbered index: 01. 02. 03. — two digits, trailing period.
//  · No emoji. No vector illustration. Radius 0 except physically round objects.
// ═══════════════════════════════════════════════════════════════════════════

// ── Icons ───────────────────────────────────────────────────────────────────
// The kit uses exactly four marks: envelope, Instagram, YouTube, TikTok.
// Drawn solid in copper (the envelope is the one stroked mark), inlined here
// so they survive printing and offline use.
const ICON_PATHS = {
  instagram: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  youtube: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
};

// The kit's own inventory is four marks (envelope, Instagram, YouTube, TikTok);
// Spotify is here because a DJ kit that lists releases needs it. Anything else
// would be an addition to the brand, not part of it.
const ICON_OPTIONS = [
  { id: "mail",      label: "Email" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube",   label: "YouTube" },
  { id: "tiktok",    label: "TikTok" },
  { id: "spotify",   label: "Spotify" },
];

function Icon({ name, size = 24, color = "var(--accent)", style }) {
  // The envelope is the odd one out: stroked, weight-matched to the filled marks.
  if (name === "mail") {
    return (
      <svg className="ds-icon" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6"
        style={{ width: size, height: size, background: "none", ...style }} aria-label="mail" role="img">
        <rect x="2.5" y="5" width="19" height="14" />
        <path d="M2.5 6.2l9.5 7.3 9.5-7.3" />
      </svg>
    );
  }
  const d = ICON_PATHS[name] || ICON_PATHS.instagram;
  return (
    <svg className="ds-icon" viewBox="0 0 24 24" fill={color}
      style={{ width: size, height: size, background: "none", ...style }} aria-label={name} role="img">
      <path d={d} />
    </svg>
  );
}

// ── Brand primitives ────────────────────────────────────────────────────────

// Display titles: lowercase always, even at the start of a phrase. Never title-case.
function DisplayTitle({ children, size = 72, tone = "foil", style }) {
  return <h2 className={`ds-display ${tone}`} style={{ fontSize: size, ...style }}>{children}</h2>;
}

function Eyebrow({ children, tone = "on-stage", size = 13, style }) {
  return <div className={`ds-eyebrow ${tone}`} style={{ fontSize: size, ...style }}>{children}</div>;
}

// The primary wordmark is TYPE, not a vector — set in the display face,
// lowercase, 800, tracking -.03em, filled with the copper foil gradient.
function Wordmark({ children, size = 120, tone = "foil", style }) {
  return <div className={`ds-display ${tone}`} style={{ fontSize: size, ...style }}>{children}</div>;
}

// Ghost wordmark — the brand name set enormous behind the content, always
// clipped by the artboard edge, never fully visible.
function GhostWord({ children, size = 230, opacity = 0.055, tone = "stage", style }) {
  return (
    <div className="ds-ghost" aria-hidden="true"
      style={{ fontSize: size, opacity, color: tone === "stage" ? "var(--paper-000)" : "var(--ink-800)", ...style }}>
      {children}
    </div>
  );
}

// ── Index rows ──────────────────────────────────────────────────────────────
// Numbering is content, not decoration: 01. then a copper rule running to the label.
function IndexRow({ n, label, detail, tone = "on-stage", ruleWidth = 120, gap, children }) {
  return (
    <li className={`ds-index-row ${tone}`} style={{ marginBottom: gap }}>
      <span className="ds-index-n">{String(n).padStart(2, "0")}.</span>
      {ruleWidth > 0 && <span className="ds-index-rule" style={{ width: ruleWidth }} aria-hidden="true" />}
      <span className="ds-index-label">
        {label}
        {detail ? <span className="ds-index-detail">, {detail}</span> : null}
      </span>
      {children}
    </li>
  );
}

// ── Social ──────────────────────────────────────────────────────────────────
// Handles are written bare: the icon carries the platform, the text the handle.
function SocialRow({ items, size = 20, gap = 26, labelColor = "var(--text-strong)", style }) {
  return (
    <div className="ds-social-row" style={{ gap, ...style }}>
      {items.map((it, i) => (
        <a key={i} href={it.href} target="_blank" rel="noopener noreferrer" style={{ color: labelColor }}>
          <Icon name={it.icon} size={size} />
          <span>{it.label}</span>
        </a>
      ))}
    </div>
  );
}

// Vertical rail pinned to the right edge, no text.
function SocialRail({ items, size = 22, gap = 46, style }) {
  return (
    <nav className="ds-social-rail" style={{ gap, ...style }}>
      {items.map((it, i) => (
        <a key={i} href={it.href} target="_blank" rel="noopener noreferrer" aria-label={it.icon}>
          <Icon name={it.icon} size={size} />
        </a>
      ))}
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ARTBOARDS
// Two formats, one system. The landscape board is the source press kit's own
// spread. The portrait board is not that spread squeezed: a 1.95:1 artboard
// scaled to a 390px phone renders body copy at 4px, so the vertical format is
// its own board with its own type scale, authored at sizes that read at phone
// width and scaled UP on desktop (everything but the photos is vector, and the
// photos are 1400px+, so enlarging costs nothing).
// ═══════════════════════════════════════════════════════════════════════════
const FORMATS = {
  landscape: {
    id: "landscape", label: "Horizontal", w: 1280, h: 655,
    // 297mm is A4's long side. A custom sheet wider than that is refused by
    // many print dialogs, which silently swap in a standard paper — and then
    // the frame overflows it and the spread is cut. Keeping the long side
    // within A4 makes the custom sheet one the dialog will actually accept.
    page: "297mm 152mm", maxScale: 1,
    desc: "El spread del kit original, 1.95:1",
  },
  portrait: {
    // 9:16 — the phone's own ratio, and the one a DJ actually shares. A 3:4
    // board could not hold the bio and the portrait together at a readable
    // size; the taller page fits both without shrinking the type.
    id: "portrait", label: "Vertical", w: 432, h: 768,
    page: "148mm 263mm", maxScale: 2.1,
    desc: "Página 9:16, la del teléfono",
  },
};

// Below this viewport width the landscape board cannot be read, so "auto"
// serves the portrait one.
const PORTRAIT_BREAKPOINT = 900;

const resolveFormat = (choice) => {
  if (choice === "landscape" || choice === "portrait") return FORMATS[choice];
  return window.innerWidth < PORTRAIT_BREAKPOINT ? FORMATS.portrait : FORMATS.landscape;
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSITIONS
// One content tree per spread, two sets of measurements. The landscape board
// anchors content to the left third with the image mass on the right; the
// portrait board turns that same relationship through 90° — content on top,
// image mass below — rather than shrinking the columns until they collapse.
// ═══════════════════════════════════════════════════════════════════════════
const LAYOUT = {
  cover: {
    landscape: { gutter: 110, barY: 54, eyebrow: 11, wordmark: 132,
                 propW: 300, propH: 210, propGap: -18 },
    portrait:  { gutter: 34,  barY: 40, eyebrow: 9, wordmark: 58,
                 propW: 168, propH: 118, propGap: -10 },
  },
  story: {
    landscape: {
      body: { display: "grid", gridTemplateColumns: "1fr 1.05fr", alignItems: "center",
              padding: "0 0 0 110px", gap: 60 },
      col: { gap: 40 }, title: 72, eyebrow: 13, bio: 13.5, bioGap: 18, bioMax: 440,
      figure: { position: "relative", height: "100%" },
      photo: { position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 500, height: 500 },
      spray: { position: "absolute", left: -70, bottom: 40, width: 140, height: 230, zIndex: 2 },
      stickerScope: "figure",
      sticker: { position: "absolute", left: -34, bottom: 56, width: 96, height: 96, zIndex: 4 },
    },
    portrait: {
      body: { display: "flex", flexDirection: "column", padding: "46px 34px 36px", gap: 18 },
      col: { gap: 14 }, title: 48, eyebrow: 9, bio: 11.5, bioGap: 11, bioMax: "100%",
      figure: { position: "relative", flex: 1, minHeight: 0, marginTop: 2 },
      photo: { position: "absolute", inset: 0 },
      spray: { position: "absolute", left: -14, bottom: -8, width: 62, height: 104, zIndex: 4 },
      // The sticker was cropped from a flattened spread, so it carries an opaque
      // paper plate. On the landscape board it lands on the paper ground and the
      // plate is invisible; stacked vertically the photo runs full width, so it
      // moves onto the page's own paper instead of stamping a white box on the
      // portrait.
      stickerScope: "page",
      sticker: { position: "absolute", right: 24, top: 36, width: 62, height: 62, zIndex: 6 },
    },
  },
  social: {
    landscape: { ghost: 230, ghostTop: "52%", iconSize: 20, gap: 26, bottom: 90, dir: "row" },
    portrait:  { ghost: 88,  ghostTop: "44%", iconSize: 17, gap: 12, bottom: 56, dir: "column" },
  },
  music: {
    landscape: {
      body: { display: "grid", gridTemplateColumns: "1fr 1.5fr", alignItems: "center",
              padding: "0 0 0 110px", gap: 40 },
      col: { gap: 44, borderRight: "1px solid var(--rule-on-stage)", paddingRight: 56,
             height: "64%", justifyContent: "center" },
      title: 70, eyebrow: 13, indexRule: 110, indexGap: 14, indexFs: 15,
      figure: { position: "relative", height: "100%" },
      art: { position: "absolute", left: 40, top: "50%", transform: "translateY(-50%)", width: 330, height: 330 },
      vinyl: { position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", width: 420, height: 420 },
      spray: { position: "absolute", left: 470, top: 60, width: 130, height: 280 },
      card: { left: 22, bottom: 22 }, cardHandle: 11, cardLine: 42,
    },
    portrait: {
      body: { display: "flex", flexDirection: "column", padding: "38px 34px 30px", gap: 18 },
      col: { gap: 14 },
      title: 50, eyebrow: 9, indexRule: 30, indexGap: 9, indexFs: 11.5,
      figure: { position: "relative", flex: 1, minHeight: 0 },
      art: { position: "absolute", left: 0, bottom: 0, width: 236, height: 236 },
      vinyl: { position: "absolute", right: -34, bottom: 20, width: 220, height: 220 },
      spray: { position: "absolute", right: 6, top: -10, width: 62, height: 130 },
      card: { left: 12, bottom: 12 }, cardHandle: 8, cardLine: 26,
    },
  },
  skills: {
    landscape: {
      col: { position: "absolute", inset: 0, padding: "0 0 0 110px", width: 620,
             justifyContent: "center", gap: 48 },
      title: 62, eyebrow: 13, indexGap: 16, indexFs: 15,
      prop: { position: "absolute", right: 70, top: "46%", transform: "translateY(-50%)", width: 460, height: 320 },
      logos: { position: "absolute", left: 110, bottom: 60, gap: 26 }, logoH: 74,
      rail: { right: 44, size: 22, gap: 46 },
    },
    portrait: {
      col: { position: "absolute", left: 0, right: 0, top: 0, padding: "38px 60px 0 34px",
             justifyContent: "flex-start", gap: 16 },
      title: 44, eyebrow: 9, indexGap: 11, indexFs: 11.5,
      prop: { position: "absolute", left: "50%", bottom: 120, transform: "translateX(-50%)", width: 290, height: 200 },
      logos: { position: "absolute", left: 34, bottom: 36, gap: 16 }, logoH: 46,
      rail: { right: 12, size: 15, gap: 22 },
    },
  },
  trust: {
    landscape: {
      body: { padding: "0 90px 0 110px", justifyContent: "center", gap: 38 },
      title: 62, eyebrow: 13, columns: 2, ruleWidth: 110, indexGap: 12, indexFs: 15, colGap: 70,
    },
    portrait: {
      body: { padding: "38px 30px 30px", justifyContent: "flex-start", gap: 16 },
      title: 46, eyebrow: 9, columns: 1, ruleWidth: 26, indexGap: 8, indexFs: 10.5, colGap: 0,
    },
  },
  back: {
    landscape: {
      wedge: "polygon(0 0,34% 0,17% 100%,0 100%)",
      bar: { left: 0, top: 0, bottom: 0, width: 34 },
      ghost: 190, ghostStyle: { top: "50%", transform: "translateY(-50%)", left: 372 },
      rail: { right: 46, size: 20, gap: 52 },
      foot: { left: 54, bottom: 44, width: 170, fontSize: 9 },
    },
    portrait: {
      // The diagonal turns with the board: a band across the top instead of a
      // wedge down the side, so it still splits the composition on a diagonal.
      wedge: "polygon(0 0,100% 0,100% 17%,0 29%)",
      bar: { left: 0, right: 0, top: 0, height: 13 },
      ghost: 68, ghostStyle: { top: "60%", transform: "translateY(-50%)", left: 26 },
      rail: { right: 12, size: 15, gap: 24 },
      foot: { left: 30, top: 30, width: 220, fontSize: 8.5 },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD INVENTORY
// Seven spreads, traced one-to-one to the source press kit.
// ═══════════════════════════════════════════════════════════════════════════
const SPREAD_TYPES = {
  cover:  { label: "Cover",            desc: "Wordmark en foil, prop flotante, footline tracked" },
  story:  { label: "Story / About",    desc: "Fondo papel, bio justificada, retrato cálido" },
  social: { label: "Social Media",     desc: "Retrato b&n a sangre, wordmark fantasma, contacto" },
  music:  { label: "Music / Style",    desc: "Índice numerado de géneros, cover art, vinilo" },
  skills: { label: "Degree & Skills",  desc: "Credenciales numeradas, logos, rail de redes" },
  trust:  { label: "They Trust",       desc: "Índice de venues a dos columnas sobre foto" },
  back:   { label: "Back Cover",       desc: "Collage de papel rasgado, wordmark fantasma" },
};

const DEFAULT_SPREADS = ["cover", "story", "social", "music", "skills", "trust", "back"];

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT PRESETS
// `eskay` is the source kit, verbatim. `hardwell` is the worked example that
// shows the same system carrying a completely different artist — swap the copy,
// the brand holds. Neither is "the design": the design is the system above.
// ═══════════════════════════════════════════════════════════════════════════
// Every image in the kit is a slot. `images` gives each slot its starting
// picture; a slot with no entry opens empty, showing its drop hint. That is
// why Hardwell ships with no photography — the source kit is a template with
// drop zones ("Drop the hero press shot"), and no Hardwell assets exist. Using
// Eskay's portraits under Hardwell's name would be a lie about whose face it is.
const IMAGE_SLOTS = {
  "cv-hero":     { hint: "fondo a sangre — foto gigante detrás de todo" },
  "cv-prop":     { hint: "prop chico — objeto sobre el wordmark" },
  "cv-mark":     { hint: "marca de fondo — logo grande detrás del wordmark" },
  "st-portrait": { hint: "retrato cálido" },
  "st-spray":    { hint: "textura / spray" },
  "st-sticker":  { hint: "sticker die-cut" },
  "so-portrait": { hint: "retrato b&n a sangre" },
  "mu-art":      { hint: "cover art" },
  "mu-vinyl":    { hint: "vinilo / objeto" },
  "mu-spray":    { hint: "textura / spray" },
  "sk-prop":     { hint: "prop (auriculares, etc.)" },
  "sk-logo1":    { hint: "logo" },
  "sk-logo2":    { hint: "logo" },
  "tr-photo":    { hint: "foto de venue a sangre" },
  "bk-photo":    { hint: "retrato a sangre" },
};

const PRESETS = {
  eskay: {
    id: "eskay",
    name: "Eskay Da Real",
    desc: "El kit original — DJ open format, Paris. Trae las fotos y props del press kit fuente.",
    wordmark: "eskaydareal",
    images: {
      "cv-prop":     "assets/headphones-front.png",
      "st-portrait": "assets/photo-portrait-warm.jpg",
      "st-spray":    "assets/texture-spray-copper-2.png",
      "st-sticker":  "assets/sticker-eskay.png",
      "so-portrait": "assets/photo-portrait-bw.jpg",
      "mu-art":      "assets/photo-portrait-bw.jpg",
      "mu-vinyl":    "assets/vinyl-record.png",
      "mu-spray":    "assets/texture-spray-copper.png",
      "sk-prop":     "assets/headphones-side.png",
      "sk-logo1":    "assets/logo-88-musicprod.png",
      "sk-logo2":    "assets/logo-eskay-badge.png",
      "tr-photo":    "assets/photo-venue-dark.jpg",
      "bk-photo":    "assets/photo-portrait-warm.jpg",
    },
    text: {
      "cv-kicker": "Press Kit",
      "cv-year": "2026",
      "cv-foot-left": "Eskay Da Real",
      "cv-foot-right": "Music Producer",
      "st-title": "story",
      "st-eyebrow": "About Him",
      "st-p1": "Eskay Da Real is more than just a DJ—he's a true artist and a passionate music enthusiast. With over 15 years of experience behind the decks, he's renowned for his adaptability and innovative mixes, seamlessly blending Hip Hop, R&B, Afro House, and Latino rhythms. His unique style has electrified the Parisian nightlife, captivating top clubs and festive venues with unforgettable performances.",
      "st-p2": "Taking his craft beyond borders, Eskay Da Real has introduced his signature French Touch and diverse cultural influences to the international stage, solidifying his place as a next-generation Open Format DJ. Whether he's performing live or producing in the studio, his technical skill and creative vision shine through. Eskay Da Real is also a sought-after beatmaker, collaborating with leading international artists to create standout tracks that push boundaries.",
      "so-ghost": "socialmedia",
      "mu-title": "music",
      "mu-eyebrow": "Style",
      "mu-handle": "@eskaydareal",
      "mu-card1": "music",
      "mu-card2": "style",
      "sk-title": "degree & skills",
      "sk-eyebrow": "Evolution",
      "tr-title": "they trust",
      "tr-eyebrow": "Location",
      "bk-ghost": "eskaydareal",
      "bk-foot": "eskaydareal@gmail.com",
    },
    genres: ["Hip Hop", "R&B", "Pop", "Afro", "House", "Electro", "Latino"].map(g => ({ label: g })),
    credentials: [
      { label: "Production Assistant Diploma", detail: "SAE Institute Paris" },
      { label: "Beatmaker & Art Director", detail: "Gomusic Paris" },
    ],
    venues: [
      { label: "Le Papillon", detail: "Paris 16" },
      { label: "Deep Lounge", detail: "Paris 15" },
      { label: "Le Prince", detail: "Paris 16" },
      { label: "Le Cozy", detail: "Auxerre 89" },
      { label: "Candy Shop", detail: "Paris 11" },
      { label: "Theatre St Germain", detail: "Paris 06" },
      { label: "Club Haussmann", detail: "Paris 09" },
      { label: "Carre Ponthieu", detail: "Paris 16" },
      { label: "L'Elysee Lounge", detail: "Paris 08" },
      { label: "Rive Droite", detail: "Boulogne 92" },
      { label: "Khao Suay", detail: "Paris 11" },
      { label: "Les Caves Lechapelais", detail: "Paris 17" },
      { label: "La Grande Brasserie", detail: "O'Parinor 93" },
      { label: "Hard Rock Cafe", detail: "Paris 09" },
      { label: "Pastel Rooftop Bar", detail: "Bangkok" },
    ],
    social: [
      { icon: "mail",      label: "eskaydareal@gmail.com", href: "mailto:eskaydareal@gmail.com" },
      { icon: "instagram", label: "@eskaydareal",          href: "https://instagram.com/eskaydareal" },
      { icon: "youtube",   label: "@eskaydareal",          href: "https://youtube.com/@eskaydareal" },
      { icon: "tiktok",    label: "@eskaydareal",          href: "https://tiktok.com/@eskaydareal" },
    ],
  },

  hardwell: {
    id: "hardwell",
    name: "Hardwell",
    desc: "Ejemplo — el mismo sistema con otro artista. Sin fotos: todos los slots quedan vacíos para que subas las tuyas.",
    wordmark: "hardwell",
    // Deliberately empty: the Hardwell kit is a template with drop zones, and
    // no Hardwell photography ships with it. Every slot opens as a hint.
    images: {},
    // The textures are brand furniture, not artist photography, so they carry over.
    sharedImages: {
      "st-spray": "assets/texture-spray-copper-2.png",
      "mu-spray": "assets/texture-spray-copper.png",
    },
    text: {
      "cv-kicker": "Press Kit",
      "cv-year": "2026",
      "cv-foot-left": "Hardwell",
      "cv-foot-right": "Rebels Never Die",
      "st-title": "biography",
      "st-eyebrow": "Robbert van de Corput",
      "st-p1": "Hardwell started out as a DJ, producer and remixer in his hometown of Breda, breaking internationally in 2009 with the bootleg \"Show Me Love vs Be\" and founding Revealed Recordings a year later — the label that would define a decade of festival electronic music. Gold- and platinum-certified singles followed, alongside the Hardwell On Air radio show and the pop-leaning debut album United We Are.",
      "st-p2": "After an indefinite hiatus from touring announced in 2018, he reset entirely: an unannounced headline set closing Ultra Miami in 2022 reintroduced a darker, techno-inflected sound built on punishing low-end and dystopian synth work. That evolution crystallised on the second album, REBELS NEVER DIE, and the 24-date world tour it launched.",
      "so-ghost": "socialmedia",
      "mu-title": "music",
      "mu-eyebrow": "Style",
      "mu-handle": "@hardwell",
      "mu-card1": "rebels",
      "mu-card2": "never die",
      "sk-title": "career",
      "sk-eyebrow": "Evolution",
      "tr-title": "on tour",
      "tr-eyebrow": "Location",
      "bk-ghost": "hardwell",
      "bk-foot": "booking@djhardwell.com",
    },
    genres: ["Big Room House", "Future Rave", "Peak-Time Techno", "Electro House", "Progressive"].map(g => ({ label: g })),
    credentials: [
      { label: "DJ Mag No.1 DJ", detail: "2013 and 2014" },
      { label: "Founder", detail: "Revealed Recordings, 2010" },
      { label: "Rebels Never Die", detail: "Studio album, 2022" },
    ],
    venues: [
      { label: "Ultra Music Festival", detail: "Miami" },
      { label: "Tomorrowland", detail: "Boom" },
      { label: "Amsterdam Music Festival", detail: "Amsterdam" },
      { label: "Creamfields", detail: "Cheshire" },
      { label: "EDC", detail: "Las Vegas" },
      { label: "Parookaville", detail: "Weeze" },
      { label: "Untold", detail: "Cluj-Napoca" },
      { label: "Airbeat One", detail: "Neustadt-Glewe" },
      { label: "Sunburn", detail: "Goa" },
      { label: "Escape Halloween", detail: "San Bernardino" },
    ],
    social: [
      { icon: "mail",      label: "booking@djhardwell.com", href: "mailto:booking@djhardwell.com" },
      { icon: "instagram", label: "@hardwell",              href: "https://instagram.com/hardwell" },
      { icon: "youtube",   label: "@hardwell",              href: "https://youtube.com/@hardwell" },
      { icon: "spotify",   label: "Hardwell",               href: "https://open.spotify.com/artist/6BrvowZBteWjTeOcAVPLCB" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BRAND HUE
// The brand is monochrome plus exactly one chromatic family. That family is a
// ramp of eight steps, not a single swatch, and the foil gradient is built out
// of those steps — so changing "the orange" means regenerating all of it.
//
// The offsets below were measured off the original copper ramp: relative to
// the core (copper-300), each step multiplies saturation and lightness by a
// fixed factor and drifts hue slightly warm toward the light end. Applying the
// same factors to any base colour reproduces the ramp's internal structure, so
// a new hue still reads as foil rather than as flat colour.
// ═══════════════════════════════════════════════════════════════════════════
const RAMP_OFFSETS = {
  100: [ 5.1, 1.1422, 1.2189],
  200: [ 2.8, 1.1186, 1.0828],
  300: [ 0.0, 1.0000, 1.0000],
  400: [-0.1, 0.9033, 0.9142],
  500: [-0.8, 0.8047, 0.8314],
  600: [-0.5, 0.6825, 0.7101],
  700: [-1.5, 0.7280, 0.5325],
  800: [-1.5, 0.7456, 0.3521],
};

const ACCENT_DEFAULT = "#E8926A"; // copper — the source kit's foil

const ACCENT_SWATCHES = [
  { hex: "#E8926A", label: "Copper" },
  { hex: "#D4AF37", label: "Gold" },
  { hex: "#C0C4CC", label: "Silver" },
  { hex: "#E0505A", label: "Crimson" },
  { hex: "#5FA8A0", label: "Verdigris" },
  { hex: "#8A7FD4", label: "Violet" },
];

function hexToHsl(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255,
        g = parseInt(h.slice(2, 4), 16) / 255,
        b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0, hue = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
  }
  return [hue, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(100, s)) / 100; l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60)       [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else              [r, g, b] = [c, 0, x];
  const to = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function buildRamp(baseHex) {
  const [h, s, l] = hexToHsl(baseHex);
  const ramp = {};
  for (const step of Object.keys(RAMP_OFFSETS)) {
    const [dh, rs, rl] = RAMP_OFFSETS[step];
    ramp[step] = hslToHex(h + dh, s * rs, l * rl);
  }
  return ramp;
}

function applyAccent(baseHex) {
  const r = buildRamp(baseHex || ACCENT_DEFAULT);
  const root = document.documentElement;
  for (const step of Object.keys(r)) root.style.setProperty(`--copper-${step}`, r[step]);
  const [cr, cg, cb] = [1, 3, 5].map((i) => parseInt(r[300].slice(i, i + 2), 16));
  root.style.setProperty("--accent-quiet", `rgba(${cr},${cg},${cb},.5)`);
  // The foil is the ramp read out of order — light, mid and dark steps
  // interleaved so the gradient reads as a metallic sheen, not a fade.
  root.style.setProperty("--foil-copper",
    `linear-gradient(104deg,${r[600]} 0%,${r[300]} 18%,${r[100]} 32%,${r[400]} 46%,${r[600]} 62%,${r[200]} 78%,${r[500]} 100%)`);
}

// ═══════════════════════════════════════════════════════════════════════════
// FILM STOCK
// Grain is a property of the whole kit, not of one photo — a press kit is
// printed on one stock. Each style ships a matched pair: a near-black plate
// that SCREENS over the stage grounds and a near-white plate that MULTIPLIES
// over the paper ones. All are seamless 400px tiles.
// ═══════════════════════════════════════════════════════════════════════════
const TEXTURES = {
  fine:   { label: "Fino",   desc: "Grano cerrado, casi digital",
            dark: "assets/texture-grain-fine.png",   paper: "assets/texture-paper-fine.png" },
  medium: { label: "Medio",  desc: "El del kit original",
            dark: "assets/texture-grain-medium.png", paper: "assets/texture-paper-medium.png" },
  coarse: { label: "Grueso", desc: "Película empujada, más sucio",
            dark: "assets/texture-grain-coarse.png", paper: "assets/texture-paper-coarse.png" },
  none:   { label: "Sin grano", desc: "Superficies limpias", dark: null, paper: null },
};

const TEXTURE_DEFAULT = "medium";
const GRAIN_DEFAULT = 55; // intensidad 0–100

function applyTexture(id, intensity) {
  const t = TEXTURES[id] || TEXTURES[TEXTURE_DEFAULT];
  const root = document.documentElement;
  const i = (intensity == null ? GRAIN_DEFAULT : intensity) / 100;
  if (!t.dark) {
    root.style.setProperty("--grain-opacity-dark", "0");
    root.style.setProperty("--grain-opacity-paper", "0");
    return;
  }
  root.style.setProperty("--grain-dark", `url("${t.dark}")`);
  root.style.setProperty("--grain-light", `url("${t.paper}")`);
  root.style.setProperty("--grain-opacity-dark", String(i));
  // Paper carries slightly less: multiply on a light ground bites harder.
  root.style.setProperty("--grain-opacity-paper", String(i * 0.9));
}

// One-click deploy targets. The repo is public, so these clone it into the
// visitor's own account rather than touching this deployment.
const REPO_URL = "https://github.com/solocachengue/djpresskit";
const DEPLOY = {
  // Drop takes a finished file and puts it online. The repository routes below
  // ask for a GitHub account and a new repo first, and then publish the empty
  // template anyway, because the edits never left the browser — so they are for
  // whoever wants to fork the template, not for publishing a kit.
  drop: "https://app.netlify.com/drop",
  netlify: `https://app.netlify.com/start/deploy?repository=${REPO_URL}`,
  vercel: `https://vercel.com/new/clone?repository-url=${encodeURIComponent(REPO_URL)}`,
};

Object.assign(window, {
  Icon, DisplayTitle, Eyebrow, Wordmark, GhostWord, IndexRow, SocialRow, SocialRail,
  SPREAD_TYPES, DEFAULT_SPREADS, PRESETS, IMAGE_SLOTS, ICON_OPTIONS,
  FORMATS, LAYOUT, resolveFormat, PORTRAIT_BREAKPOINT,
  buildRamp, applyAccent, ACCENT_DEFAULT, ACCENT_SWATCHES,
  TEXTURES, TEXTURE_DEFAULT, GRAIN_DEFAULT, applyTexture, DEPLOY, REPO_URL,
});
