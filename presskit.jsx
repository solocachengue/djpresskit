// ═══════════════════════════════════════════════════════════════════════════
// ESKAY DA REAL — PRESS KIT
// Seven landscape spreads (1280×655, the source artboard ratio), each one
// editable in place. The design system lives in design-system.jsx.
// ═══════════════════════════════════════════════════════════════════════════

const { useState, useEffect, useRef, useLayoutEffect } = React;
const { Icon, DisplayTitle, Eyebrow, Wordmark, GhostWord, IndexRow,
        SocialRow, SocialRail, SPREAD_TYPES, DEFAULT_SPREADS, PRESETS } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "wordmark": "eskaydareal",
  "presetId": "eskay"
}/*EDITMODE-END*/;

// ── Storage ─────────────────────────────────────────────────────────────────
const K = {
  text:    "eskay.text.v1",
  images:  "eskay.images.v1",
  opacity: "eskay.opacity.v1",
  spreads: "eskay.spreads.v1",
  genres:  "eskay.genres.v1",
  creds:   "eskay.credentials.v1",
  venues:  "eskay.venues.v1",
  social:  "eskay.social.v1",
  preset:  "eskay.preset.v1",
  accent:  "eskay.accent.v1",
  texture: "eskay.texture.v1",
  grain:   "eskay.grain.v1",
  format:  "eskay.format.v1",
  page:    "eskay.pagemode.v1",
};

// CSS mm→px, para calcular la escala de impresión como número puro:
// calc() no admite dividir una longitud por otra, así que `scale(calc(338mm/1280px))`
// era inválido y el navegador lo descartaba.
const MM_PX = 96 / 25.4;

// Dos maneras de llevar un tablero a una hoja:
//  · "exact"  — hoja a medida del tablero. Encaje perfecto, sin bandas, pero
//               depende de que el diálogo acepte un papel personalizado.
//  · "a4"     — A4 con la orientación del tablero. Deja bandas, pero es un papel
//               que todo diálogo tiene, así que nunca termina rotado.
function printPageCss(f, mode) {
  // The sheet is whatever the print dialog ends up using: `size` is a request,
  // not a guarantee. When the two disagree the frame overflows the sheet and
  // the spread is sliced across two pages — the failure this has to avoid.
  //
  //  · "a4"    — asks for A4 PORTRAIT and fits the spread across its width. A
  //              landscape board becomes a centred band. Portrait is what a
  //              dialog is already holding, and even if it lands on landscape
  //              A4 or Letter the box still fits, so it can never be cut.
  //  · "exact" — a sheet cut to the board. Edge to edge, no bands, but it needs
  //              the dialog to accept a custom paper size.
  let pw, ph, size;
  if (mode === "a4") {
    pw = 210; ph = 297; size = "A4 portrait";
  } else {
    const parts = f.page.split(" ");
    pw = parseFloat(parts[0]); ph = parseFloat(parts[1]);
    size = f.page;
  }
  const k = Math.min(pw * MM_PX / f.w, ph * MM_PX / f.h);
  // Centred with flex rather than computed offsets. The unscaled board is
  // centred in the frame and then scaled about its own centre, so it stays
  // centred without the page's pixel size entering the arithmetic — which
  // matters because the print layout viewport is not always the page box.
  // (translate(-50%,-50%) is not an option: its percentages resolve against
  // the element's UNSCALED box and overshoot whenever the scale is not 1.)
  return `@media print{@page{size:${size};margin:0}` +
    `.spread-frame{width:${pw}mm !important;height:${ph}mm !important;` +
    `overflow:hidden !important;position:relative !important;margin:0 !important;` +
    `display:flex !important;align-items:center !important;justify-content:center !important}` +
    `.spread-frame > .spread-scaler{position:static !important;flex:0 0 auto !important;` +
    `transform:scale(${k.toFixed(5)}) !important;transform-origin:center center !important}}`;
}






// Three layers, in precedence order:
//   1. localStorage — edits made in THIS browser, not published yet.
//   2. content.json — the published kit, committed to the repo and deployed.
//      This is what makes a kit portable: without it, edits live only in the
//      browser that made them, so a deployed copy always showed the template.
//   3. the preset — the built-in defaults.
// window.__PUBLISHED is filled in by boot() before the first render, so every
// component can keep reading its initial value synchronously at mount.
const loadJSON = (k, f) => {
  try {
    const s = localStorage.getItem(k);
    if (s != null) return JSON.parse(s);
  } catch {}
  const pub = window.__PUBLISHED;
  if (pub && pub[k] !== undefined) return pub[k];
  return f;
};
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const loadText  = () => loadJSON(K.text, {});
const saveText  = (t) => saveJSON(K.text, t);
const loadImages = () => loadJSON(K.images, {});
const saveImages = (i) => saveJSON(K.images, i);

// The active preset supplies every default: copy, lists and the wordmark.
const activePreset = () => PRESETS[loadJSON(K.preset, "eskay")] || PRESETS.eskay;

// Writes a whole preset into storage and reloads, so every mounted editable
// picks up the new copy. Reload is the honest way here — the editables read
// their initial value once at mount by design.
function applyPreset(id) {
  const p = PRESETS[id];
  if (!p) return;
  saveJSON(K.preset, id);
  saveJSON(K.text, { ...p.text });
  saveJSON(K.genres, p.genres);
  saveJSON(K.creds, p.credentials);
  saveJSON(K.venues, p.venues);
  saveJSON(K.social, p.social);
  try { localStorage.removeItem(K.spreads); } catch {}
  location.reload();
}

// ── Portable content ────────────────────────────────────────────────────────
// Gathers the EFFECTIVE state — what the kit actually shows right now, with
// preset defaults already folded in — rather than only the keys this browser
// happens to have touched. Exporting a kit you never edited must still produce
// a complete, self-contained file.
const CONTENT_FORMAT = "djpresskit/content@1";

function collectContent() {
  const p = activePreset();
  const storedText = (() => { try { return JSON.parse(localStorage.getItem(K.text)) || {}; } catch { return {}; } })();
  const storedImgs = (() => { try { return JSON.parse(localStorage.getItem(K.images)) || {}; } catch { return {}; } })();
  return {
    __format: CONTENT_FORMAT,
    __savedAt: new Date().toISOString(),
    [K.preset]:  loadJSON(K.preset, "eskay"),
    // Merge over the preset so the file stands on its own.
    [K.text]:    { ...p.text, ...(window.__PUBLISHED?.[K.text] || {}), ...storedText },
    [K.images]:  { ...p.images, ...p.sharedImages, ...(window.__PUBLISHED?.[K.images] || {}), ...storedImgs },
    [K.genres]:  loadJSON(K.genres, p.genres),
    [K.creds]:   loadJSON(K.creds, p.credentials),
    [K.venues]:  loadJSON(K.venues, p.venues),
    [K.social]:  loadJSON(K.social, p.social),
    [K.spreads]: loadJSON(K.spreads, [...DEFAULT_SPREADS]),
    [K.opacity]: loadJSON(K.opacity, {}),
    [K.accent]:  loadJSON(K.accent, window.ACCENT_DEFAULT),
    [K.texture]: loadJSON(K.texture, window.TEXTURE_DEFAULT),
    [K.grain]:   loadJSON(K.grain, window.GRAIN_DEFAULT),
  };
}

const prettySize = (b) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1) + " MB";

