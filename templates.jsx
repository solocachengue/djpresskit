// 20 estructural templates + 8 font pairings.
// Each template defines: color palette + default font + ordered list of page IDs.

const FONT_OPTIONS = [
  { id: "anton",     label: "Anton",          family: "'Anton', sans-serif" },
  { id: "bebas",     label: "Bebas Neue",     family: "'Bebas Neue', sans-serif" },
  { id: "archivo",   label: "Archivo Black",  family: "'Archivo Black', sans-serif" },
  { id: "playfair",  label: "Playfair",       family: "'Playfair Display', serif" },
  { id: "dmserif",   label: "DM Serif",       family: "'DM Serif Display', serif" },
  { id: "rubikmono", label: "Rubik Mono",     family: "'Rubik Mono One', monospace" },
  { id: "majormono", label: "Major Mono",     family: "'Major Mono Display', monospace" },
  { id: "spacegrot", label: "Space Grotesk",  family: "'Space Grotesk', sans-serif" },
];
window.FONT_OPTIONS = FONT_OPTIONS;
const fontFamily = (id) => (FONT_OPTIONS.find(f => f.id === id) || FONT_OPTIONS[0]).family;
window.fontFamily = fontFamily;

const PALETTES = {
  neonPink:    { bg: "#0a0608", ink: "#f7f2f5", inkSoft: "#b9a9b3", inkDim: "#6b5d65", line: "rgba(255,255,255,0.08)", accent: "#ff2bd6" },
  technoBlue:  { bg: "#08090d", ink: "#e6f0ff", inkSoft: "#9aacc4", inkDim: "#566578", line: "rgba(255,255,255,0.08)", accent: "#00d4ff" },
  houseWarm:   { bg: "#1a0f0a", ink: "#f4e8d8", inkSoft: "#c9b896", inkDim: "#7a6850", line: "rgba(255,200,140,0.10)", accent: "#ff8c42" },
  minimalLite: { bg: "#f5f4f0", ink: "#0a0a0a", inkSoft: "#444",     inkDim: "#888",     line: "rgba(0,0,0,0.10)",        accent: "#0a0a0a" },
  acidGreen:   { bg: "#050706", ink: "#e8ffe8", inkSoft: "#9ec99e", inkDim: "#557055", line: "rgba(34,255,136,0.08)",   accent: "#22ff88" },
  trapPurple:  { bg: "#0c0617", ink: "#f0e8ff", inkSoft: "#b09ed4", inkDim: "#665585", line: "rgba(168,85,247,0.10)",   accent: "#a855f7" },
  bloodRed:    { bg: "#0a0202", ink: "#ffe8e8", inkSoft: "#c49a9a", inkDim: "#7a4f4f", line: "rgba(255,59,59,0.10)",    accent: "#ff3b3b" },
  creamSoul:   { bg: "#f0e6d2", ink: "#2a1810", inkSoft: "#5a4530", inkDim: "#8a7560", line: "rgba(42,24,16,0.12)",     accent: "#a8341e" },
  y2k:         { bg: "#0a0014", ink: "#e8f8ff", inkSoft: "#9ec0d8", inkDim: "#557588", line: "rgba(255,0,255,0.10)",    accent: "#ff00ff" },
  sunset:      { bg: "#1a0a0a", ink: "#fff0e0", inkSoft: "#d4a896", inkDim: "#7a5848", line: "rgba(255,140,80,0.10)",   accent: "#ff6b35" },
  midnightGold:{ bg: "#0a0808", ink: "#faf0d8", inkSoft: "#c4b088", inkDim: "#7a6850", line: "rgba(212,175,55,0.12)",   accent: "#d4af37" },
  matrix:      { bg: "#000000", ink: "#00ff66", inkSoft: "#00aa44", inkDim: "#005522", line: "rgba(0,255,102,0.15)",    accent: "#00ff66" },
  pastel:      { bg: "#fef0f5", ink: "#3a1a2a", inkSoft: "#7a4a60", inkDim: "#aa7a90", line: "rgba(58,26,42,0.10)",     accent: "#e0508a" },
  navy:        { bg: "#0a1428", ink: "#f0f4ff", inkSoft: "#9aaccc", inkDim: "#556788", line: "rgba(255,255,255,0.10)",  accent: "#fbbf24" },
  graffiti:    { bg: "#100a18", ink: "#ffffff", inkSoft: "#bbaacc", inkDim: "#665588", line: "rgba(255,255,0,0.12)",    accent: "#ffd700" },
  paperWhite:  { bg: "#ffffff", ink: "#0a0a0a", inkSoft: "#444",     inkDim: "#999",     line: "rgba(0,0,0,0.08)",        accent: "#ff3b3b" },
  jungle:      { bg: "#021a0a", ink: "#d8ffd8", inkSoft: "#88c08a", inkDim: "#447a48", line: "rgba(0,255,100,0.10)",    accent: "#33ff88" },
  oceanic:     { bg: "#001428", ink: "#e0f0ff", inkSoft: "#88aacc", inkDim: "#446688", line: "rgba(0,200,255,0.10)",    accent: "#00ccff" },
};

