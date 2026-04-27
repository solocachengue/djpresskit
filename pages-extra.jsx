// Reusable bits + 10 new page components.
// All page components receive { editing, djName } and render a <section.page>.
const { useState: usePg, useEffect: useEffectPg, useRef: useRefPg } = React;

// Aliased so JSX in this file resolves to the real components from presskit.jsx
// without redeclaring identifiers that could shadow / clash with the originals
// (Babel scripts share the page's global scope).
const XEditable    = window.Editable;
const XImageUpload = window.ImageUpload;
const XPageHeader  = window.PageHeader;
const XPageFooter  = window.PageFooter;


// ------------- shared helpers reused from presskit.jsx (re-declared here so file is standalone) -------------
const PG_loadJSON = (k, f) => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : f; } catch { return f; } };
const PG_saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ============== PAGE: DISCOGRAPHY ==============
const DEFAULT_DISCO = [
  { year: "2025", title: "Latitud Sur", label: "Tropi Records", type: "EP" },
  { year: "2024", title: "Cumbia del Sur",  label: "Self-released", type: "Single" },
  { year: "2024", title: "Fuego Mix Vol. 2", label: "Hot Selecta", type: "Mix" },
  { year: "2023", title: "Tropi Drop",      label: "Sub-Bajío",  type: "Single" },
  { year: "2022", title: "Primera Hora",    label: "Self-released", type: "EP" },
];
function PageDiscography({ editing, djName, num, total }) {
  const KEY = "djpresskit.discography.v1";
  const [items, setItems] = usePg(() => PG_loadJSON(KEY, DEFAULT_DISCO));
  const persist = (n) => { setItems(n); PG_saveJSON(KEY, n); };
  const upd = (i, k, v) => persist(items.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => persist([...items, { year: "2025", title: "Nuevo", label: "Sello", type: "Single" }]);
  const rm  = (i) => persist(items.filter((_, idx) => idx !== i));

  return (
    <section className="page page-disco" data-screen-label={`${String(num).padStart(2,'0')} Discography`}>
      <XPageHeader num={num} total={total} title="Discography" />
      <h2 className="page-h2">
        <span style={{ display: 'block' }}>DISCO</span>
        <span className="accent" style={{ display: 'block' }}>GRAFÍA</span>
      </h2>
      <div className="disco-list">
        <div className="disco-head">
          <span>Año</span><span>Título</span><span>Sello</span><span>Tipo</span>
        </div>
        {items.map((it, i) => (
          <div className="disco-row" key={i}>
            <span className="disco-year" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'year', e.currentTarget.innerText)}>{it.year}</span>
            <span className="disco-title" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'title', e.currentTarget.innerText)}>{it.title}</span>
            <span className="disco-label" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'label', e.currentTarget.innerText)}>{it.label}</span>
            <span className="disco-type" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'type', e.currentTarget.innerText)}>{it.type}</span>
            {editing && <button className="disco-rm" onClick={() => rm(i)}>✕</button>}
          </div>
        ))}
        {editing && <button className="add-row" onClick={add}>+ Agregar release</button>}
      </div>
      <XPageFooter djName={djName} page={num} />
    </section>
  );
}

