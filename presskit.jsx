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
};

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
                    optional = false, children }) {
  const presetSrc = (() => {
    const p = activePreset();
    return (p.images && p.images[id]) || (p.sharedImages && p.sharedImages[id]) || null;
  })();
  const [src, setSrc] = useState(() => { const s = loadImages()[id]; return s !== undefined ? s : presetSrc; });
  const [opacity, setOpacity] = useState(() => { const o = loadJSON(K.opacity, {}); return o[id] != null ? o[id] : 1; });
  const [showSlider, setShowSlider] = useState(false);
  const inputRef = useRef(null);

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
                   display: "block", filter: filter || undefined, opacity, pointerEvents: "none" }} />
      )}
      <div className="hint"><div className="icon">+</div><div>{label}</div></div>
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
                       gap = 16, editing, withDetail = true, start = 1, slice, addLabel = "Agregar" }) {
  const [items, setItems] = useState(() => loadJSON(storageKey, activePreset()[presetKey] || []));
  const persist = (next) => { setItems(next); saveJSON(storageKey, next); };
  const update = (i, k, v) => persist(items.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => persist([...items, { label: "Nuevo", detail: withDetail ? "Detalle" : "" }]);
  const remove = (i) => persist(items.filter((_, idx) => idx !== i));

  const shown = slice ? items.slice(slice[0], slice[1]) : items;
  const offset = slice ? slice[0] : 0;

  return (
    <>
      <ol className="ds-index" style={{ gap }}>
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
function SpreadCover({ wordmark, editing }) {
  return (
    <div className="spread" style={{ background: "var(--ink-800)" }}>
      <ImageSlot id="cv-hero" editing={editing} optional
        style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <span className="deco" style={{ position: "absolute", inset: 0, background: "var(--scrim-full)", zIndex: 1 }} />
      <div className="grain" />

      <div className="layer" style={{ position: "absolute", top: 54, left: 110, right: 110, zIndex: 4,
                    display: "flex", justifyContent: "space-between" }}>
        <Eyebrow tone="on-stage" size={11}><Editable id="cv-kicker" fallback="Press Kit" /></Eyebrow>
        <Eyebrow tone="on-stage" size={11}><Editable id="cv-year" fallback="2026" /></Eyebrow>
      </div>

      <div className="layer" style={{ position: "absolute", inset: 0, zIndex: 3, display: "flex",
                    flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <ImageSlot id="cv-prop" editing={editing} mode="img" fit="contain" optional
          filter="drop-shadow(0 24px 60px rgba(0,0,0,.45))"
          style={{ width: 300, height: 210, marginBottom: -18 }} />
        <Wordmark size={132} style={{ lineHeight: .92, textAlign: "center" }}>
          <Editable id="cv-wordmark" fallback={wordmark} />
        </Wordmark>
      </div>

      <div className="layer" style={{ position: "absolute", bottom: 54, left: 110, right: 110, zIndex: 4,
                    display: "flex", justifyContent: "space-between" }}>
        <Eyebrow tone="on-stage" size={11}><Editable id="cv-foot-left" fallback="Eskay Da Real" /></Eyebrow>
        <Eyebrow tone="on-stage" size={11}><Editable id="cv-foot-right" fallback="Music Producer" /></Eyebrow>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 02 — STORY / ABOUT
// Paper ground. The bio is the only paragraph text in seven spreads, and it is
// justified with hyphenation — a deliberate print-magazine choice.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadStory({ editing }) {
  return (
    <div className="spread" style={{ background: "var(--paper-100)" }}>
      <div className="grain grain--paper" />
      <div className="layer" style={{ position: "absolute", inset: 0, display: "grid",
                    gridTemplateColumns: "1fr 1.05fr", alignItems: "center",
                    padding: "0 0 0 110px", gap: 60, zIndex: 3 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <div className="ds-heading">
            <DisplayTitle size={72} tone="ink"><Editable id="st-title" fallback="story" /></DisplayTitle>
            <Eyebrow tone="on-paper"><Editable id="st-eyebrow" fallback="About Him" /></Eyebrow>
          </div>
          <div className="ds-bio on-paper" style={{ maxWidth: 440, fontSize: 13.5, gap: 18 }}>
            <p><Editable id="st-p1" multiline fallback="" /></p>
            <p><Editable id="st-p2" multiline fallback="" /></p>
          </div>
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <ImageSlot id="st-spray" editing={editing} mode="img" fit="contain" optional
            style={{ position: "absolute", left: -70, bottom: 40, width: 140, height: 230, opacity: .9, zIndex: 2 }} />
          <ImageSlot id="st-portrait" editing={editing} filter="var(--filter-warm)"
            style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                     width: 500, height: 500, boxShadow: "var(--shadow-photo)", zIndex: 3 }} />
          <ImageSlot id="st-sticker" editing={editing} mode="img" fit="contain" optional
            style={{ position: "absolute", left: -34, bottom: 56, width: 96, height: 96, zIndex: 4 }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 03 — SOCIAL MEDIA
// Full-bleed b&w portrait, giant ghosted wordmark, contact row.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadSocial({ editing, social }) {
  return (
    <div className="spread" style={{ background: "var(--ink-800)" }}>
      <ImageSlot id="so-portrait" editing={editing}
        filter="var(--filter-bw)" objectPosition="28% 20%"
        style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <span className="deco" style={{ position: "absolute", inset: 0, background: "var(--scrim-full)", zIndex: 1 }} />
      <GhostWord size={230} opacity={.1} style={{ top: "52%", textAlign: "center", transform: "translateY(-50%)" }}>
        <Editable id="so-ghost" fallback="socialmedia" />
      </GhostWord>
      <div className="grain" />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, zIndex: 5,
                    display: "flex", justifyContent: "center" }}>
        <SocialRow items={social} size={20} gap={26} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 04 — MUSIC / STYLE
// Numbered genre index against cover art and a vinyl record.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadMusic({ editing }) {
  return (
    <div className="spread" style={{ background: "var(--ink-850)" }}>
      <div className="grain" />
      <ImageSlot id="mu-spray" editing={editing} mode="img" fit="contain" optional
        style={{ position: "absolute", left: 470, top: 60, width: 130, height: 280, opacity: .9, zIndex: 2 }} />
      <div className="layer" style={{ position: "absolute", inset: 0, display: "grid",
                    gridTemplateColumns: "1fr 1.5fr", alignItems: "center",
                    padding: "0 0 0 110px", gap: 40, zIndex: 3 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 44,
                      borderRight: "1px solid var(--rule-on-stage)", paddingRight: 56,
                      height: "64%", justifyContent: "center" }}>
          <div className="ds-heading">
            <DisplayTitle size={70}><Editable id="mu-title" fallback="music" /></DisplayTitle>
            <Eyebrow tone="on-stage"><Editable id="mu-eyebrow" fallback="Style" /></Eyebrow>
          </div>
          <div>
            <IndexEditor storageKey={K.genres} presetKey="genres" ruleWidth={110}
              gap={14} editing={editing} withDetail={false} addLabel="Agregar género" />
          </div>
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <ImageSlot id="mu-vinyl" editing={editing} mode="img" fit="contain" optional
            filter="drop-shadow(0 24px 60px rgba(0,0,0,.45))"
            style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
                     width: 420, height: 420, zIndex: 2 }} />
          <ImageSlot id="mu-art" editing={editing} filter="var(--filter-bw)" objectPosition="50% 18%"
            style={{ position: "absolute", left: 40, top: "50%", transform: "translateY(-50%)",
                     width: 330, height: 330, background: "var(--ink-900)",
                     boxShadow: "var(--shadow-photo)", zIndex: 3 }}>
            <span className="deco" style={{ position: "absolute", inset: 0, background: "var(--scrim-left)", zIndex: 3 }} />
            <div style={{ position: "absolute", left: 22, bottom: 22, zIndex: 4 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                <Editable id="mu-handle" fallback="@eskaydareal" />
              </div>
              <div className="ds-display paper" style={{ fontSize: 42, lineHeight: .9 }}>
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
function SpreadSkills({ editing, social }) {
  return (
    <div className="spread" style={{ background: "var(--paper-100)" }}>
      <div className="grain grain--paper" />
      <ImageSlot id="sk-prop" editing={editing} mode="img" fit="contain" optional tone="paper"
        style={{ position: "absolute", right: 70, top: "46%", transform: "translateY(-50%)",
                 width: 460, height: 320, zIndex: 2 }} />
      <div className="layer" style={{ position: "absolute", inset: 0, padding: "0 0 0 110px", width: 620,
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    gap: 48, zIndex: 3 }}>
        <div className="ds-heading">
          <DisplayTitle size={62} tone="ink"><Editable id="sk-title" fallback="degree & skills" /></DisplayTitle>
          <Eyebrow tone="on-paper"><Editable id="sk-eyebrow" fallback="Evolution" /></Eyebrow>
        </div>
        <div>
          <IndexEditor storageKey={K.creds} presetKey="credentials" tone="on-paper"
            ruleWidth={0} gap={16} editing={editing} addLabel="Agregar credencial" />
        </div>
      </div>
      <div className="layer" style={{ position: "absolute", left: 110, bottom: 60, zIndex: 4,
                    display: "flex", alignItems: "flex-end", gap: 26 }}>
        <ImageSlot id="sk-logo1" editing={editing} mode="img" tone="paper" fit="contain"
          objectPosition="bottom left" style={{ width: 74, height: 74 }} />
        <ImageSlot id="sk-logo2" editing={editing} mode="img" tone="paper" fit="contain"
          objectPosition="bottom left" style={{ width: 86, height: 74 }} />
      </div>
      <SocialRail items={social} size={22} gap={46}
        style={{ position: "absolute", right: 44, top: "50%", transform: "translateY(-50%)", zIndex: 5 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPREAD 06 — THEY TRUST / LOCATION
// Two-column numbered venue index over a scrimmed venue photograph.
// ═══════════════════════════════════════════════════════════════════════════
function SpreadTrust({ editing }) {
  const venues = loadJSON(K.venues, activePreset().venues || []);
  const half = Math.ceil(venues.length / 2);
  return (
    <div className="spread" style={{ background: "var(--ink-800)" }}>
      <ImageSlot id="tr-photo" editing={editing} filter="var(--filter-bw)"
        style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <span className="deco" style={{ position: "absolute", inset: 0, background: "rgba(8,7,7,.66)", zIndex: 1 }} />
      <div className="grain" />
      <div className="layer" style={{ position: "absolute", inset: 0, padding: "0 90px 0 110px", display: "flex",
                    flexDirection: "column", justifyContent: "center", gap: 38, zIndex: 4 }}>
        <div className="ds-heading">
          <DisplayTitle size={62}><Editable id="tr-title" fallback="they trust" /></DisplayTitle>
          <Eyebrow tone="on-stage"><Editable id="tr-eyebrow" fallback="Location" /></Eyebrow>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto", columnGap: 70,
                      alignItems: "start", justifyContent: "start" }}>
          <div>
            <IndexEditor storageKey={K.venues} presetKey="venues" ruleWidth={110}
              gap={12} editing={editing} slice={[0, half]} />
          </div>
          <div>
            <IndexEditor storageKey={K.venues} presetKey="venues" ruleWidth={110}
              gap={12} editing={editing} slice={[half, venues.length]} addLabel="Agregar venue" />
          </div>
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
function SpreadBack({ wordmark, editing, social }) {
  return (
    <div className="spread" style={{ background: "var(--ink-900)" }}>
      <ImageSlot id="bk-photo" editing={editing}
        filter="var(--filter-warm) brightness(.9)" objectPosition="46% 30%"
        style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <span className="deco" style={{ position: "absolute", inset: 0, background: "var(--scrim-left)", zIndex: 1 }} />
      {/* Clears the torn-paper wedge, which reaches ~348px into the spread at
          this vertical band. Starting further left let the wedge swallow the
          front of the name — "hardwell" read as "dwell". The ghost is meant to
          be clipped by the artboard edge on the right, not by the collage. */}
      <GhostWord size={190} opacity={.14} style={{ top: "50%", transform: "translateY(-50%)", left: 372 }}>
        <Editable id="bk-ghost" fallback={wordmark} />
      </GhostWord>

      {/* Torn paper: the source is a photographed torn edge; this is a straight
          diagonal clip standing in for it. */}
      <div className="deco" style={{ position: "absolute", inset: 0, background: "var(--paper-100)",
                    clipPath: "polygon(0 0,34% 0,17% 100%,0 100%)", opacity: .96, zIndex: 2 }}>
        <span style={{ position: "absolute", inset: 0, backgroundImage: "var(--grain-light)",
                       backgroundSize: "400px", opacity: .5, mixBlendMode: "multiply" }} />
      </div>
      <div className="deco" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 34,
                    background: "var(--copper-700)", opacity: .85, zIndex: 3 }} />
      <div className="grain" />

      {/* The paper wedge is only ~185px wide at the foot once the copper bar is
          clear of it, so the contact drops to label tracking to fit inside it. */}
      <div className="layer" style={{ position: "absolute", left: 54, bottom: 44, zIndex: 5, width: 170 }}>
        <div className="ds-eyebrow on-paper"
          style={{ fontSize: 9, letterSpacing: "var(--ls-label)", lineHeight: 1.7, wordBreak: "break-word" }}>
          <Editable id="bk-foot" fallback="eskaydareal@gmail.com" />
        </div>
      </div>

      <SocialRail items={social} size={20} gap={52}
        style={{ position: "absolute", right: 46, top: "50%", transform: "translateY(-50%)", zIndex: 5 }} />
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
function StyleModal({ open, onClose, accent, setAccent, texture, setTexture, grain, setGrain }) {
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
  const bookRef = useRef(null);

  // Hue and film stock are kit-wide, so they persist on their own keys and are
  // reapplied on every mount — a reload must not silently revert the look.
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
    const fit = () => {
      const w = el.clientWidth;
      if (w > 0) document.documentElement.style.setProperty("--spread-scale", String(Math.min(1, w / 1280)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, []);

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
    const props = { editing, wordmark, social, key: `${id}-${i}` };
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
        <button className="tb-btn primary" onClick={() => window.print()}>↓ PDF</button>
      </div>

      <div className={`book ${editing ? "is-editing" : ""}`} ref={bookRef}>
        {spreads.map((id, i) => (
          <div className="spread-frame" key={`${id}-${i}`}>
            <div className="spread-scaler">{renderSpread(id, i)}</div>
          </div>
        ))}
      </div>

      <StyleModal open={showStyle} onClose={() => setShowStyle(false)}
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
          <TweakButton label="Descargar PDF" onClick={() => window.print()} />
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
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}

boot();