// ── Minimal ZIP writer (store, no compression) ──────────────────────────────
// Photos are already compressed — JPEG and PNG both — so deflating them would
// buy nothing and cost a CDN dependency. Storing them uncompressed keeps this
// to a few dozen lines and the bundle to the size of its parts.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function zipFiles(files) {
  const enc = new TextEncoder();
  const u16 = (n) => [n & 255, (n >>> 8) & 255];
  const u32 = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
  const chunks = [], central = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.data);
    const local = new Uint8Array([
      0x50, 0x4b, 0x03, 0x04, ...u16(20), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0),                                  // hora y fecha: fijas, el zip es reproducible
      ...u32(crc), ...u32(f.data.length), ...u32(f.data.length),
      ...u16(name.length), ...u16(0),
    ]);
    chunks.push(local, name, f.data);
    central.push({ name, crc, size: f.data.length, offset });
    offset += local.length + name.length + f.data.length;
  }
  const cdStart = offset;
  for (const e of central) {
    const h = new Uint8Array([
      0x50, 0x4b, 0x01, 0x02, ...u16(20), ...u16(20), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0),
      ...u32(e.crc), ...u32(e.size), ...u32(e.size),
      ...u16(e.name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0),
      ...u32(e.offset),
    ]);
    chunks.push(h, e.name);
    offset += h.length + e.name.length;
  }
  chunks.push(new Uint8Array([
    0x50, 0x4b, 0x05, 0x06, ...u16(0), ...u16(0),
    ...u16(central.length), ...u16(central.length),
    ...u32(offset - cdStart), ...u32(cdStart), ...u16(0),
  ]));
  return new Blob(chunks, { type: "application/zip" });
}

const MIME_EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

function dataUrlToBytes(url) {
  const comma = url.indexOf(",");
  const mime = (url.slice(0, comma).match(/data:([^;]+)/) || [])[1] || "image/png";
  const bin = atob(url.slice(comma + 1));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return { bytes: out, ext: MIME_EXT[mime] || "png" };
}

// Uploaded photos leave the JSON and become real files under assets/, with the
// JSON keeping only their paths. A kit with photos stays a few KB of text plus
// the images at their natural size, instead of one base64 blob a third larger
// than the originals that no CDN can cache separately.
function buildExport() {
  const data = collectContent();
  const images = data[K.images] || {};
  const files = [];
  const paths = {};
  for (const slot of Object.keys(images)) {
    const val = images[slot];
    if (typeof val === "string" && val.startsWith("data:")) {
      const { bytes, ext } = dataUrlToBytes(val);
      const name = `assets/kit-${slot}.${ext}`;
      files.push({ name, data: bytes });
      paths[slot] = name;
    } else {
      paths[slot] = val;
    }
  }
  data[K.images] = paths;
  const json = new TextEncoder().encode(JSON.stringify(data, null, 2));
  const photoBytes = files.reduce((n, f) => n + f.data.length, 0);
  return { data, files, json, photos: files.length, bytes: json.length + photoBytes };
}

function saveBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function exportContent() {
  const { files, json, photos } = buildExport();
  // With no uploaded photos there is nothing to bundle, so ship the bare file
  // rather than making someone unzip an archive holding one JSON.
  if (photos === 0) {
    saveBlob(new Blob([json], { type: "application/json" }), "content.json");
    return;
  }
  saveBlob(zipFiles([{ name: "content.json", data: json }, ...files]), "presskit-content.zip");
}

function importContent(file, onDone) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try { data = JSON.parse(reader.result); }
    catch { return alert("Ese archivo no es un JSON válido."); }
    if (!data || data.__format !== CONTENT_FORMAT) {
      return alert("Ese archivo no parece un content.json de este press kit.");
    }
    Object.keys(data).forEach((k) => {
      if (k.startsWith("__")) return;
      try { localStorage.setItem(k, JSON.stringify(data[k])); } catch {}
    });
    onDone && onDone();
    location.reload();
  };
  reader.readAsText(file);
}

// ── Editable text ───────────────────────────────────────────────────────────
function Editable({ tag = "span", id, fallback = "", className, style, multiline = false }) {
  const ref = useRef(null);
  const initial = (() => {
    const s = loadText();
    if (s[id] != null) return s[id];
    const p = activePreset();
    return p.text[id] != null ? p.text[id] : fallback;
  })();
  const [text] = useState(initial);
  useEffect(() => { if (ref.current && ref.current.innerText !== text) ref.current.innerText = text; }, []);
  const onBlur = () => { const s = loadText(); s[id] = ref.current.innerText; saveText(s); };
  const onKeyDown = (e) => { if (!multiline && e.key === "Enter") { e.preventDefault(); ref.current.blur(); } };
  const Tag = tag;
  return (
    <Tag ref={ref} contentEditable suppressContentEditableWarning spellCheck={false}
      className={className} style={style} onBlur={onBlur} onKeyDown={onKeyDown}>{text}</Tag>
  );
}