// ============== PAGE: MANIFESTO ==============
function PageManifesto({ djName, num, total }) {
  return (
    <section className="page page-manifesto" data-screen-label={`${String(num).padStart(2,'0')} Manifesto`}>
      <XPageHeader num={num} total={total} title="Manifesto" />
      <div className="manifesto-mark">▲</div>
      <h2 className="manifesto-h">
        <XEditable tag="span" id="mf-h1" style={{ display: 'block' }}>NO</XEditable>
        <XEditable tag="span" id="mf-h2" className="accent" style={{ display: 'block' }}>VENIMOS</XEditable>
        <XEditable tag="span" id="mf-h3" style={{ display: 'block' }}>A PEDIR</XEditable>
        <XEditable tag="span" id="mf-h4" className="accent" style={{ display: 'block' }}>PERMISO.</XEditable>
      </h2>
      <p className="manifesto-body">
        <XEditable tag="span" id="mf-body" multiline>
          Esto no es un set. Es una noche entera construida en cuatro horas. Es la cumbia del barrio puesta en la cabina del club europeo. Es el sudor compartido. Es el bajo que sentís en el pecho cuando la pista entiende.{"\n\n"}No vine a ser el más técnico. Vine a leer la pista, a sostenerla, a empujarla a las cuatro de la mañana cuando todo el mundo ya se quería ir y ahora no se va.{"\n\n"}Si entendés esto, ya estamos.
        </XEditable>
      </p>
      <div className="manifesto-sig">
        <span><XEditable tag="span" id="mf-sig">— {djName}</XEditable></span>
        <span className="accent"><XEditable tag="span" id="mf-loc">BUENOS AIRES, 2026</XEditable></span>
      </div>
      <XPageFooter djName={djName} page={num} />
    </section>
  );
}

// ============== PAGE: FESTIVALS ==============
const DEFAULT_FESTIVALS = [
  { name: "Lollapalooza AR",  year: "2025", tier: "MAIN STAGE", country: "AR" },
  { name: "Cosquín Rock",     year: "2025", tier: "DJ STAGE",   country: "AR" },
  { name: "Primavera Sound",  year: "2024", tier: "INVITADO",   country: "AR" },
  { name: "Bresh Festival",   year: "2024", tier: "HEADLINE",   country: "AR" },
  { name: "Sónar BCN",        year: "2024", tier: "OFF-WEEK",   country: "ES" },
];
function PageFestivals({ editing, djName, num, total }) {
  const KEY = "djpresskit.festivals.v1";
  const [items, setItems] = usePg(() => PG_loadJSON(KEY, DEFAULT_FESTIVALS));
  const persist = (n) => { setItems(n); PG_saveJSON(KEY, n); };
  const upd = (i, k, v) => persist(items.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => persist([...items, { name: "Nuevo Fest", year: "2026", tier: "TBA", country: "AR" }]);
  const rm  = (i) => persist(items.filter((_, idx) => idx !== i));

  return (
    <section className="page page-festivals" data-screen-label={`${String(num).padStart(2,'0')} Festivals`}>
      <XPageHeader num={num} total={total} title="Festivals & Lineups" />
      <h2 className="page-h2">
        <span style={{ display: 'block' }}>FESTIVAL</span>
        <span className="accent" style={{ display: 'block' }}>CIRCUIT</span>
      </h2>
      <XImageUpload id="fest-flyer" className="fest-flyer" hint="flyer destacado / line-up" />
      <div className="fest-list">
        {items.map((f, i) => (
          <div className="fest-row" key={i}>
            <span className="fest-year" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'year', e.currentTarget.innerText)}>{f.year}</span>
            <div className="fest-mid">
              <div className="fest-name" contentEditable suppressContentEditableWarning spellCheck={false}
                onBlur={(e) => upd(i, 'name', e.currentTarget.innerText)}>{f.name}</div>
              <div className="fest-tier" contentEditable suppressContentEditableWarning spellCheck={false}
                onBlur={(e) => upd(i, 'tier', e.currentTarget.innerText)}>{f.tier}</div>
            </div>
            <span className="fest-country" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'country', e.currentTarget.innerText)}>{f.country}</span>
            {editing && <button className="disco-rm" onClick={() => rm(i)}>✕</button>}
          </div>
        ))}
        {editing && <button className="add-row" onClick={add}>+ Agregar festival</button>}
      </div>
      <XPageFooter djName={djName} page={num} />
    </section>
  );
}