// 12 page types. Each template lists which pages and in what order.
const PAGE_TYPES = {
  cover:        { label: "Cover",                 desc: "Portada con foto editorial + tagline + contacto" },
  bio:          { label: "Bio & Sound",           desc: "Biografía + comparables + géneros + datos" },
  live:         { label: "Live & Performance",    desc: "Foto cabina + video + clubes/festivales" },
  music:        { label: "Mixes & Releases",      desc: "Sets + último release con artwork" },
  press:        { label: "Press / Recognition",   desc: "Quotes + números de streaming" },
  rider:        { label: "Tech Rider & Booking",  desc: "Setup + no negociables + contacto" },
  discography:  { label: "Discography",           desc: "Lista de releases con artwork y sello" },
  manifesto:    { label: "Manifesto",             desc: "Una página de declaración / movimiento / filosofía" },
  festivals:    { label: "Festivals & Lineups",   desc: "Festivales con tier + flyer destacado" },
  services:     { label: "Services & Packages",   desc: "Para mobile/wedding DJs: paquetes y precios" },
  timeline:     { label: "Career Timeline",       desc: "Highlights por año (perfecto para legacy DJs)" },
  tourmap:      { label: "World Tour Map",        desc: "Mapa de ciudades + lista de fechas internacionales" },
  brands:       { label: "Brand Collaborations",  desc: "Colabs con marcas / activaciones" },
  radio:        { label: "Radio Show",            desc: "Programa de radio o podcast con guests" },
  streaming:    { label: "Streaming Highlights",  desc: "Boiler Room / streams / view counts" },
  contact:      { label: "Contact only",          desc: "Página final solo de contacto + redes" },
};
window.PAGE_TYPES = PAGE_TYPES;

const TEMPLATES = [
  { id: "standard-pro",     name: "Standard Pro",            genre: "Multi-purpose",          palette: PALETTES.neonPink,    font: "anton",
    pages: ["cover", "bio", "live", "music", "press", "rider"] },
  { id: "club-dj",          name: "Club DJ",                 genre: "House · Tech-house",     palette: PALETTES.technoBlue,  font: "archivo",
    pages: ["cover", "bio", "live", "music", "rider"] },
  { id: "producer-dj",      name: "Producer-DJ",             genre: "Producer focus",          palette: PALETTES.midnightGold, font: "playfair",
    pages: ["cover", "bio", "discography", "live", "press", "rider"] },
  { id: "festival-dj",      name: "Festival DJ",             genre: "Big stage · EDM",        palette: PALETTES.sunset,      font: "anton",
    pages: ["cover", "bio", "festivals", "live", "press", "rider"] },
  { id: "emerging",         name: "Emerging / New DJ",       genre: "Just starting",          palette: PALETTES.minimalLite, font: "spacegrot",
    pages: ["cover", "bio", "music", "rider"] },
  { id: "scene-builder",    name: "Scene Builder",           genre: "Cachengue · Movement",   palette: PALETTES.neonPink,    font: "anton",
    pages: ["cover", "bio", "manifesto", "live", "music", "press", "rider"] },
  { id: "mobile-wedding",   name: "Mobile / Wedding",        genre: "Events · Weddings",      palette: PALETTES.creamSoul,   font: "playfair",
    pages: ["cover", "services", "press", "music", "rider", "contact"] },
  { id: "brand-dj",         name: "Brand DJ",                genre: "Lifestyle · Aesthetic",  palette: PALETTES.pastel,      font: "dmserif",
    pages: ["cover", "bio", "brands", "live", "music", "rider"] },
  { id: "international",    name: "International Touring",   genre: "World tour",             palette: PALETTES.navy,        font: "playfair",
    pages: ["cover", "bio", "tourmap", "festivals", "music", "rider"] },
  { id: "radio-podcast",    name: "Radio / Podcast DJ",      genre: "On air",                 palette: PALETTES.bloodRed,    font: "rubikmono",
    pages: ["cover", "bio", "radio", "music", "rider"] },
  { id: "underground",      name: "Underground / Warehouse", genre: "Raves · Warehouse",      palette: PALETTES.matrix,      font: "majormono",
    pages: ["cover", "manifesto", "live", "music", "rider"] },
  { id: "open-format",      name: "Open Format",             genre: "Multi-genre",            palette: PALETTES.graffiti,    font: "archivo",
    pages: ["cover", "bio", "live", "music", "press", "rider"] },
  { id: "vinyl-selector",   name: "Vinyl / Selector",        genre: "Diggers · Curators",     palette: PALETTES.creamSoul,   font: "dmserif",
    pages: ["cover", "bio", "music", "radio", "live", "rider"] },
  { id: "live-hybrid",      name: "Live Hybrid",             genre: "DJ + live elements",     palette: PALETTES.acidGreen,   font: "rubikmono",
    pages: ["cover", "bio", "manifesto", "live", "discography", "rider"] },
  { id: "boiler-room",      name: "Boiler Room",             genre: "Streaming-forward",      palette: PALETTES.y2k,         font: "majormono",
    pages: ["cover", "bio", "streaming", "live", "music", "rider"] },
  { id: "label-boss",       name: "Label Boss",              genre: "Owner + DJ",             palette: PALETTES.bloodRed,    font: "archivo",
    pages: ["cover", "bio", "discography", "live", "rider"] },
  { id: "turntablist",      name: "Hip-Hop / Turntablist",   genre: "Scratch · Battles",      palette: PALETTES.graffiti,    font: "archivo",
    pages: ["cover", "bio", "live", "music", "press", "rider"] },
  { id: "latin-urbano",     name: "Latin / Urbano",          genre: "Reggaeton · Trap",       palette: PALETTES.trapPurple,  font: "anton",
    pages: ["cover", "bio", "festivals", "brands", "music", "rider"] },
  { id: "techno-house",     name: "Techno / House EU",       genre: "Berlin · Ibiza tier",    palette: PALETTES.technoBlue,  font: "archivo",
    pages: ["cover", "bio", "festivals", "discography", "music", "press", "rider"] },
  { id: "veteran",          name: "Veteran / Legacy",        genre: "20+ years career",       palette: PALETTES.paperWhite,  font: "playfair",
    pages: ["cover", "timeline", "bio", "live", "discography", "press", "rider"] },
];
window.TEMPLATES = TEMPLATES;