// ── Image slot ──────────────────────────────────────────────────────────────
// EVERY picture in this kit is a slot — photos, props, sprays, the sticker,
// the partner logos. Nothing is welded in, because all of it is Eskay's own
// material and another artist needs to swap it out.
//
// The starting picture comes from the active preset, never from the layout, so
// a preset with no photography (Hardwell) opens its slots empty.
//
// `mode="img"` renders a real <img> instead of a background, so a cut-out prop
// keeps its alpha and its drop-shadow follows the object rather than its box.
// `optional` slots vanish when empty and not editing — a dashed placeholder
// must never reach the printed PDF.
function ImageSlot({ id, className = "", style, hint, tone = "stage", editing,
                    filter, objectPosition, fit = "cover", mode = "bg",
                    optional = false, autoBlend = false, defaultOpacity = 1,
                    hintAlign = "center", children }) {
  const presetSrc = (() => {
    const p = activePreset();
    return (p.images && p.images[id]) || (p.sharedImages && p.sharedImages[id]) || null;
  })();
  const [src, setSrc] = useState(() => { const s = loadImages()[id]; return s !== undefined ? s : presetSrc; });
  const [opacity, setOpacity] = useState(() => { const o = loadJSON(K.opacity, {}); return o[id] != null ? o[id] : defaultOpacity; });
  const [showSlider, setShowSlider] = useState(false);
  const [blend, setBlend] = useState(null);
  const inputRef = useRef(null);

  // A mark laid over the stage has to lose its own plate. Which blend does that
  // depends on the plate: a white logo on black needs SCREEN, a black logo on
  // white needs MULTIPLY, and picking wrong stamps a solid box on the spread.
  // Rather than ask, sample the image's border and decide from it.
  useEffect(() => {
    if (!autoBlend || !src) { setBlend(null); return; }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const n = 32;
        const c = document.createElement("canvas");
        c.width = n; c.height = n;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, n, n);
        const d = ctx.getImageData(0, 0, n, n).data;
        let sum = 0, count = 0;
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const edge = x < 2 || y < 2 || x >= n - 2 || y >= n - 2;
            if (!edge) continue;
            const i = (y * n + x) * 4;
            if (d[i + 3] < 24) continue;            // ya transparente: no aporta
            sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
            count++;
          }
        }
        if (!count) return setBlend(null);          // plato transparente: sin fusión
        const luma = sum / count / 255;
        setBlend(luma < 0.35 ? "screen" : luma > 0.72 ? "multiply" : null);
      } catch { setBlend(null); }
    };
    img.src = src;
    return () => { cancelled = true; };
  }, [autoBlend, src]);

  const onPick = (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setSrc(reader.result); const i = loadImages(); i[id] = reader.result; saveImages(i); };
    reader.readAsDataURL(file);
  };
  const updateOpacity = (v) => { setOpacity(v); const o = loadJSON(K.opacity, {}); o[id] = v; saveJSON(K.opacity, o); };
  const clear = (e) => {
    e.stopPropagation();
    // Storing null (rather than deleting the key) is what distinguishes
    // "cleared on purpose" from "never touched", so a cleared slot doesn't
    // silently fall back to the preset photo on the next render.
    setSrc(null); const i = loadImages(); i[id] = null; saveImages(i);
  };

  if (!src && optional && !editing) return null;

  const label = hint || (window.IMAGE_SLOTS[id] && window.IMAGE_SLOTS[id].hint) || "subir imagen";
  const isImgMode = mode === "img";

  const bg = (src && !isImgMode) ? {
    backgroundImage: `url(${src})`, backgroundSize: fit,
    backgroundPosition: objectPosition || "center", backgroundRepeat: "no-repeat",
    filter: filter || undefined,
  } : {};

  return (
    <div data-slot={id}
      className={`upload ${className} ${src ? "has-image" : ""} ${isImgMode ? "is-prop" : ""} ${tone === "paper" ? "on-paper" : ""}`}
      style={{ ...style, ...bg, "--image-opacity": opacity }}
      onClick={() => inputRef.current && inputRef.current.click()}>
      <input ref={inputRef} type="file" accept="image/*" onChange={onPick} />
      {isImgMode && src && (
        // A cut-out prop dims via its own opacity: the ::before scrim the photo
        // slots use would paint a black rectangle across its transparency.
        <img src={src} alt="" aria-hidden="true"
          style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: objectPosition || "center",
                   display: "block", filter: filter || undefined, opacity,
                   mixBlendMode: blend || undefined, pointerEvents: "none" }} />
      )}
      {/* The cover stacks a full-bleed slot, a centred mark and a centred prop.
          Centring every hint puts three labels on the same spot, so each one
          is anchored where the others are not. */}
      <div className={`hint align-${hintAlign}`}><div className="icon">+</div><div>{label}</div></div>
      {/* Once a slot holds a picture its hint disappears, and the cover stacks
          three of them — full-bleed photo, background mark, prop — on the same
          centre. Without a name on each, there is no way to tell which one you
          are about to replace. */}
      {src && editing && <span className="slot-badge">{label}</span>}
      {children}
      {src && editing && (
        <>
          <button className="img-control img-opacity-btn" title="Brillo"
            onClick={(e) => { e.stopPropagation(); setShowSlider(!showSlider); }}>◐</button>
          <button className="img-control img-remove-btn" title="Quitar" onClick={clear}>✕</button>
          {showSlider && (
            <div className="img-slider-pop" onClick={(e) => e.stopPropagation()}>
              <label>Brillo de imagen</label>
              <input type="range" min="0.1" max="1" step="0.05" value={opacity}
                onChange={(e) => updateOpacity(parseFloat(e.target.value))} />
              <span>{Math.round(opacity * 100)}%</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Editable numbered index ─────────────────────────────────────────────────
// Every list in this brand is an index. This is the one editor behind all
// three of them (genres, credentials, venues).
function IndexEditor({ storageKey, presetKey, tone = "on-stage", ruleWidth = 120,
                       gap = 16, fontSize, editing, withDetail = true, start = 1, slice, addLabel = "Agregar" }) {
  const [items, setItems] = useState(() => loadJSON(storageKey, activePreset()[presetKey] || []));
  const persist = (next) => { setItems(next); saveJSON(storageKey, next); };
  const update = (i, k, v) => persist(items.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => persist([...items, { label: "Nuevo", detail: withDetail ? "Detalle" : "" }]);
  const remove = (i) => persist(items.filter((_, idx) => idx !== i));

  const shown = slice ? items.slice(slice[0], slice[1]) : items;
  const offset = slice ? slice[0] : 0;

  return (
    <>
      <ol className="ds-index" style={{ gap, "--index-fs": fontSize ? fontSize + "px" : undefined }}>
        {shown.map((it, i) => {
          const realIdx = offset + i;
          return (
            <li key={realIdx} className={`ds-index-row ${tone}`}>
              <span className="ds-index-n">{String(start + realIdx).padStart(2, "0")}.</span>
              {ruleWidth > 0 && <span className="ds-index-rule" style={{ width: ruleWidth }} aria-hidden="true" />}
              <span className="ds-index-label">
                <span contentEditable suppressContentEditableWarning spellCheck={false}
                  onBlur={(e) => update(realIdx, "label", e.currentTarget.innerText)}>{it.label}</span>
                {withDetail && (it.detail || editing) ? (
                  <span className="ds-index-detail">
                    {", "}
                    <span contentEditable suppressContentEditableWarning spellCheck={false}
                      onBlur={(e) => update(realIdx, "detail", e.currentTarget.innerText)}>{it.detail || "—"}</span>
                  </span>
                ) : null}
              </span>
              {editing && <button className="row-rm" onClick={() => remove(realIdx)} title="Quitar">✕</button>}
            </li>
          );
        })}
      </ol>
      {editing && !slice && (
        <button className={`add-row ${tone === "on-paper" ? "on-paper" : ""}`} onClick={add}>+ {addLabel}</button>
      )}
    </>
  );
}

// The social list feeds three spreads — the row on 03 and the rails on 05 and
// 07 — so it lives in App and comes down as a prop. Editing it in one place
// has to update all three without a reload.

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 01 — COVER
// Black stage, copper foil wordmark, floating prop, tracked footline.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadCover({ wordmark, editing, fmt }) {
  const L = window.LAYOUT.cover[fmt];
  return (
    <div className="spread" style={{ background: "var(--ink-800)" }}>
      {/* The cover photo was the one image slot with no brand treatment, while
          the system allows exactly two — warm or b&w — and assumes dark,
          tightly-shot imagery. A daylight photo dropped in here survived the
          scrim at ~170/255 and swallowed the foil wordmark, so it now carries
          the warm treatment and opens knocked down; ◐ raises it. */}
      <ImageSlot id="cv-hero" editing={editing} optional hintAlign="top"
        filter="var(--filter-warm)" defaultOpacity={.6}
        style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <span className="deco" style={{ position: "absolute", inset: 0, background: "var(--scrim-full)", zIndex: 1 }} />

      {/* Background mark: a logo set enormous behind the content, the image
          counterpart of the ghost wordmark. Composited with SCREEN so a mark
          delivered on an opaque black plate — most DJ logos are — drops its
          background instead of stamping a visible box on the stage. */}
      <ImageSlot id="cv-mark" editing={editing} optional mode="img" fit="contain" autoBlend
        defaultOpacity={.5} hintAlign="bottom"
        style={{ position: "absolute", left: "50%", top: "48%",
                 transform: "translate(-50%,-50%)",
                 width: fmt === "portrait" ? 330 : 780,
                 height: fmt === "portrait" ? 330 : 420, zIndex: 2 }} />

      <div className="grain" />

      <div className="layer" style={{ position: "absolute", top: L.barY, left: L.gutter, right: L.gutter,
                                      zIndex: 4, display: "flex", justifyContent: "space-between" }}>
        <Eyebrow tone="on-stage" size={L.eyebrow}><Editable id="cv-kicker" fallback="Press Kit" /></Eyebrow>
        <Eyebrow tone="on-stage" size={L.eyebrow}><Editable id="cv-year" fallback="2026" /></Eyebrow>
      </div>

      <div className="layer" style={{ position: "absolute", inset: 0, zIndex: 3, display: "flex",
                                      flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <ImageSlot id="cv-prop" editing={editing} mode="img" fit="contain" optional
          filter="drop-shadow(0 24px 60px rgba(0,0,0,.45))"
          style={{ width: L.propW, height: L.propH, marginBottom: L.propGap }} />
        <Wordmark size={L.wordmark} style={{ lineHeight: .92, textAlign: "center" }}>
          <Editable id="cv-wordmark" fallback={wordmark} />
        </Wordmark>
      </div>

      <div className="layer" style={{ position: "absolute", bottom: L.barY, left: L.gutter, right: L.gutter,
                                      zIndex: 4, display: "flex", justifyContent: "space-between" }}>
        <Eyebrow tone="on-stage" size={L.eyebrow}><Editable id="cv-foot-left" fallback="Eskay Da Real" /></Eyebrow>
        <Eyebrow tone="on-stage" size={L.eyebrow}><Editable id="cv-foot-right" fallback="Music Producer" /></Eyebrow>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 02 — STORY / ABOUT
// Paper ground. The bio is the only paragraph text in seven spreads, and it is
// justified with hyphenation — a deliberate print-magazine choice.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadStory({ editing, fmt }) {
  const L = window.LAYOUT.story[fmt];
  return (
    <div className="spread" style={{ background: "var(--paper-100)" }}>
      <div className="grain grain--paper" />
      <div className="layer" style={{ position: "absolute", inset: 0, zIndex: 3, ...L.body }}>
        <div style={{ display: "flex", flexDirection: "column", ...L.col }}>
          <div className="ds-heading">
            <DisplayTitle size={L.title} tone="ink"><Editable id="st-title" fallback="story" /></DisplayTitle>
            <Eyebrow tone="on-paper" size={L.eyebrow}><Editable id="st-eyebrow" fallback="About Him" /></Eyebrow>
          </div>
          <div className="ds-bio on-paper" style={{ maxWidth: L.bioMax, fontSize: L.bio, gap: L.bioGap }}>
            <p><Editable id="st-p1" multiline fallback="" /></p>
            <p><Editable id="st-p2" multiline fallback="" /></p>
          </div>
        </div>
        <div style={L.figure}>
          <ImageSlot id="st-spray" editing={editing} mode="img" fit="contain" optional
            style={{ ...L.spray, opacity: .9 }} />
          <ImageSlot id="st-portrait" editing={editing} filter="var(--filter-warm)"
            style={{ ...L.photo, boxShadow: "var(--shadow-photo)", zIndex: 3 }} />
          {L.stickerScope === "figure" && (
            <ImageSlot id="st-sticker" editing={editing} mode="img" fit="contain" optional
              style={L.sticker} />
          )}
        </div>
        {L.stickerScope === "page" && (
          <ImageSlot id="st-sticker" editing={editing} mode="img" fit="contain" optional
            style={L.sticker} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 03 — SOCIAL MEDIA
// Full-bleed b&w portrait, giant ghosted wordmark, contact row.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadSocial({ editing, social, fmt }) {
  const L = window.LAYOUT.social[fmt];
  return (
    <div className="spread" style={{ background: "var(--ink-800)" }}>
      <ImageSlot id="so-portrait" editing={editing}
        filter="var(--filter-bw)" objectPosition="28% 20%"
        style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <span className="deco" style={{ position: "absolute", inset: 0, background: "var(--scrim-full)", zIndex: 1 }} />
      <GhostWord size={L.ghost} opacity={.1}
        style={{ top: L.ghostTop, textAlign: "center", transform: "translateY(-50%)" }}>
        <Editable id="so-ghost" fallback="socialmedia" />
      </GhostWord>
      <div className="grain" />
      <div className="layer" style={{ position: "absolute", left: 0, right: 0, bottom: L.bottom, zIndex: 5,
                                      display: "flex", justifyContent: "center" }}>
        {/* Four handles with their labels do not fit across a 432px board, so
            the row becomes a column rather than wrapping into ragged pairs. */}
        <SocialRow items={social} size={L.iconSize} gap={L.gap}
          style={L.dir === "column" ? { flexDirection: "column", alignItems: "center" } : null} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 04 — MUSIC / STYLE
// Numbered genre index against cover art and a vinyl record.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadMusic({ editing, fmt }) {
  const L = window.LAYOUT.music[fmt];
  return (
    <div className="spread" style={{ background: "var(--ink-850)" }}>
      <div className="grain" />
      <ImageSlot id="mu-spray" editing={editing} mode="img" fit="contain" optional
        style={{ ...L.spray, opacity: .9, zIndex: 2 }} />
      <div className="layer" style={{ position: "absolute", inset: 0, zIndex: 3, ...L.body }}>
        <div style={{ display: "flex", flexDirection: "column", ...L.col }}>
          <div className="ds-heading">
            <DisplayTitle size={L.title}><Editable id="mu-title" fallback="music" /></DisplayTitle>
            <Eyebrow tone="on-stage" size={L.eyebrow}><Editable id="mu-eyebrow" fallback="Style" /></Eyebrow>
          </div>
          <div>
            <IndexEditor storageKey={K.genres} presetKey="genres" ruleWidth={L.indexRule}
              gap={L.indexGap} fontSize={L.indexFs} editing={editing} withDetail={false}
              addLabel="Agregar género" />
          </div>
        </div>
        <div style={L.figure}>
          <ImageSlot id="mu-vinyl" editing={editing} mode="img" fit="contain" optional
            filter="drop-shadow(0 24px 60px rgba(0,0,0,.45))"
            style={{ ...L.vinyl, zIndex: 2 }} />
          <ImageSlot id="mu-art" editing={editing} filter="var(--filter-bw)" objectPosition="50% 18%"
            style={{ ...L.art, background: "var(--ink-900)", boxShadow: "var(--shadow-photo)", zIndex: 3 }}>
            <span className="deco" style={{ position: "absolute", inset: 0, background: "var(--scrim-left)", zIndex: 3 }} />
            <div style={{ position: "absolute", ...L.card, zIndex: 4 }}>
              <div style={{ fontSize: L.cardHandle, color: "var(--text-muted)", marginBottom: 5 }}>
                <Editable id="mu-handle" fallback="@eskaydareal" />
              </div>
              <div className="ds-display paper" style={{ fontSize: L.cardLine, lineHeight: .9 }}>
                <Editable id="mu-card1" fallback="music" style={{ display: "block" }} />
                <Editable id="mu-card2" fallback="style" style={{ display: "block" }} />
              </div>
            </div>
          </ImageSlot>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 05 — DEGREE & SKILLS / EVOLUTION
// Credentials index on paper, partner marks bottom-left, social rail right.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadSkills({ editing, social, fmt }) {
  const L = window.LAYOUT.skills[fmt];
  return (
    <div className="spread" style={{ background: "var(--paper-100)" }}>
      <div className="grain grain--paper" />
      <ImageSlot id="sk-prop" editing={editing} mode="img" fit="contain" optional tone="paper"
        style={{ ...L.prop, zIndex: 2 }} />
      <div className="layer" style={{ display: "flex", flexDirection: "column", zIndex: 3, ...L.col }}>
        <div className="ds-heading">
          <DisplayTitle size={L.title} tone="ink"><Editable id="sk-title" fallback="degree & skills" /></DisplayTitle>
          <Eyebrow tone="on-paper" size={L.eyebrow}><Editable id="sk-eyebrow" fallback="Evolution" /></Eyebrow>
        </div>
        <div>
          <IndexEditor storageKey={K.creds} presetKey="credentials" tone="on-paper"
            ruleWidth={0} gap={L.indexGap} fontSize={L.indexFs} editing={editing}
            addLabel="Agregar credencial" />
        </div>
      </div>
      <div className="layer" style={{ zIndex: 4, display: "flex", alignItems: "flex-end", ...L.logos }}>
        <ImageSlot id="sk-logo1" editing={editing} mode="img" tone="paper" fit="contain"
          objectPosition="bottom left" style={{ width: L.logoH, height: L.logoH }} />
        <ImageSlot id="sk-logo2" editing={editing} mode="img" tone="paper" fit="contain"
          objectPosition="bottom left" style={{ width: L.logoH * 1.16, height: L.logoH }} />
      </div>
      <SocialRail items={social} size={L.rail.size} gap={L.rail.gap}
        style={{ position: "absolute", right: L.rail.right, top: "50%", transform: "translateY(-50%)", zIndex: 5 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 06 — THEY TRUST / LOCATION
// Two-column numbered venue index over a scrimmed venue photograph.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadTrust({ editing, fmt }) {
  const L = window.LAYOUT.trust[fmt];
  const venues = loadJSON(K.venues, activePreset().venues || []);
  // The portrait board is too narrow for two columns of venue names, so the
  // index runs as one list rather than truncating the entries.
  const half = L.columns === 2 ? Math.ceil(venues.length / 2) : venues.length;
  return (
    <div className="spread" style={{ background: "var(--ink-800)" }}>
      <ImageSlot id="tr-photo" editing={editing} filter="var(--filter-bw)"
        style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <span className="deco" style={{ position: "absolute", inset: 0, background: "rgba(8,7,7,.66)", zIndex: 1 }} />
      <div className="grain" />
      <div className="layer" style={{ position: "absolute", inset: 0, display: "flex",
                                      flexDirection: "column", zIndex: 4, ...L.body }}>
        <div className="ds-heading">
          <DisplayTitle size={L.title}><Editable id="tr-title" fallback="they trust" /></DisplayTitle>
          <Eyebrow tone="on-stage" size={L.eyebrow}><Editable id="tr-eyebrow" fallback="Location" /></Eyebrow>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: L.columns === 2 ? "auto auto" : "auto",
                      columnGap: L.colGap, alignItems: "start", justifyContent: "start" }}>
          <div>
            <IndexEditor storageKey={K.venues} presetKey="venues" ruleWidth={L.ruleWidth}
              gap={L.indexGap} fontSize={L.indexFs} editing={editing} slice={[0, half]} />
          </div>
          {L.columns === 2 && (
            <div>
              <IndexEditor storageKey={K.venues} presetKey="venues" ruleWidth={L.ruleWidth}
                gap={L.indexGap} fontSize={L.indexFs} editing={editing} slice={[half, venues.length]} />
            </div>
          )}
        </div>
        {editing && (
          <button className="add-row" style={{ marginTop: 0 }}
            onClick={() => { saveJSON(K.venues, [...venues, { label: "Nuevo Venue", detail: "Ciudad" }]); location.reload(); }}>
            + Agregar venue
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 07 — BACK COVER
// Torn-paper collage splitting the composition on a diagonal.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadBack({ wordmark, editing, social, fmt }) {
  const L = window.LAYOUT.back[fmt];
  return (
    <div className="spread" style={{ background: "var(--ink-900)" }}>
      <ImageSlot id="bk-photo" editing={editing}
        filter="var(--filter-warm) brightness(.9)" objectPosition="46% 30%"
        style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <span className="deco" style={{ position: "absolute", inset: 0, background: "var(--scrim-left)", zIndex: 1 }} />
      {/* Starts clear of the torn-paper collage: tucked behind it, a short name
          loses its opening letters. It is meant to be cut by the artboard edge. */}
      <GhostWord size={L.ghost} opacity={.14} style={L.ghostStyle}>
        <Editable id="bk-ghost" fallback={wordmark} />
      </GhostWord>

      {/* The source uses a photographed torn edge; this is a straight diagonal
          clip standing in for it, turned with the board. */}
      <div className="deco" style={{ position: "absolute", inset: 0, background: "var(--paper-100)",
                                     clipPath: L.wedge, opacity: .96, zIndex: 2 }}>
        <span style={{ position: "absolute", inset: 0, backgroundImage: "var(--grain-light)",
                       backgroundSize: "400px", opacity: .5, mixBlendMode: "multiply" }} />
      </div>
      <div className="deco" style={{ position: "absolute", ...L.bar,
                                     background: "var(--copper-700)", opacity: .85, zIndex: 3 }} />
      <div className="grain" />

      <div className="layer" style={{ position: "absolute", zIndex: 5, left: L.foot.left,
                                      bottom: L.foot.bottom, top: L.foot.top, width: L.foot.width }}>
        <div className="ds-eyebrow on-paper"
          style={{ fontSize: L.foot.fontSize, letterSpacing: "var(--ls-label)", lineHeight: 1.7, wordBreak: "break-word" }}>
          <Editable id="bk-foot" fallback="eskaydareal@gmail.com" />
        </div>
      </div>

      <SocialRail items={social} size={L.rail.size} gap={L.rail.gap}
        style={{ position: "absolute", right: L.rail.right, top: "50%", transform: "translateY(-50%)", zIndex: 5 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════
function PresetModal({ open, onClose, currentId, social, setSocial }) {
  const fileRef = useRef(null);
  const [info, setInfo] = useState({ bytes: 0, photos: 0 });
  useEffect(() => {
    if (!open) return;
    const { bytes, photos } = buildExport();
    setInfo({ bytes, photos });
  }, [open]);
  if (!open) return null;
  const published = window.__PUBLISHED && Object.keys(window.__PUBLISHED).length > 0;
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>contenido</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-hint">
          Un solo diseño — el sistema Eskay Da Real. Lo que cambiás acá es el <b>contenido</b>:
          Eskay es el kit original, Hardwell es el mismo sistema cargado con otro artista para
          que veas que todo es editable. Cargar un preset reemplaza los textos y las listas.
        </p>
        <div className="preset-grid">
          {Object.values(PRESETS).map((p) => (
            <button key={p.id} className={`preset-card ${currentId === p.id ? "active" : ""}`}
              onClick={() => {
                if (currentId === p.id) return onClose();
                if (!confirm(`Cargar el contenido de "${p.name}"?\n\nReemplaza los textos y listas actuales. Las fotos que hayas subido se mantienen.`)) return;
                applyPreset(p.id);
              }}>
              <div className="preset-thumb" style={{ background: "var(--ink-800)" }}>
                <div className="preset-thumb-name">{p.wordmark}</div>
                <div className="preset-thumb-sub">{p.text["cv-foot-right"]}</div>
              </div>
              <div className="preset-info">
                <div className="preset-name">{p.name}</div>
                <div className="preset-desc">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="modal-section">Links y redes</div>
        <p className="modal-hint" style={{ marginBottom: 14 }}>
          Una sola lista alimenta los tres spreads que muestran contacto: la fila de
          <i> social media</i>, y los rieles verticales de <i>degree &amp; skills</i> y la
          contratapa. El texto se ve solo en la fila; en los rieles el ícono va solo.
        </p>
        <div className="link-list">
          {social.map((it, i) => (
            <div className="link-row" key={i}>
              <span className="link-icon"><Icon name={it.icon} size={20} /></span>
              <select value={it.icon}
                onChange={(e) => setSocial(social.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))}>
                {window.ICON_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              <input value={it.label} placeholder="@handle o texto" spellCheck={false}
                onChange={(e) => setSocial(social.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
              <input value={it.href} placeholder="https://..." spellCheck={false}
                onChange={(e) => setSocial(social.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} />
              <span className="link-ctrl">
                <button onClick={() => { if (i === 0) return; const n = [...social]; [n[i-1], n[i]] = [n[i], n[i-1]]; setSocial(n); }}
                  disabled={i === 0} title="Subir">↑</button>
                <button onClick={() => { if (i === social.length - 1) return; const n = [...social]; [n[i], n[i+1]] = [n[i+1], n[i]]; setSocial(n); }}
                  disabled={i === social.length - 1} title="Bajar">↓</button>
                <button className="danger" onClick={() => setSocial(social.filter((_, j) => j !== i))} title="Quitar">✕</button>
              </span>
            </div>
          ))}
        </div>
        <button className="add-row" style={{ marginTop: 12 }}
          onClick={() => setSocial([...social, { icon: "instagram", label: "@usuario", href: "https://instagram.com/usuario" }])}>
          + Agregar link
        </button>

        <div className="modal-section">Llevarte los cambios</div>
        <p className="modal-hint" style={{ marginBottom: 16 }}>
          Lo que editás se guarda en <b>este navegador</b>. Para que tu press kit viaje
          — a otra compu, a tu sitio publicado, o a quien le pases el link — exportalo,
          descomprimilo en la raíz del repo y hacé push. La app lee el
          <code> content.json</code> al cargar y lo usa como contenido base.{" "}
          {published
            ? <b style={{ color: "var(--accent)" }}>Este sitio ya está cargando un content.json publicado.</b>
            : "Todavía no hay ninguno publicado, así que se ven los valores del preset."}
        </p>
        <p className="modal-hint" style={{ marginBottom: 16 }}>
          {info.photos > 0
            ? <>Tenés <b>{info.photos}</b> {info.photos === 1 ? "foto propia" : "fotos propias"}. Salen como
              archivos sueltos en <code>assets/</code> y el JSON se queda solo con las rutas, así
              que el kit no engorda: se baja un <code>.zip</code> con todo adentro.</>
            : <>No subiste fotos propias todavía, así que se baja un <code>content.json</code> solo.
              Cuando subas alguna, el export pasa a ser un <code>.zip</code> con las fotos en <code>assets/</code>.</>}
        </p>
        <div className="deploy-row">
          <button className="deploy-btn" onClick={exportContent}>
            ↓ Exportar {info.photos > 0 ? "kit (.zip)" : "content.json"}{" "}
            <span style={{ color: "var(--text-muted)" }}>({prettySize(info.bytes)})</span>
          </button>
          <button className="deploy-btn" onClick={() => fileRef.current && fileRef.current.click()}>
            ↑ Importar content.json
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) importContent(f); }} />
        </div>
        <p className="modal-hint" style={{ marginTop: 14, marginBottom: 0 }}>
          El zip trae <code>content.json</code> en la raíz y las fotos en <code>assets/</code>:
          descomprimilo <b>encima del repo</b> respetando las carpetas. Para importar alcanza
          con el <code>content.json</code>; las fotos las toma del repo una vez desplegado.
        </p>
      </div>
    </div>
  );
}

// The hue, the film stock and the deploy links live here rather than in the
// Tweaks panel: that panel only opens when an embedding host activates it, so
// on the published site it never appears and its controls are unreachable.
function StyleModal({ open, onClose, fmtChoice, setFmtChoice, format,
                     accent, setAccent, texture, setTexture, grain, setGrain }) {
  if (!open) return null;
  const ramp = window.buildRamp(accent);
  const t = window.TEXTURES;

  const NetlifyMark = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.3 22.7 12 12 22.7 1.3 12 12 1.3zm0 3.1L4.4 12l7.6 7.6 7.6-7.6L12 4.4z" />
    </svg>
  );
  const VercelMark = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 23 21H1L12 2z" /></svg>
  );

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>estilo</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-hint">
          La marca es monocromo más <b>un solo color</b>. Ese color no es un valor suelto:
          es una rampa de 8 pasos de la que sale el degradado del foil, así que al cambiarlo
          se regenera todo — títulos, numerales, reglas e íconos.
        </p>

        <div className="modal-section">Formato</div>
        <p className="modal-hint" style={{ marginBottom: 14 }}>
          El kit tiene dos tableros. El <b>horizontal</b> es el spread del press kit
          original. El <b>vertical</b> no es ese spread apretado: un tablero 1.95:1
          escalado a un teléfono deja el cuerpo de texto en 4px, así que es un tablero
          propio, con su composición y su escala tipográfica. En <b>automático</b> se
          usa el vertical cuando la pantalla es angosta.
        </p>
        <div className="fmt-row">
          {[{ id: "auto", label: "Automático", desc: "Según el ancho de pantalla" },
            { id: "landscape", label: window.FORMATS.landscape.label, desc: window.FORMATS.landscape.desc },
            { id: "portrait", label: window.FORMATS.portrait.label, desc: window.FORMATS.portrait.desc }].map((o) => (
            <button key={o.id} className={`fmt-card ${fmtChoice === o.id ? "active" : ""}`}
              onClick={() => setFmtChoice(o.id)}>
              <span className={`fmt-shape ${o.id}`} aria-hidden="true" />
              <span className="fmt-name">{o.label}</span>
              <span className="fmt-desc">{o.desc}</span>
            </button>
          ))}
        </div>
        <p className="modal-hint" style={{ marginTop: 12, marginBottom: 0 }}>
          Ahora estás viendo el <b style={{ color: "var(--accent)" }}>{format.label.toLowerCase()}</b>
          {" "}({format.w}×{format.h}). El PDF sale en hoja {format.page.replace(" ", " × ")}, con ese mismo
          ratio, así que cada página va completa y sin bandas.
        </p>

        <div className="modal-section">Color principal</div>
        <div className="swatches">
          {window.ACCENT_SWATCHES.map((s) => (
            <button key={s.hex} title={s.label}
              className={`swatch ${accent.toLowerCase() === s.hex.toLowerCase() ? "active" : ""}`}
              onClick={() => setAccent(s.hex)}>
              <span className="swatch-fill" style={{ background: s.hex }} />
            </button>
          ))}
          <span className="swatch-name">o elegí uno</span>
        </div>
        <div className="hue-row">
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
          <input className="hue-hex" value={accent.toUpperCase()} spellCheck={false}
            onChange={(e) => {
              const v = e.target.value.trim();
              if (/^#[0-9a-fA-F]{6}$/.test(v)) setAccent(v);
            }} />
          <div className="ramp-strip" title="La rampa generada">
            {[100, 200, 300, 400, 500, 600, 700, 800].map((k) => (
              <span key={k} style={{ background: ramp[k] }} title={`${k} · ${ramp[k]}`} />
            ))}
          </div>
        </div>

        <div className="modal-section">Textura · grano de película</div>
        <div className="texture-grid">
          {Object.entries(t).map(([id, tex]) => (
            <button key={id} className={`texture-card ${texture === id ? "active" : ""}`}
              onClick={() => setTexture(id)}>
              <div className={`texture-swatch ${id === "none" ? "" : ""}`}>
                {tex.dark && <span className="tex" style={{ backgroundImage: `url(${tex.dark})` }} />}
              </div>
              <div className="texture-info">
                <div className="texture-name">{tex.label}</div>
                <div className="texture-desc">{tex.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="slider-row">
          <label htmlFor="grain-range">Intensidad</label>
          <input id="grain-range" type="range" min="0" max="100" step="5" value={grain}
            disabled={texture === "none"}
            onChange={(e) => setGrain(parseInt(e.target.value, 10))} />
          <output>{texture === "none" ? "—" : grain + "%"}</output>
        </div>

        <div className="modal-section">Publicar tu copia</div>
        <p className="modal-hint" style={{ marginBottom: 14 }}>
          Estos botones clonan el repo en tu cuenta y lo dejan online. No tocan este sitio.
        </p>
        <div className="deploy-row">
          <a className="deploy-btn" href={window.DEPLOY.netlify} target="_blank" rel="noopener noreferrer">
            <NetlifyMark /> Deploy en Netlify
          </a>
          <a className="deploy-btn" href={window.DEPLOY.vercel} target="_blank" rel="noopener noreferrer">
            <VercelMark /> Deploy en Vercel
          </a>
        </div>
      </div>
    </div>
  );
}

// Chrome honours the @page size we stamp — a headless print of this page comes
// out as exact 338x173mm landscape sheets. But the print dialog's Paper size
// dropdown is sticky, and if it holds a portrait paper the browser rotates our
// landscape page box to fit it: the kit arrives sideways with white bands. The
// setting is one click away, so the dialog is preceded by what to check rather
// than letting it fail silently.
function PrintModal({ open, onClose, format, fmtChoice, setFmtChoice, pageMode, setPageMode }) {
  if (!open) return null;
  const go = () => { onClose(); setTimeout(() => window.print(), 60); };
  const landscape = format.id === "landscape";
  const sheet = pageMode === "a4" ? "A4 vertical (210 × 297mm)" : format.page.replace(" ", " × ");
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-inner" style={{ width: "min(620px,100%)" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>pdf</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-section" style={{ marginTop: 0 }}>Formato del press kit</div>
        <div className="fmt-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {["landscape", "portrait"].map((id) => (
            <button key={id} className={`fmt-card ${format.id === id ? "active" : ""}`}
              onClick={() => setFmtChoice(id)}>
              <span className={`fmt-shape ${id}`} aria-hidden="true" />
              <span className="fmt-name">{window.FORMATS[id].label}</span>
              <span className="fmt-desc">{window.FORMATS[id].w}×{window.FORMATS[id].h}</span>
            </button>
          ))}
        </div>

        <div className="modal-section">Hoja</div>
        <div className="fmt-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <button className={`fmt-card ${pageMode === "exact" ? "active" : ""}`}
            onClick={() => setPageMode("exact")}>
            <span className="fmt-name">A medida</span>
            <span className="fmt-desc">{format.page.replace(" ", " × ")} — encaje perfecto, sin bandas. Necesita papel personalizado en el diálogo.</span>
          </button>
          <button className={`fmt-card ${pageMode === "a4" ? "active" : ""}`}
            onClick={() => setPageMode("a4")}>
            <span className="fmt-name">A4 · siempre entra</span>
            <span className="fmt-desc">Hoja A4 vertical con el spread ajustado al ancho. Deja bandas, pero no se corta ni se rota con ninguna configuración del diálogo.</span>
          </button>
        </div>
        <p className="modal-hint" style={{ marginTop: 12 }}>
          {pageMode === "a4"
            ? <>Vas a imprimir en <b style={{ color: "var(--accent)" }}>{sheet}</b>, con el spread centrado y
              ajustado al ancho. Es el modo a prueba de diálogo: entre en la hoja que entre, no se corta.</>
            : <>Vas a imprimir en <b style={{ color: "var(--accent)" }}>{sheet}</b>, borde a borde y sin bandas.
              Necesita que el diálogo acepte <b>papel personalizado</b>; si te sale cortado o de costado,
              volvé a <b>A4</b>.</>}
        </p>

        <div className="modal-section">En el diálogo</div>
        <ol className="print-steps">
          <li><b>Destino</b> → <code>Guardar como PDF</code>.</li>
          <li>
            <b>Tamaño de papel</b> → <code>{pageMode === "a4" ? "A4" : "Personalizado"}</code>
            {pageMode === "exact" && <span>Si no te deja elegirlo, usá el modo A4 de arriba.</span>}
          </li>
          <li>
            <b>Orientación</b> → <code>{pageMode === "a4" ? "Vertical" : (landscape ? "Horizontal" : "Vertical")}</code>.
          </li>
          <li>
            <b>Gráficos de fondo</b> → activado, en <i>Más configuraciones</i>.
            <span>Sin esto se pierden las fotos, el grano y el foil.</span>
          </li>
        </ol>
        <div className="deploy-row">
          <button className="deploy-btn" onClick={go}>↓ Abrir diálogo de impresión</button>
          <button className="deploy-btn" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function SpreadBuilder({ open, onClose, spreads, setSpreads }) {
  if (!open) return null;
  const move = (i, dir) => {
    const j = i + dir; if (j < 0 || j >= spreads.length) return;
    const next = [...spreads]; [next[i], next[j]] = [next[j], next[i]]; setSpreads(next);
  };
  const remove = (i) => {
    if (spreads.length <= 1) return alert("Necesitás al menos 1 spread.");
    setSpreads(spreads.filter((_, idx) => idx !== i));
  };
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-inner" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>spreads</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-hint">
          Reordená, sacá o volvé a agregar spreads. Podés repetir un tipo si necesitás
          dos páginas del mismo formato.
        </p>

        <div className="modal-section">Tu kit — {spreads.length} spreads</div>
        <div className="builder-list">
          {spreads.map((id, i) => (
            <div className="builder-item" key={i}>
              <span className="builder-item-num">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="builder-item-name">{SPREAD_TYPES[id]?.label || id}</span>
                <div className="builder-item-desc">{SPREAD_TYPES[id]?.desc || ""}</div>
              </span>
              <span className="builder-item-ctrl">
                <button onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button onClick={() => move(i, 1)} disabled={i === spreads.length - 1}>↓</button>
                <button onClick={() => remove(i)} className="danger">✕</button>
              </span>
            </div>
          ))}
        </div>

        <div className="modal-section">Agregar spread</div>
        <div className="builder-add-grid">
          {Object.entries(SPREAD_TYPES).map(([id, info]) => (
            <button key={id} className="builder-add-card" onClick={() => setSpreads([...spreads, id])}>
              <div className="builder-add-name">{info.label}</div>
              <div className="builder-add-desc">{info.desc}</div>
              <div className="builder-add-plus">+ AGREGAR</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════
function App() {
  const [tweaks, setTweak] = useTweaks({ ...TWEAK_DEFAULTS, presetId: loadJSON(K.preset, "eskay") });
  const [editing, setEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showStyle, setShowStyle] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const bookRef = useRef(null);

  // Hue and film stock are kit-wide, so they persist on their own keys and are
  // reapplied on every mount — a reload must not silently revert the look.
  // "auto" serves the portrait board on narrow viewports; an explicit choice wins.
  const [fmtChoice, setFmtChoiceRaw] = useState(() => loadJSON(K.format, "auto"));
  const setFmtChoice = (v) => { setFmtChoiceRaw(v); saveJSON(K.format, v); };
  const [format, setFormat] = useState(() => window.resolveFormat(loadJSON(K.format, "auto")));
  const [pageMode, setPageModeRaw] = useState(() => loadJSON(K.page, "a4"));
  const setPageMode = (v) => { setPageModeRaw(v); saveJSON(K.page, v); };

  const [social, setSocialRaw] = useState(() => loadJSON(K.social, activePreset().social || []));
  const setSocial = (next) => { setSocialRaw(next); saveJSON(K.social, next); };

  const [accent, setAccentRaw] = useState(() => loadJSON(K.accent, window.ACCENT_DEFAULT));
  const [texture, setTextureRaw] = useState(() => loadJSON(K.texture, window.TEXTURE_DEFAULT));
  const [grain, setGrainRaw] = useState(() => loadJSON(K.grain, window.GRAIN_DEFAULT));
  const setAccent = (v) => { setAccentRaw(v); saveJSON(K.accent, v); };
  const setTexture = (v) => { setTextureRaw(v); saveJSON(K.texture, v); };
  const setGrain = (v) => { setGrainRaw(v); saveJSON(K.grain, v); };

  useLayoutEffect(() => { window.applyAccent(accent); }, [accent]);
  useLayoutEffect(() => { window.applyTexture(texture, grain); }, [texture, grain]);

  const [spreads, setSpreadsRaw] = useState(() => {
    const saved = loadJSON(K.spreads, null);
    return Array.isArray(saved) && saved.length ? saved : [...DEFAULT_SPREADS];
  });
  const setSpreads = (next) => { setSpreadsRaw(next); saveJSON(K.spreads, next); };

  // Spreads are authored at 1280×655 and scaled to fit — that keeps every
  // measurement from the source artboards exact instead of re-deriving them.
  useLayoutEffect(() => {
    const el = bookRef.current;
    if (!el) return;
    const root = document.documentElement;
    const fit = () => {
      const f = window.resolveFormat(fmtChoice);
      setFormat((prev) => (prev.id === f.id ? prev : f));
      root.style.setProperty("--sw", f.w + "px");
      root.style.setProperty("--sh", f.h + "px");
      const w = el.clientWidth;
      if (w > 0) {
        const k = Math.min(f.maxScale, w / f.w);
        root.style.setProperty("--spread-scale", String(k));
        // scale(1) still promotes the spread to its own compositing layer, and a
        // blended layer captured mid-raster can show the previous raster under
        // the current one — a ghost of the content offset behind itself. At
        // exactly 1 there is nothing to scale, so the layer is not created.
        root.style.setProperty("--spread-transform", k === 1 ? "none" : `scale(${k})`);
      }
      // @page can't read a custom property, so the print sheet is stamped into
      // its own style element and follows whichever board is on screen.
      let tag = document.getElementById("print-page-size");
      if (!tag) { tag = document.createElement("style"); tag.id = "print-page-size"; document.head.appendChild(tag); }
      tag.textContent = printPageCss(f, pageMode);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, [fmtChoice, pageMode]);

  // The wordmark shown in the chrome must follow the EDITED name, not the
  // preset's: a published kit renamed to another artist was still labelled
  // "eskaydareal" in the top bar.
  const wordmark = loadText()["cv-wordmark"] || activePreset().wordmark;

  const resetAll = () => {
    if (!confirm("¿Borrar todo lo editado y volver al contenido del preset?")) return;
    Object.values(K).forEach((k) => localStorage.removeItem(k));
    location.reload();
  };

  const renderSpread = (id, i) => {
    const props = { editing, wordmark, social, fmt: format.id, key: `${id}-${i}` };
    switch (id) {
      case "cover":  return <SpreadCover {...props} />;
      case "story":  return <SpreadStory {...props} />;
      case "social": return <SpreadSocial {...props} />;
      case "music":  return <SpreadMusic {...props} />;
      case "skills": return <SpreadSkills {...props} />;
      case "trust":  return <SpreadTrust {...props} />;
      case "back":   return <SpreadBack {...props} />;
      default: return null;
    }
  };

  const preset = activePreset();

  return (
    <>
      <div className="topbar">
        <span className="topbar-mark">{wordmark}</span>
        <button className={`tb-btn ${editing ? "active" : ""}`} onClick={() => setEditing(!editing)}>
          {editing ? "✓ Listo" : "✎ Editar"}
        </button>
        <button className="tb-btn" onClick={() => setShowPresets(true)}>◆ Contenido</button>
        <button className="tb-btn" onClick={() => setShowBuilder(true)}>☰ Spreads ({spreads.length})</button>
        <button className="tb-btn" onClick={() => setShowStyle(true)}>
          <span style={{ color: "var(--accent)" }}>●</span> Estilo
        </button>
        <span className="topbar-spacer" />
        <a className="tb-btn" href={window.DEPLOY.netlify} target="_blank" rel="noopener noreferrer"
           style={{ textDecoration: "none" }}>◆ Netlify</a>
        <button className="tb-btn primary" onClick={() => setShowPrint(true)}>↓ PDF</button>
      </div>

      <div className={`book ${editing ? "is-editing" : ""}`} ref={bookRef}>
        {spreads.map((id, i) => (
          <div className="spread-frame" key={`${id}-${i}`}>
            <div className="spread-scaler">{renderSpread(id, i)}</div>
          </div>
        ))}
      </div>

      <PrintModal open={showPrint} onClose={() => setShowPrint(false)} format={format}
        fmtChoice={fmtChoice} setFmtChoice={setFmtChoice}
        pageMode={pageMode} setPageMode={setPageMode} />
      <StyleModal open={showStyle} onClose={() => setShowStyle(false)}
        fmtChoice={fmtChoice} setFmtChoice={setFmtChoice} format={format}
        accent={accent} setAccent={setAccent}
        texture={texture} setTexture={setTexture}
        grain={grain} setGrain={setGrain} />
      <PresetModal open={showPresets} onClose={() => setShowPresets(false)} currentId={preset.id}
        social={social} setSocial={setSocial} />
      <SpreadBuilder open={showBuilder} onClose={() => setShowBuilder(false)}
        spreads={spreads} setSpreads={setSpreads} />

      <TweaksPanel title="Press Kit">
        <TweakSection label="Contenido">
          <TweakButton label={`Preset actual: ${preset.name}`} onClick={() => setShowPresets(true)} />
          <div style={{ fontSize: 10, color: "#999", marginTop: 6, fontFamily: "JetBrains Mono, monospace", lineHeight: 1.5 }}>
            {preset.desc}
          </div>
        </TweakSection>

        <TweakSection label="Spreads">
          <TweakButton label={`Editar spreads (${spreads.length})`} onClick={() => setShowBuilder(true)} />
          <TweakButton label={editing ? "Salir de modo edición" : "Modo edición inline"}
            onClick={() => setEditing(!editing)} secondary />
        </TweakSection>

        <TweakSection label="Exportar">
          <TweakButton label="Descargar PDF" onClick={() => setShowPrint(true)} />
          <div style={{ fontSize: 10, color: "#999", marginTop: 6, fontFamily: "JetBrains Mono, monospace", lineHeight: 1.5 }}>
            Imprime en hoja apaisada 338×173mm, el mismo ratio que los spreads.
            Activá "Gráficos de fondo" en el diálogo de impresión.
          </div>
        </TweakSection>

        <TweakSection label="Acciones">
          <TweakButton label="Resetear todo" onClick={resetAll} secondary />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

// content.json is fetched BEFORE the first render, not after: every editable
// reads its initial value once at mount, so arriving late would leave the page
// showing the template until a reload. A missing file is the normal case for a
// fresh clone — it just means "no published content yet".
async function boot() {
  let published = null;
  try {
    const res = await fetch("content.json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.__format === CONTENT_FORMAT) published = data;
      else console.warn("[presskit] content.json ignorado: formato desconocido");
    }
  } catch (e) {
    // Sin archivo publicado todavía: se usan los defaults del preset.
  }
  window.__PUBLISHED = published || {};

  // Nothing is painted until the display face is in. Every measurement in the
  // kit — the index rows, the justified bio, the wordmark — is set in that
  // face, so a first paint in the fallback lays the spread out at different
  // metrics and then reflows. Both paints could end up composited at once,
  // which is what the duplicated "they trust" was: one ghost in the fallback
  // font under the real one, not a duplicated element.
  if (document.fonts && document.fonts.ready) {
    await Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 3000)),   // no dejar la página en blanco si la fuente no llega
    ]);
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}

boot();