// ============== PAGE: SERVICES (mobile / wedding DJs) ==============
const DEFAULT_SERVICES = [
  { name: "ESSENTIAL",  hours: "4 hrs",  inc: "Sonido + DJ",                    price: "USD 850" },
  { name: "PREMIUM",    hours: "6 hrs",  inc: "Sonido + luces + DJ + MC",       price: "USD 1.450" },
  { name: "FULL EVENT", hours: "8+ hrs", inc: "Todo Premium + cabina + humo",   price: "USD 2.300" },
];
function PageServices({ editing, djName, num, total }) {
  const KEY = "djpresskit.services.v1";
  const [items, setItems] = usePg(() => PG_loadJSON(KEY, DEFAULT_SERVICES));
  const persist = (n) => { setItems(n); PG_saveJSON(KEY, n); };
  const upd = (i, k, v) => persist(items.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  return (
    <section className="page page-services" data-screen-label={`${String(num).padStart(2,'0')} Services`}>
      <XPageHeader num={num} total={total} title="Services & Packages" />
      <h2 className="page-h2">
        <span style={{ display: 'block' }}>PAQUETES</span>
        <span className="accent" style={{ display: 'block' }}>EVENTOS</span>
      </h2>
      <div className="services-grid">
        {items.map((s, i) => (
          <div className={`service-card ${i === 1 ? 'highlight' : ''}`} key={i}>
            {i === 1 && <div className="srv-tag">MÁS ELEGIDO</div>}
            <div className="srv-name" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'name', e.currentTarget.innerText)}>{s.name}</div>
            <div className="srv-hours" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'hours', e.currentTarget.innerText)}>{s.hours}</div>
            <div className="srv-inc" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'inc', e.currentTarget.innerText)}>{s.inc}</div>
            <div className="srv-price" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'price', e.currentTarget.innerText)}>{s.price}</div>
          </div>
        ))}
      </div>
      <p className="srv-note">
        <XEditable tag="span" id="srv-note" multiline>↳ Precios estimativos. Casamientos, corporativos, cumpleaños 15. Consultá disponibilidad por email.</XEditable>
      </p>
      <XPageFooter djName={djName} page={num} />
    </section>
  );
}

// ============== PAGE: TIMELINE ==============
const DEFAULT_TIMELINE = [
  { year: "2008", event: "Primer set en bar de barrio" },
  { year: "2012", event: "Residencia en [Club X]" },
  { year: "2016", event: "Primer EP / sello propio" },
  { year: "2019", event: "Tour internacional · 8 países" },
  { year: "2022", event: "Headline en festival mayor" },
  { year: "2025", event: "Mentor de la nueva escena" },
];
function PageTimeline({ editing, djName, num, total }) {
  const KEY = "djpresskit.timeline.v1";
  const [items, setItems] = usePg(() => PG_loadJSON(KEY, DEFAULT_TIMELINE));
  const persist = (n) => { setItems(n); PG_saveJSON(KEY, n); };
  const upd = (i, k, v) => persist(items.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => persist([...items, { year: "2026", event: "Nuevo hito" }]);
  const rm  = (i) => persist(items.filter((_, idx) => idx !== i));

  return (
    <section className="page page-timeline" data-screen-label={`${String(num).padStart(2,'0')} Timeline`}>
      <XPageHeader num={num} total={total} title="Career Timeline" />
      <h2 className="page-h2">
        <span style={{ display: 'block' }}>EL</span>
        <span className="accent" style={{ display: 'block' }}>CAMINO</span>
      </h2>
      <div className="timeline">
        <div className="timeline-line"></div>
        {items.map((it, i) => (
          <div className="timeline-item" key={i}>
            <div className="tl-dot"></div>
            <span className="tl-year" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'year', e.currentTarget.innerText)}>{it.year}</span>
            <span className="tl-event" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'event', e.currentTarget.innerText)}>{it.event}</span>
            {editing && <button className="disco-rm" onClick={() => rm(i)}>✕</button>}
          </div>
        ))}
      </div>
      {editing && <button className="add-row" onClick={add}>+ Agregar hito</button>}
      <XPageFooter djName={djName} page={num} />
    </section>
  );
}

