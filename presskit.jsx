const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "djName": "DJ FUEGO",
  "djTagline": "Cachengue & Club Music · Buenos Aires",
  "templateId": "standard-pro",
  "fontId": "",
  "pageBg": "",
  "accent": "",
  "ink": ""
}/*EDITMODE-END*/;

// ---------- Storage ----------
const STORAGE_KEY = "djpresskit.images.v1";
const TEXT_KEY = "djpresskit.text.v1";
const VENUES_KEY = "djpresskit.venues.v1";
const MIXES_KEY = "djpresskit.mixes.v1";
const PRESS_KEY = "djpresskit.press.v1";
const RIDER_KEY = "djpresskit.rider.v1";
const PAGES_KEY = "djpresskit.pages.v1";
const OPACITY_KEY = "djpresskit.opacity.v1";

const loadJSON = (k, f) => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : f; } catch { return f; } };
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const loadImages = () => loadJSON(STORAGE_KEY, {});
const saveImages = (i) => saveJSON(STORAGE_KEY, i);
const loadText = () => loadJSON(TEXT_KEY, {});
const saveText = (t) => saveJSON(TEXT_KEY, t);

// ---------- Editable + Clickable Link ----------
// In edit mode: behaves like Editable (click to edit text).
// In normal mode: renders an <a> that opens the URL in a new tab.
// `id` stores the displayed/edited text, `urlId` stores the actual URL (defaults to same key + "-url").
function LinkField({ id, urlId, children, className, style, urlPrefix = "https://", editing }) {
  const ref = useRef(null);
  const _urlId = urlId || (id + "-url");
  const initial = (() => {
    const s = loadText();
    if (s[id] != null) return s[id].replace(/,\n\n,/g, "\n\n").replace(/^,|,$/g, "");
    return Array.isArray(children) ? children.join("") : children;
  })();
  const [text] = useState(initial);
  const [url, setUrl] = useState(() => { const s = loadText(); return s[_urlId] != null ? s[_urlId] : initial; });

  useEffect(() => { if (ref.current && ref.current.innerText !== text) ref.current.innerText = text; }, []);

  const buildHref = (raw) => {
    if (!raw) return "#";
    const v = raw.trim();
    if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
    if (v.startsWith("@")) return "https://instagram.com/" + v.slice(1);
    if (/^\+?[\d\s\-()]+$/.test(v)) return "tel:" + v.replace(/\s/g, "");
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "mailto:" + v;
    return urlPrefix + v;
  };

  if (editing) {
    return (
      <span ref={ref} contentEditable suppressContentEditableWarning spellCheck={false}
        className={className} style={style}
        onBlur={() => {
          const newText = ref.current.innerText;
          const s = loadText();
          s[id] = newText;
          // auto-update url if url field hasn't been customized separately
          s[_urlId] = newText;
          saveText(s);
          setUrl(newText);
        }}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); ref.current.blur(); } }}
      >{text}</span>
    );
  }
  return (
    <a href={buildHref(url)} target="_blank" rel="noopener noreferrer"
       className={className} style={style}
       onClick={(e) => e.stopPropagation()}>
      {text}
    </a>
  );
}

// ---------- Editable text ----------
function Editable({ tag = "span", id, children, className, style, multiline = false }) {
  const ref = useRef(null);
  // Normalize children: arrays (from JSX with {"\n"} interpolations) → joined string.
  // Also clean already-stored bad text (commas around \n that came from old bug).
  const initialText = (() => {
    const s = loadText();
    if (s[id] != null) {
      // strip stray commas that were introduced by the previous bug
      const cleaned = s[id].replace(/,\n\n,/g, "\n\n").replace(/,\n,/g, "\n").replace(/^,|,$/g, "");
      if (cleaned !== s[id]) { s[id] = cleaned; saveText(s); }
      return cleaned;
    }
    if (Array.isArray(children)) return children.join("");
    return children;
  })();
  const [text] = useState(initialText);
  useEffect(() => { if (ref.current && ref.current.innerText !== text) ref.current.innerText = text; }, []);
  const handleBlur = () => { const s = loadText(); s[id] = ref.current.innerText; saveText(s); };
  const handleKey = (e) => { if (!multiline && e.key === "Enter") { e.preventDefault(); ref.current.blur(); } };
  const Tag = tag;
  return (<Tag ref={ref} contentEditable suppressContentEditableWarning spellCheck={false}
    className={className} style={style} onBlur={handleBlur} onKeyDown={handleKey}>{text}</Tag>);
}