window.applyTemplate = function(template) {
  if (!template) return;
  const root = document.documentElement;
  const p = template.palette;
  root.style.setProperty("--page-bg", p.bg);
  root.style.setProperty("--bg", p.bg);
  root.style.setProperty("--ink", p.ink);
  root.style.setProperty("--ink-soft", p.inkSoft);
  root.style.setProperty("--ink-dim", p.inkDim);
  root.style.setProperty("--line", p.line);
  root.style.setProperty("--accent", p.accent);
  const hex = p.accent.replace("#",""); 
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0,2),16);
    const g = parseInt(hex.slice(2,4),16);
    const b = parseInt(hex.slice(4,6),16);
    root.style.setProperty("--accent-soft", `rgba(${r},${g},${b},0.18)`);
    root.style.setProperty("--accent-glow", `rgba(${r},${g},${b},0.55)`);
  }
  root.style.setProperty("--display-font", fontFamily(template.font));
};

function TemplatesModal({ open, onClose, currentId, onSelect }) {
  if (!open) return null;
  return (
    <div className="templates-modal" onClick={onClose}>
      <div className="templates-inner" onClick={(e) => e.stopPropagation()}>
        <div className="templates-head">
          <h2>Elegí tu <span className="accent">Template</span></h2>
          <button className="templates-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#888', marginTop: -10, marginBottom: 18, letterSpacing: '0.05em' }}>
          20 estructuras curadas. Cada una define páginas + paleta + tipografía. Después podés agregar/quitar páginas en cualquier momento.
        </p>
        <div className="templates-grid">
          {TEMPLATES.map(t => (
            <div key={t.id}
              className={`template-card ${currentId === t.id ? 'active' : ''}`}
              onClick={() => { onSelect(t); onClose(); }}>
              <div className="template-preview" style={{ background: t.palette.bg }}>
                <TemplatePreview template={t} />
              </div>
              <div className="template-info">
                <div className="template-name" style={{ fontFamily: fontFamily(t.font), color: t.palette.ink }}>
                  {t.name}
                </div>
                <div className="template-genre">{t.genre}</div>
                <div className="template-pages">
                  {t.pages.length} páginas · {t.pages.slice(0, 3).map(p => PAGE_TYPES[p].label).join(' · ')}{t.pages.length > 3 ? '…' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplatePreview({ template }) {
  const p = template.palette;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      padding: '14px 12px', display: 'flex', flexDirection: 'column',
      background: p.bg, color: p.ink,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 7, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: p.accent, marginBottom: 6,
      }}>◆ {template.pages.length} páginas</div>
      <div style={{
        fontFamily: fontFamily(template.font),
        fontSize: 28, lineHeight: 0.86, textTransform: 'uppercase',
        color: p.ink,
      }}>DJ</div>
      <div style={{
        fontFamily: fontFamily(template.font),
        fontSize: 28, lineHeight: 0.86, textTransform: 'uppercase',
        color: p.accent,
      }}>FUEGO</div>
      <div style={{ fontSize: 7, marginTop: 8, color: p.inkSoft, lineHeight: 1.4 }}>
        {template.pages.slice(0,4).map(pg => PAGE_TYPES[pg].label).join(' · ')}
      </div>
      <div style={{ marginTop: 'auto', height: 1, background: p.line }}></div>
    </div>
  );
}

window.TemplatesModal = TemplatesModal;