// ============== PAGE: TOUR MAP ==============
const DEFAULT_TOUR = [
  { city: "Buenos Aires", country: "AR", date: "MAR 15" },
  { city: "Santiago",     country: "CL", date: "MAR 22" },
  { city: "São Paulo",    country: "BR", date: "ABR 05" },
  { city: "Mexico City",  country: "MX", date: "ABR 19" },
  { city: "Madrid",       country: "ES", date: "MAY 03" },
  { city: "Berlin",       country: "DE", date: "MAY 17" },
  { city: "London",       country: "UK", date: "MAY 24" },
  { city: "Ibiza",        country: "ES", date: "JUN 14" },
];
function PageTourMap({ editing, djName, num, total }) {
  const KEY = "djpresskit.tour.v1";
  const [items, setItems] = usePg(() => PG_loadJSON(KEY, DEFAULT_TOUR));
  const persist = (n) => { setItems(n); PG_saveJSON(KEY, n); };
  const upd = (i, k, v) => persist(items.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => persist([...items, { city: "Nueva", country: "—", date: "TBA" }]);
  const rm  = (i) => persist(items.filter((_, idx) => idx !== i));

  return (
    <section className="page page-tourmap" data-screen-label={`${String(num).padStart(2,'0')} Tour Map`}>
      <XPageHeader num={num} total={total} title="World Tour" />
      <h2 className="page-h2">
        <span style={{ display: 'block' }}>WORLD</span>
        <span className="accent" style={{ display: 'block' }}>TOUR</span>
      </h2>
      <div className="map-frame">
        <svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet" className="world-svg">
          {/* Simplified continents */}
          <path d="M20,30 Q30,20 50,25 L60,40 Q55,55 45,60 L25,55 Z" />
          <path d="M70,25 Q90,15 110,20 L120,40 Q115,60 95,65 L75,55 Z" />
          <path d="M130,25 Q150,20 175,25 L180,50 Q170,65 145,60 L130,45 Z" />
          <path d="M55,65 Q65,70 70,85 L60,90 L50,80 Z" />
          <path d="M140,65 Q160,70 165,85 L155,95 L145,85 Z" />
          {/* dots */}
          {items.slice(0,8).map((it,i) => {
            const positions = [
              [55,75],[52,78],[68,80],[40,62],[135,40],[150,30],[148,28],[140,38]
            ];
            const [x,y] = positions[i] || [50,50];
            return <circle key={i} cx={x} cy={y} r="1.6" className="map-dot" />;
          })}
        </svg>
      </div>
      <div className="tour-list">
        {items.map((it, i) => (
          <div className="tour-row" key={i}>
            <span className="tour-date" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'date', e.currentTarget.innerText)}>{it.date}</span>
            <span className="tour-city" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'city', e.currentTarget.innerText)}>{it.city}</span>
            <span className="tour-country" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'country', e.currentTarget.innerText)}>{it.country}</span>
            {editing && <button className="disco-rm" onClick={() => rm(i)}>✕</button>}
          </div>
        ))}
        {editing && <button className="add-row" onClick={add}>+ Agregar fecha</button>}
      </div>
      <XPageFooter djName={djName} page={num} />
    </section>
  );
}