// ---------- Image upload ----------
function ImageUpload({ id, className, style, hint = "subir foto", children, editable = true }) {
  const [src, setSrc] = useState(() => loadImages()[id] || null);
  const [opacity, setOpacity] = useState(() => {
    const o = loadJSON(OPACITY_KEY, {});
    return o[id] != null ? o[id] : 1;
  });
  const [showSlider, setShowSlider] = useState(false);
  const inputRef = useRef(null);

  const onPick = (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(reader.result);
      const imgs = loadImages(); imgs[id] = reader.result; saveImages(imgs);
    };
    reader.readAsDataURL(file);
  };
  const updateOpacity = (val) => {
    setOpacity(val);
    const o = loadJSON(OPACITY_KEY, {});
    o[id] = val; saveJSON(OPACITY_KEY, o);
  };
  const removeImage = (e) => {
    e.stopPropagation();
    setSrc(null);
    const imgs = loadImages(); delete imgs[id]; saveImages(imgs);
  };

  const bg = src ? {
    backgroundImage: `url(${src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  return (
    <div className={`upload ${className || ""} ${src ? "has-image" : ""}`}
      style={{ ...style, ...bg, "--image-opacity": opacity }}
      onClick={() => inputRef.current && inputRef.current.click()}>
      <input ref={inputRef} type="file" accept="image/*" onChange={onPick} />
      <div className="hint"><div className="icon">+</div><div>{hint}</div></div>
      {children}
      {src && editable && (
        <>
          <button className="img-control img-opacity-btn"
            onClick={(e) => { e.stopPropagation(); setShowSlider(!showSlider); }}
            title="Brillo">◐</button>
          <button className="img-control img-remove-btn"
            onClick={removeImage} title="Quitar">✕</button>
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

// ---------- Icons ----------
const Icon = {
  mail: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>),
  whatsapp: () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15l-1.2 4.4 4.5-1.2A10 10 0 1012 2zm4.5 12.7c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.1.1-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.5-1.8-.2-.3 0-.4.1-.6l.4-.4c.1-.1.2-.3.3-.4 0-.2 0-.3 0-.5l-.6-1.4c-.2-.4-.3-.4-.5-.4h-.5c-.1 0-.4 0-.6.3-.2.3-.8.8-.8 2 0 1.2.8 2.4.9 2.5.1.2 1.7 2.6 4.1 3.6 1.4.6 2 .6 2.7.5.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.5-.3z"/></svg>),
  instagram: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>),
  play: () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>),
  qr: () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zm-11 9h7v7H3v-7zm2 2v3h3v-3H5zm9-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v3h-3v-2h1v-1zm2-4h3v2h-2v1h-1v-3z"/></svg>),
  quote: () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 7H5v6h4v4H5v-4H1V7a4 4 0 014-4v2a2 2 0 00-2 2v2h2zm10 0h-4v6h4v4h-4v-4h-4V7a4 4 0 014-4v2a2 2 0 00-2 2v2h2z"/></svg>),
};

// ---------- Page chrome ----------
function PageHeader({ num, total, title }) {
  return (
    <div className="page-header">
      <div className="page-num">{String(num).padStart(2,'0')} / {String(total || num).padStart(2,'0')}</div>
      <div className="page-line"></div>
      <div className="page-title">{title}</div>
    </div>
  );
}
function PageFooter({ djName, page }) {
  return (
    <div className="page-footer">
      <div className="pf-mark">{djName}</div>
      <div className="pf-num">PG. {String(page).padStart(2,'0')}</div>
    </div>
  );
}

// expose so pages-extra.jsx can use them
Object.assign(window, { Editable, ImageUpload, PageHeader, PageFooter, Icon, LinkField });

// ---------- PAGE: COVER ----------
function PageCover({ djName, djTagline, num, total, editing }) {
  return (
    <section className="page page-cover" data-screen-label="01 Cover">
      <ImageUpload id="cover-bg" className="cover-bg placeholder"
        hint="subir foto editorial full-bleed (3500px+)"
        style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
      <div className="cover-scrim"></div>
      <div className="cover-corners"></div>

      <div className="cover-top">
        <div className="cover-logo"><Editable tag="span" id="cv-logo">◆ FUEGO</Editable></div>
        <div><Editable tag="span" id="cv-ed">PRESSKIT 2026</Editable></div>
      </div>

      <div className="cover-center">
        <div className="cover-marker">◆ &nbsp; ARTIST PRESSKIT &nbsp; ◆</div>
        <h1 className="cover-name">
          <Editable tag="span" id="cv-name1" style={{ display: 'block' }}>{djName.split(' ')[0] || djName}</Editable>
          <Editable tag="span" id="cv-name2" className="accent" style={{ display: 'block' }}>{djName.split(' ').slice(1).join(' ') || ''}</Editable>
        </h1>
        <p className="cover-tagline">
          <Editable tag="span" id="cv-tag" multiline>{djTagline}</Editable>
        </p>
      </div>

      <div className="cover-bottom">
        <div className="cover-contact">
          <div className="cc-k">Booking</div>
          <div className="cc-v"><LinkField id="cv-book" editing={editing}>booking@djfuego.com</LinkField></div>
        </div>
        <div className="cover-contact">
          <div className="cc-k">Mgmt</div>
          <div className="cc-v"><LinkField id="cv-mgmt" editing={editing}>+54 9 11 2345 6789</LinkField></div>
        </div>
      </div>
    </section>
  );
}

// ---------- PAGE: BIO ----------
function PageBio({ djName, num, total }) {
  return (
    <section className="page page-bio" data-screen-label={`${String(num).padStart(2,'0')} Bio`}>
      <PageHeader num={num} total={total} title="Biografía / About" />
      <h2 className="page-h2">
        <Editable tag="span" id="bio-h1" style={{ display: 'block' }}>QUIÉN</Editable>
        <Editable tag="span" id="bio-h2" className="accent" style={{ display: 'block' }}>SOY</Editable>
      </h2>
      <p className="bio-body">
        <Editable tag="span" id="bio-text" multiline>
          [Nombre del DJ] es un selector y productor argentino con base en Buenos Aires. Especializado en cachengue y cumbia 420 con mezcla técnica heredada de la escuela europea, construye sets pensados como un viaje de cuatro horas.{"\n\n"}Residente en [Club] desde [año], ha compartido cabina con [DJ X], [DJ Y] y [DJ Z]. En 2025 publicó dos EPs en [sello] y produjo remixes para [artista]. Sus mixes superan las [N] reproducciones en SoundCloud.{"\n\n"}Su set se distingue por la lectura precisa de la pista y por mezclar repertorio local con drops de tech-house europeo.
        </Editable>
      </p>
      <div className="bio-divider"></div>
      <div className="bio-row">
        <div className="bio-block">
          <div className="bio-k">For fans of</div>
          <div className="bio-fans">
            <Editable tag="span" id="bio-fan1" className="fan">DJ TAO</Editable>
            <Editable tag="span" id="bio-fan2" className="fan">BIZARRAP</Editable>
            <Editable tag="span" id="bio-fan3" className="fan">DJ KAUF</Editable>
          </div>
        </div>
        <div className="bio-block">
          <div className="bio-k">Géneros</div>
          <div className="bio-genres">
            <Editable tag="span" id="bio-g1" className="genre">CACHENGUE</Editable>
            <Editable tag="span" id="bio-g2" className="genre">CUMBIA 420</Editable>
            <Editable tag="span" id="bio-g3" className="genre">TECH-HOUSE</Editable>
          </div>
        </div>
      </div>
      <div className="bio-stats">
        <div className="bs"><div className="bs-k">Base</div><div className="bs-v"><Editable tag="span" id="bio-base">Buenos Aires, AR</Editable></div></div>
        <div className="bs"><div className="bs-k">Activo</div><div className="bs-v"><Editable tag="span" id="bio-since">Desde 2019</Editable></div></div>
        <div className="bs"><div className="bs-k">Residencia</div><div className="bs-v"><Editable tag="span" id="bio-resi">Club Tropitango</Editable></div></div>
        <div className="bs"><div className="bs-k">Idiomas</div><div className="bs-v"><Editable tag="span" id="bio-lang">ES · EN</Editable></div></div>
      </div>
      <PageFooter djName={djName} page={num} />
    </section>
  );
}

// ---------- PAGE: LIVE ----------
const DEFAULT_VENUES = ["Tropitango", "Niceto", "Crobar", "Bresh", "Lollapalooza AR", "C Complejo"];
function PageLive({ editing, djName, num, total }) {
  const [venues, setVenues] = useState(() => loadJSON(VENUES_KEY, DEFAULT_VENUES));
  const persist = (v) => { setVenues(v); saveJSON(VENUES_KEY, v); };
  const update = (i, val) => persist(venues.map((x, idx) => idx === i ? val : x));
  const add = () => persist([...venues, "Nuevo"]);
  const remove = (i) => persist(venues.filter((_, idx) => idx !== i));

  return (
    <section className="page page-live" data-screen-label={`${String(num).padStart(2,'0')} Live`}>
      <PageHeader num={num} total={total} title="Live / Performance" />
      <h2 className="page-h2">
        <Editable tag="span" id="lv-h1" style={{ display: 'block' }}>EN</Editable>
        <Editable tag="span" id="lv-h2" className="accent" style={{ display: 'block' }}>VIVO</Editable>
      </h2>
      <ImageUpload id="lv-cabina" className="live-photo" hint="subir foto en cabina con público" />
      <div className="video-row">
        <ImageUpload id="lv-vid" className="video-thumb" hint="screenshot del video">
          <div className="vt-play"><Icon.play/></div>
        </ImageUpload>
        <div className="video-info">
          <div className="vi-title"><Editable tag="span" id="lv-vtitle">Set en Tropitango</Editable></div>
          <div className="vi-sub"><Editable tag="span" id="lv-vsub">Octubre 2025 · 90 min</Editable></div>
          <div className="qr-box">
            <div className="qr-icon"><Icon.qr/></div>
            <div className="qr-info">
              <div className="qr-k">Link / QR</div>
              <div className="qr-v"><LinkField id="lv-qr" editing={editing}>youtu.be/xxx</LinkField></div>
            </div>
          </div>
        </div>
      </div>
      <div className="venues">
        <div className="venues-label">Clubes · Festivales · Residencias</div>
        <div className="venues-grid">
          {venues.map((v, i) => (
            <div className="venue-cell" key={i}>
              <span contentEditable suppressContentEditableWarning spellCheck={false}
                onBlur={(e) => update(i, e.currentTarget.innerText)}>{v}</span>
              {editing && <button className="cell-rm" onClick={() => remove(i)}>✕</button>}
            </div>
          ))}
          {editing && <button className="cell-add" onClick={add}>+ AGREGAR</button>}
        </div>
      </div>
      <PageFooter djName={djName} page={num} />
    </section>
  );
}

// ---------- PAGE: MUSIC ----------
const DEFAULT_MIXES = [
  { title: "Set largo · 90 min", platform: "SOUNDCLOUD", link: "soundcloud.com/dj.fuego/set-1", duration: "1:30:00" },
  { title: "Set corto · demo", platform: "MIXCLOUD", link: "mixcloud.com/dj.fuego/demo", duration: "28:42" },
  { title: "EP \"Latitud Sur\"", platform: "SPOTIFY", link: "open.spotify.com/album/xxx", duration: "22:15" },
];
function PageMusic({ editing, djName, num, total }) {
  const [mixes, setMixes] = useState(() => loadJSON(MIXES_KEY, DEFAULT_MIXES));
  const persist = (m) => { setMixes(m); saveJSON(MIXES_KEY, m); };
  const update = (i, k, v) => persist(mixes.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => persist([...mixes, { title: "Nuevo set", platform: "SC", link: "link...", duration: "00:00" }]);
  const remove = (i) => persist(mixes.filter((_, idx) => idx !== i));

  return (
    <section className="page page-music" data-screen-label={`${String(num).padStart(2,'0')} Music`}>
      <PageHeader num={num} total={total} title="Mixes & Releases" />
      <h2 className="page-h2">
        <Editable tag="span" id="mu-h1" style={{ display: 'block' }}>SELECTED</Editable>
        <Editable tag="span" id="mu-h2" className="accent" style={{ display: 'block' }}>SETS</Editable>
      </h2>
      <div className="mixes">
        {mixes.map((m, i) => (
          <div className="mix" key={i}>
            <div className="mix-icon"><Icon.play/></div>
            <div className="mix-meta">
              <div className="mix-title">
                <span contentEditable suppressContentEditableWarning spellCheck={false}
                  onBlur={(e) => update(i, 'title', e.currentTarget.innerText)}>{m.title}</span>
              </div>
              <div className="mix-link">
                {editing ? (
                  <span contentEditable suppressContentEditableWarning spellCheck={false}
                    onBlur={(e) => update(i, 'link', e.currentTarget.innerText)}>{m.link}</span>
                ) : (
                  <a href={(/^https?:/i.test(m.link) ? m.link : "https://" + m.link)}
                     target="_blank" rel="noopener noreferrer"
                     onClick={(e) => e.stopPropagation()}>{m.link}</a>
                )}
              </div>
            </div>
            <div className="mix-side">
              <span className="mix-platform" contentEditable suppressContentEditableWarning spellCheck={false}
                onBlur={(e) => update(i, 'platform', e.currentTarget.innerText)}>{m.platform}</span>
              <span className="mix-duration" contentEditable suppressContentEditableWarning spellCheck={false}
                onBlur={(e) => update(i, 'duration', e.currentTarget.innerText)}>{m.duration}</span>
            </div>
            {editing && <button className="mix-rm" onClick={() => remove(i)}>✕</button>}
          </div>
        ))}
        {editing && <button className="add-row" onClick={add}>+ Agregar mix</button>}
      </div>
      <div className="releases">
        <div className="rel-label">Latest Release</div>
        <div className="rel-row">
          <ImageUpload id="rel-art" className="rel-art" hint="artwork" />
          <div className="rel-info">
            <div className="rel-title"><Editable tag="span" id="rel-title">Latitud Sur — EP</Editable></div>
            <div className="rel-label-name"><Editable tag="span" id="rel-label">[Sello] · 2025</Editable></div>
            <div className="rel-tracks">
              <Editable tag="span" id="rel-t1" multiline>01 · Cumbia del Sur · 04:12{"\n"}02 · Tropi Drop · 03:45{"\n"}03 · Latitud · 05:20</Editable>
            </div>
          </div>
        </div>
      </div>
      <PageFooter djName={djName} page={num} />
    </section>
  );
}

// ---------- PAGE: PRESS ----------
const DEFAULT_PRESS = [
  { quote: "Construye un viaje de cuatro horas con la precisión de un cirujano y la energía de un cumbiero.", source: "Resident Advisor" },
  { quote: "Una de las residencias más sólidas del under porteño 2025.", source: "Vorterix" },
];
function PagePress({ editing, djName, num, total }) {
  const [press, setPress] = useState(() => loadJSON(PRESS_KEY, DEFAULT_PRESS));
  const persist = (p) => { setPress(p); saveJSON(PRESS_KEY, p); };
  const update = (i, k, v) => persist(press.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => persist([...press, { quote: "Nueva cita...", source: "Fuente" }]);
  const remove = (i) => persist(press.filter((_, idx) => idx !== i));

  return (
    <section className="page page-press" data-screen-label={`${String(num).padStart(2,'0')} Press`}>
      <PageHeader num={num} total={total} title="Press / Recognition" />
      <h2 className="page-h2">
        <Editable tag="span" id="pr-h1" style={{ display: 'block' }}>QUÉ</Editable>
        <Editable tag="span" id="pr-h2" className="accent" style={{ display: 'block' }}>DICEN</Editable>
      </h2>
      <div className="quotes">
        {press.map((q, i) => (
          <div className="quote" key={i}>
            <div className="qmark"><Icon.quote/></div>
            <p>
              <span contentEditable suppressContentEditableWarning spellCheck={false}
                onBlur={(e) => update(i, 'quote', e.currentTarget.innerText)}>{q.quote}</span>
            </p>
            <div className="qsrc">— <span contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => update(i, 'source', e.currentTarget.innerText)}>{q.source}</span></div>
            {editing && <button className="quote-rm" onClick={() => remove(i)}>✕</button>}
          </div>
        ))}
        {editing && <button className="add-row" onClick={add}>+ Agregar cita</button>}
      </div>
      <div className="numbers">
        <div className="num-block">
          <div className="num-v"><Editable tag="span" id="pr-n1">120K</Editable></div>
          <div className="num-k"><Editable tag="span" id="pr-l1">Plays SC</Editable></div>
        </div>
        <div className="num-block">
          <div className="num-v"><Editable tag="span" id="pr-n2">45K</Editable></div>
          <div className="num-k"><Editable tag="span" id="pr-l2">Followers IG</Editable></div>
        </div>
        <div className="num-block">
          <div className="num-v"><Editable tag="span" id="pr-n3">200+</Editable></div>
          <div className="num-k"><Editable tag="span" id="pr-l3">Shows</Editable></div>
        </div>
      </div>
      <PageFooter djName={djName} page={num} />
    </section>
  );
}

// ---------- PAGE: RIDER ----------
const DEFAULT_RIDER = [
  { name: "2x Pioneer CDJ-3000", desc: "Reproductor multimedia" },
  { name: "Pioneer DJM-A9", desc: "Mixer 4 canales" },
  { name: "Sennheiser HD-25", desc: "Auriculares (propios)" },
  { name: "Monitor cabina activo", desc: "Mínimo 1, idealmente 2" },
];
function PageRider({ editing, djName, num, total }) {
  const [rider, setRider] = useState(() => loadJSON(RIDER_KEY, DEFAULT_RIDER));
  const persist = (r) => { setRider(r); saveJSON(RIDER_KEY, r); };
  const update = (i, k, v) => persist(rider.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => persist([...rider, { name: "Nuevo", desc: "Descripción" }]);
  const remove = (i) => persist(rider.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir; if (j < 0 || j >= rider.length) return;
    const next = [...rider]; [next[i], next[j]] = [next[j], next[i]]; persist(next);
  };

  return (
    <section className="page page-rider" data-screen-label={`${String(num).padStart(2,'0')} Rider`}>
      <PageHeader num={num} total={total} title="Tech Rider & Booking" />
      <h2 className="page-h2">
        <Editable tag="span" id="rd-h1" style={{ display: 'block' }}>RIDER</Editable>
        <Editable tag="span" id="rd-h2" className="accent" style={{ display: 'block' }}>& BOOKING</Editable>
      </h2>
      <div className="rider-block">
        <div className="rb-label">Setup técnico</div>
        {rider.map((g, i) => (
          <div className="rider-item" key={i}>
            <div className="ri-idx">{String(i+1).padStart(2,'0')}</div>
            <div>
              <div className="ri-name">
                <span contentEditable suppressContentEditableWarning spellCheck={false}
                  onBlur={(e) => update(i, 'name', e.currentTarget.innerText)}>{g.name}</span>
              </div>
              <div className="ri-desc">
                <span contentEditable suppressContentEditableWarning spellCheck={false}
                  onBlur={(e) => update(i, 'desc', e.currentTarget.innerText)}>{g.desc}</span>
              </div>
            </div>
            {editing && (
              <div className="ri-controls">
                <button onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button onClick={() => move(i, 1)} disabled={i === rider.length - 1}>↓</button>
                <button onClick={() => remove(i)} className="danger">✕</button>
              </div>
            )}
          </div>
        ))}
        {editing && <button className="add-row" onClick={add}>+ Agregar item</button>}
      </div>
      <div className="rider-block">
        <div className="rb-label">No negociables</div>
        <ul className="non-neg">
          <li><Editable tag="span" id="nn-1">Soundcheck 60 min antes</Editable></li>
          <li><Editable tag="span" id="nn-2">Conexión a tierra</Editable></li>
          <li><Editable tag="span" id="nn-3">Acceso backstage</Editable></li>
          <li><Editable tag="span" id="nn-4">Agua sin gas en cabina</Editable></li>
        </ul>
      </div>
      <div className="contact-block">
        <div className="cb-label">Booking · Contacto</div>
        <div className="cb-field primary">
          <div className="cbf-icon"><Icon.mail/></div>
          <div>
            <div className="cbf-k">Email · contacto preferido</div>
            <div className="cbf-v"><LinkField id="ct-mail" editing={editing}>booking@djfuego.com</LinkField></div>
          </div>
        </div>
        <div className="cb-field">
          <div className="cbf-icon"><Icon.whatsapp/></div>
          <div>
            <div className="cbf-k">Manager · WhatsApp</div>
            <div className="cbf-v"><LinkField id="ct-wa" editing={editing}>+54 9 11 2345 6789</LinkField></div>
          </div>
        </div>
        <div className="cb-field">
          <div className="cbf-icon"><Icon.instagram/></div>
          <div>
            <div className="cbf-k">Instagram</div>
            <div className="cbf-v"><LinkField id="ct-ig" editing={editing}>@dj.fuego</LinkField></div>
          </div>
        </div>
      </div>
      <PageFooter djName={djName} page={num} />
    </section>
  );
}

// ---------- PAGE BUILDER MODAL ----------
function PageBuilder({ open, onClose, pages, setPages }) {
  if (!open) return null;
  const PAGE_TYPES = window.PAGE_TYPES || {};
  const move = (i, dir) => {
    const j = i + dir; if (j < 0 || j >= pages.length) return;
    const next = [...pages]; [next[i], next[j]] = [next[j], next[i]]; setPages(next);
  };
  const remove = (i) => {
    if (pages.length <= 1) return alert("Necesitás al menos 1 página.");
    setPages(pages.filter((_, idx) => idx !== i));
  };
  const addPage = (type) => {
    setPages([...pages, type]);
  };
  return (
    <div className="templates-modal" onClick={onClose}>
      <div className="builder-inner" onClick={(e) => e.stopPropagation()}>
        <div className="templates-head">
          <h2>Editor de <span className="accent">Páginas</span></h2>
          <button className="templates-close" onClick={onClose}>✕</button>
        </div>
        <p className="builder-hint">Reordená, eliminá o agregá páginas. El presskit se actualiza al cerrar este panel.</p>

        <div className="builder-section-head">Tu presskit ({pages.length} páginas)</div>
        <div className="builder-list">
          {pages.map((id, i) => (
            <div className="builder-item" key={i}>
              <span className="builder-item-num">{String(i+1).padStart(2,'0')}</span>
              <span className="builder-item-name">{PAGE_TYPES[id]?.label || id}</span>
              <span className="builder-item-desc">{PAGE_TYPES[id]?.desc || ""}</span>
              <div className="builder-item-ctrl">
                <button onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button onClick={() => move(i, 1)} disabled={i === pages.length - 1}>↓</button>
                <button onClick={() => remove(i)} className="danger">✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="builder-section-head" style={{ marginTop: 24 }}>+ Agregar página</div>
        <div className="builder-add-grid">
          {Object.entries(PAGE_TYPES).map(([id, info]) => (
            <button key={id} className="builder-add-card" onClick={() => addPage(id)}>
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

// ---------- APP ----------
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [editing, setEditing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  // pages: per-template default, but persisted overrides survive template change ONLY if user touches them
  const initialPages = (() => {
    const saved = loadJSON(PAGES_KEY, null);
    if (saved && Array.isArray(saved.pages) && saved.templateId === tweaks.templateId) return saved.pages;
    const t = (window.TEMPLATES || []).find(x => x.id === tweaks.templateId);
    return t ? [...t.pages] : ["cover", "bio", "live", "music", "press", "rider"];
  })();
  const [pages, setPagesRaw] = useState(initialPages);
  const setPages = (next) => {
    setPagesRaw(next);
    saveJSON(PAGES_KEY, { templateId: tweaks.templateId, pages: next });
  };

  // when template changes, reset pages to that template's structure
  const lastTemplateRef = useRef(tweaks.templateId);
  useEffect(() => {
    if (lastTemplateRef.current !== tweaks.templateId) {
      const t = (window.TEMPLATES || []).find(x => x.id === tweaks.templateId);
      if (t) setPages([...t.pages]);
      lastTemplateRef.current = tweaks.templateId;
    }
  }, [tweaks.templateId]);

  // Apply selected template (palette + font)
  useEffect(() => {
    const t = (window.TEMPLATES || []).find(x => x.id === tweaks.templateId);
    if (t) window.applyTemplate(t);
    const root = document.documentElement;
    if (tweaks.fontId) root.style.setProperty("--display-font", window.fontFamily(tweaks.fontId));
    if (tweaks.pageBg) {
      root.style.setProperty("--page-bg", tweaks.pageBg);
      root.style.setProperty("--bg", tweaks.pageBg);
    }
    if (tweaks.accent) {
      root.style.setProperty("--accent", tweaks.accent);
      const hex = tweaks.accent.replace("#",""); 
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0,2),16);
        const g = parseInt(hex.slice(2,4),16);
        const b = parseInt(hex.slice(4,6),16);
        root.style.setProperty("--accent-soft", `rgba(${r},${g},${b},0.18)`);
        root.style.setProperty("--accent-glow", `rgba(${r},${g},${b},0.55)`);
      }
    }
    if (tweaks.ink) root.style.setProperty("--ink", tweaks.ink);
  }, [tweaks.templateId, tweaks.fontId, tweaks.pageBg, tweaks.accent, tweaks.ink]);

  const resetAll = () => {
    if (!confirm("¿Borrar todo y volver al template?")) return;
    [STORAGE_KEY, TEXT_KEY, VENUES_KEY, MIXES_KEY, PRESS_KEY, RIDER_KEY, PAGES_KEY, OPACITY_KEY,
     "djpresskit.discography.v1","djpresskit.festivals.v1","djpresskit.services.v1",
     "djpresskit.timeline.v1","djpresskit.tour.v1","djpresskit.brands.v1","djpresskit.radio.v1"]
      .forEach(k => localStorage.removeItem(k));
    location.reload();
  };

  const downloadPDF = () => window.print();

  const total = pages.length;
  const renderPage = (id, idx) => {
    const num = idx + 1;
    const props = { editing, djName: tweaks.djName, num, total };
    switch (id) {
      case "cover":       return <PageCover djName={tweaks.djName} djTagline={tweaks.djTagline} num={num} total={total} editing={editing}/>;
      case "bio":         return <PageBio {...props}/>;
      case "live":        return <PageLive {...props}/>;
      case "music":       return <PageMusic {...props}/>;
      case "press":       return <PagePress {...props}/>;
      case "rider":       return <PageRider {...props}/>;
      case "discography": return <window.PageDiscography {...props}/>;
      case "manifesto":   return <window.PageManifesto {...props}/>;
      case "festivals":   return <window.PageFestivals {...props}/>;
      case "services":    return <window.PageServices {...props}/>;
      case "timeline":    return <window.PageTimeline {...props}/>;
      case "tourmap":     return <window.PageTourMap {...props}/>;
      case "brands":      return <window.PageBrands {...props}/>;
      case "radio":       return <window.PageRadio {...props}/>;
      case "streaming":   return <window.PageStreaming {...props}/>;
      case "contact":     return <window.PageContact {...props}/>;
      default: return null;
    }
  };

  const TemplatesModal = window.TemplatesModal;
  const currentTemplate = (window.TEMPLATES || []).find(t => t.id === tweaks.templateId);
  const FONT_OPTIONS = window.FONT_OPTIONS || [];

  return (
    <>
      <button className="download-btn" onClick={downloadPDF}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/>
        </svg>
        PDF
      </button>
      <button className={`edit-toggle ${editing ? 'active' : ''}`} onClick={() => setEditing(!editing)}>
        {editing ? '✓ Listo' : '✎ Editar'}
      </button>
      <button className="templates-btn" onClick={() => setShowTemplates(true)}>
        ◧ Templates
      </button>
      <button className="builder-btn" onClick={() => setShowBuilder(true)}>
        ☰ Páginas ({pages.length})
      </button>

      <div className={`book ${editing ? 'is-editing' : ''}`}>
        {pages.map((id, idx) => (
          <div className="page-wrap" key={`${id}-${idx}`} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
            {renderPage(id, idx)}
          </div>
        ))}
      </div>

      {TemplatesModal && (
        <TemplatesModal
          open={showTemplates}
          onClose={() => setShowTemplates(false)}
          currentId={tweaks.templateId}
          onSelect={(t) => {
            setTweak({ templateId: t.id, fontId: "", pageBg: "", accent: "", ink: "" });
          }}
        />
      )}

      <PageBuilder open={showBuilder} onClose={() => setShowBuilder(false)} pages={pages} setPages={setPages} />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Identidad">
          <TweakText label="Nombre del DJ" value={tweaks.djName} onChange={(v) => setTweak("djName", v)}/>
          <TweakText label="Tagline" value={tweaks.djTagline} onChange={(v) => setTweak("djTagline", v)}/>
        </TweakSection>

        <TweakSection title="Template">
          <TweakButton label="Ver 20 templates" onClick={() => setShowTemplates(true)} />
          <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>
            Actual: <b style={{ color: '#fff' }}>{currentTemplate?.name || "—"}</b>
          </div>
          <div style={{ fontSize: 10, color: "#888", marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>
            {currentTemplate?.genre || ""}
          </div>
        </TweakSection>

        <TweakSection title="Páginas">
          <TweakButton label={`Editar páginas (${pages.length})`} onClick={() => setShowBuilder(true)} />
          <TweakButton label={editing ? 'Salir de modo editar' : 'Modo editar inline'} onClick={() => setEditing(!editing)} secondary />
        </TweakSection>

        <TweakSection title="Tipografía">
          <TweakSelect label="Fuente del template"
            value={tweaks.fontId || (currentTemplate?.font || "anton")}
            onChange={(v) => setTweak("fontId", v)}
            options={FONT_OPTIONS.map(f => ({ value: f.id, label: f.label }))} />
          <div style={{ fontSize: 10, color: "#888", marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
            La fuente se aplica a todos los títulos del presskit.
          </div>
        </TweakSection>

        <TweakSection title="Color overrides">
          <TweakColor label="Fondo de página" value={tweaks.pageBg || "#0a0608"} onChange={(v) => setTweak("pageBg", v)}/>
          <TweakColor label="Acento" value={tweaks.accent || "#ff2bd6"} onChange={(v) => setTweak("accent", v)}/>
          <TweakColor label="Texto" value={tweaks.ink || "#f7f2f5"} onChange={(v) => setTweak("ink", v)}/>
          <TweakButton label="Limpiar overrides" onClick={() => setTweak({ pageBg: "", accent: "", ink: "", fontId: "" })} secondary />
        </TweakSection>

        <TweakSection title="Acciones">
          <TweakButton label="Resetear todo" onClick={resetAll} secondary />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