// ============== PAGE: BRAND COLLABS ==============
const DEFAULT_BRANDS = [
  { brand: "Heineken",   activation: "Activación AR · 2024" },
  { brand: "Adidas",     activation: "DJ set en lanzamiento · 2024" },
  { brand: "Red Bull",   activation: "Music Academy mentor · 2023" },
  { brand: "Ray-Ban",    activation: "Campaña LATAM · 2023" },
];
function PageBrands({ editing, djName, num, total }) {
  const KEY = "djpresskit.brands.v1";
  const [items, setItems] = usePg(() => PG_loadJSON(KEY, DEFAULT_BRANDS));
  const persist = (n) => { setItems(n); PG_saveJSON(KEY, n); };
  const upd = (i, k, v) => persist(items.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const add = () => persist([...items, { brand: "Marca", activation: "Activación" }]);
  const rm  = (i) => persist(items.filter((_, idx) => idx !== i));

  return (
    <section className="page page-brands" data-screen-label={`${String(num).padStart(2,'0')} Brands`}>
      <XPageHeader num={num} total={total} title="Brand Collaborations" />
      <h2 className="page-h2">
        <span style={{ display: 'block' }}>WORKED</span>
        <span className="accent" style={{ display: 'block' }}>WITH</span>
      </h2>
      <div className="brands-grid">
        {items.map((b, i) => (
          <div className="brand-card" key={i}>
            <div className="brand-name" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'brand', e.currentTarget.innerText)}>{b.brand}</div>
            <div className="brand-act" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(e) => upd(i, 'activation', e.currentTarget.innerText)}>{b.activation}</div>
            {editing && <button className="disco-rm" onClick={() => rm(i)}>✕</button>}
          </div>
        ))}
        {editing && <button className="add-row" onClick={add}>+ Agregar marca</button>}
      </div>
      <XPageFooter djName={djName} page={num} />
    </section>
  );
}

// ============== PAGE: RADIO SHOW ==============
const DEFAULT_RADIO = [
  { ep: "EP 042", guest: "DJ Tao",    date: "MAR 2025" },
  { ep: "EP 041", guest: "Bizarrap",  date: "FEB 2025" },
  { ep: "EP 040", guest: "DJ Kauf",   date: "ENE 2025" },
  { ep: "EP 039", guest: "Sin invitado", date: "DIC 2024" },
];
function PageRadio({ editing, djName, num, total }) {
  const KEY = "djpresskit.radio.v1";
  const [items, setItems] = usePg(() => PG_loadJSON(KEY, DEFAULT_RADIO));
  const persist = (n) => { setItems(n); PG_saveJSON(KEY, n); };
  const upd = (i, k, v) => persist(items.map((x, idx) => idx === i ? { ...x, [k]: v } : x));

  return (
    <section className="page page-radio" data-screen-label={`${String(num).padStart(2,'0')} Radio`}>
      <XPageHeader num={num} total={total} title="Radio Show" />
      <h2 className="page-h2">
        <span style={{ display: 'block' }}>ON</span>
        <span className="accent" style={{ display: 'block' }}>AIR</span>
      </h2>
      <div className="radio-card">
        <div className="radio-onair">● ON AIR</div>
        <div className="radio-name"><XEditable tag="span" id="rd-name">FUEGO RADIO</XEditable></div>
        <div className="radio-meta"><XEditable tag="span" id="rd-meta">JUEVES · 22:00 ART · @ Vorterix Online</XEditable></div>
        <div className="radio-desc">
          <XEditable tag="span" id="rd-desc" multiline>Una hora de cumbia 420, cachengue y guests internacionales. Cada jueves desde 2023.</XEditable>
        </div>
      </div>
      <div className="radio-eps">
        <div className="radio-eps-label">Últimos episodios</div>
        {items.map((e, i) => (
          <div className="radio-ep" key={i}>
            <span className="radio-ep-num" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(ev) => upd(i, 'ep', ev.currentTarget.innerText)}>{e.ep}</span>
            <span className="radio-ep-guest" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(ev) => upd(i, 'guest', ev.currentTarget.innerText)}>w/ {e.guest}</span>
            <span className="radio-ep-date" contentEditable suppressContentEditableWarning spellCheck={false}
              onBlur={(ev) => upd(i, 'date', ev.currentTarget.innerText)}>{e.date}</span>
          </div>
        ))}
      </div>
      <XPageFooter djName={djName} page={num} />
    </section>
  );
}

// ============== PAGE: STREAMING ==============
function PageStreaming({ djName, num, total }) {
  return (
    <section className="page page-stream" data-screen-label={`${String(num).padStart(2,'0')} Streaming`}>
      <XPageHeader num={num} total={total} title="Streaming Highlights" />
      <h2 className="page-h2">
        <span style={{ display: 'block' }}>VIEWED</span>
        <span className="accent" style={{ display: 'block' }}>WORLDWIDE</span>
      </h2>
      <div className="stream-hero">
        <XImageUpload id="stream-hero-img" className="stream-hero-img" hint="screenshot del stream destacado" />
        <div className="stream-hero-info">
          <div className="stream-hero-tag">◉ FEATURED STREAM</div>
          <div className="stream-hero-title"><XEditable tag="span" id="st-title">Boiler Room · Buenos Aires</XEditable></div>
          <div className="stream-hero-stats">
            <span><XEditable tag="span" id="st-views">2.4M views</XEditable></span>
            <span>·</span>
            <span><XEditable tag="span" id="st-date">Octubre 2024</XEditable></span>
          </div>
        </div>
      </div>
      <div className="stream-grid">
        <div className="stream-card">
          <div className="stream-pf">YouTube</div>
          <div className="stream-num"><XEditable tag="span" id="st-yt">340K</XEditable></div>
          <div className="stream-lbl">subs</div>
        </div>
        <div className="stream-card">
          <div className="stream-pf">Twitch</div>
          <div className="stream-num"><XEditable tag="span" id="st-tw">45K</XEditable></div>
          <div className="stream-lbl">followers</div>
        </div>
        <div className="stream-card">
          <div className="stream-pf">SoundCloud</div>
          <div className="stream-num"><XEditable tag="span" id="st-sc">120K</XEditable></div>
          <div className="stream-lbl">plays</div>
        </div>
        <div className="stream-card">
          <div className="stream-pf">Spotify</div>
          <div className="stream-num"><XEditable tag="span" id="st-sp">8M</XEditable></div>
          <div className="stream-lbl">streams</div>
        </div>
      </div>
      <XPageFooter djName={djName} page={num} />
    </section>
  );
}

// ============== PAGE: CONTACT ONLY ==============
function PageContact({ djName, num, total }) {
  return (
    <section className="page page-contact-only" data-screen-label={`${String(num).padStart(2,'0')} Contact`}>
      <XPageHeader num={num} total={total} title="Contact" />
      <div className="contact-only-center">
        <div className="contact-only-mark">◆</div>
        <h2 className="contact-only-h">
          <XEditable tag="span" id="co-h1" style={{ display: 'block' }}>HABLEMOS</XEditable>
          <XEditable tag="span" id="co-h2" className="accent" style={{ display: 'block' }}>BOOKING</XEditable>
        </h2>
        <p className="contact-only-sub">
          <XEditable tag="span" id="co-sub" multiline>Eventos privados, festivales, residencias.{"\n"}Respuesta en 24 hs.</XEditable>
        </p>
        <div className="contact-only-grid">
          <div className="co-block">
            <div className="co-k">EMAIL · PREFERIDO</div>
            <div className="co-v"><XEditable tag="span" id="co-mail">booking@djfuego.com</XEditable></div>
          </div>
          <div className="co-block">
            <div className="co-k">WHATSAPP</div>
            <div className="co-v"><XEditable tag="span" id="co-wa">+54 9 11 2345 6789</XEditable></div>
          </div>
          <div className="co-block">
            <div className="co-k">INSTAGRAM</div>
            <div className="co-v"><XEditable tag="span" id="co-ig">@dj.fuego</XEditable></div>
          </div>
          <div className="co-block">
            <div className="co-k">WEB</div>
            <div className="co-v"><XEditable tag="span" id="co-web">djfuego.com</XEditable></div>
          </div>
        </div>
      </div>
      <XPageFooter djName={djName} page={num} />
    </section>
  );
}

// expose globally
Object.assign(window, {
  PageDiscography, PageManifesto, PageFestivals, PageServices,
  PageTimeline, PageTourMap, PageBrands, PageRadio, PageStreaming, PageContact,
});
