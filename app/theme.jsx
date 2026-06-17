// CandidatePulse — design tokens + shared primitives
// Tone: clinical confidence, data-instrument. Navy / signal amber / cool slate.

const RS = {
  // navy / ink
  navy900: '#0A1526', navy800: '#0F1F3D', navy700: '#15294C', navy600: '#1E335C',
  navy500: '#2A4470',
  // text
  ink: '#0F1F3D', ink2: '#334155', ink3: '#64748B',
  slate: '#64748B', slate3: '#94A3B8', slate2: '#CBD5E1', slate1: '#E2E8F0',
  onDark: '#E8EDF5', onDarkDim: '#9FB0C9', onDarkFaint: '#5C7295',
  // surfaces
  paper: '#FFFFFF', wash: '#F4F6F9', wash2: '#EBEEF3', line: '#E4E8EE', lineSoft: '#EEF1F5',
  // brand accent
  amber: '#F59E0B', amberDeep: '#D9870A', amberSoft: '#FEF3DC', amberLine: '#F6D58C',
  // signal states (calm, clinical — no alarm-red)
  signal: {
    normal:   { key: 'normal',   c: '#1C9A77', bg: '#E6F4EF', line: '#B6E0D2', label: 'Normal', glyph: 'Normal' },
    mild:     { key: 'mild',     c: '#BE921F', bg: '#F8F1DA', line: '#EAD79A', label: 'Mild Pattern Drift', glyph: 'Mild Drift' },
    elevated: { key: 'elevated', c: '#DD7B22', bg: '#FBEAD8', line: '#F2C99A', label: 'Elevated AI-Like Structure', glyph: 'Elevated' },
    strong:   { key: 'strong',   c: '#BF4631', bg: '#F8E3DE', line: '#EBB6A9', label: 'Strong Pattern Consistency', glyph: 'Strong' },
  },
  font: "'IBM Plex Sans', system-ui, -apple-system, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
  radius: 12,
  shadow: '0 1px 2px rgba(15,31,61,.06), 0 8px 24px -12px rgba(15,31,61,.18)',
  shadowSm: '0 1px 2px rgba(15,31,61,.07)',
  shadowDark: '0 18px 50px -20px rgba(0,0,0,.6)',
};

const sigOf = (k) => RS.signal[k] || RS.signal.normal;

// ---- Logo / signal mark -------------------------------------------------
function SignalMark({ size = 22, color = RS.amber, dim = '#26406B' }) {
  // four ascending bars — "signal", not "alarm"
  const bars = [0.40, 0.62, 0.82, 1.0];
  const w = size * 0.17, gap = size * 0.11;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }} aria-hidden="true">
      {bars.map((h, i) => (
        <rect key={i} x={i * (w + gap)} y={size * (1 - h)} width={w} height={size * h}
          rx={w * 0.32} fill={i === bars.length - 1 ? color : dim} />
      ))}
    </svg>
  );
}

function Logo({ color = RS.navy800, mark = RS.amber, sub = false, size = 17 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <SignalMark size={size + 5} color={mark} dim={color === '#FFFFFF' || color === RS.onDark ? '#3A567F' : '#C7D0DE'} />
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: size, letterSpacing: '-.02em', color }}>
          Candidate<span style={{ fontWeight: 400 }}>Pulse</span>
        </div>
        {sub && <div style={{ fontFamily: RS.mono, fontSize: 8.5, letterSpacing: '.18em', color: RS.slate3, marginTop: 4, textTransform: 'uppercase' }}>Behavioral Signal System</div>}
      </div>
    </div>
  );
}

// ---- atoms --------------------------------------------------------------
function Dot({ k = 'normal', size = 9, pulse = false }) {
  const s = sigOf(k);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
      {pulse && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: s.c, opacity: .35, animation: 'rsPulse 2s ease-out infinite' }} />}
      <span style={{ width: size, height: size, borderRadius: '50%', background: s.c, boxShadow: `0 0 0 3px ${s.c}22` }} />
    </span>
  );
}

function SignalBadge({ k = 'normal', size = 'md', showDot = true }) {
  const s = sigOf(k);
  const pad = size === 'sm' ? '3px 8px' : size === 'lg' ? '7px 13px' : '5px 11px';
  const fs = size === 'sm' ? 11 : size === 'lg' ? 13.5 : 12;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: pad, borderRadius: 999, background: s.bg, border: `1px solid ${s.line}`, color: s.c, fontFamily: RS.font, fontWeight: 600, fontSize: fs, whiteSpace: 'nowrap' }}>
      {showDot && <span style={{ width: fs * 0.55, height: fs * 0.55, borderRadius: '50%', background: s.c }} />}
      {s.glyph}
    </span>
  );
}

function MonoLabel({ children, color = RS.slate3, size = 10.5, style }) {
  return <div style={{ fontFamily: RS.mono, fontSize: size, letterSpacing: '.15em', textTransform: 'uppercase', color, ...style }}>{children}</div>;
}

function Btn({ children, kind = 'primary', size = 'md', onClick, full, disabled, style, icon }) {
  const sizes = { sm: { p: '7px 13px', f: 12.5 }, md: { p: '10px 18px', f: 13.5 }, lg: { p: '13px 24px', f: 14.5 } };
  const z = sizes[size];
  const base = {
    display: full ? 'flex' : 'inline-flex', width: full ? '100%' : 'auto', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: z.p, fontFamily: RS.font, fontWeight: 600, fontSize: z.f, borderRadius: 9, cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent', transition: 'all .15s ease', letterSpacing: '-.01em', opacity: disabled ? .5 : 1, ...style,
  };
  const kinds = {
    primary: { background: RS.navy800, color: '#fff', boxShadow: RS.shadowSm },
    amber:   { background: RS.amber, color: RS.navy900, boxShadow: '0 1px 2px rgba(217,135,10,.3)' },
    ghost:   { background: 'transparent', color: RS.ink2, border: `1px solid ${RS.line}` },
    ghostDark: { background: 'rgba(255,255,255,.06)', color: RS.onDark, border: '1px solid rgba(255,255,255,.14)' },
    quiet:   { background: 'transparent', color: RS.slate, border: '1px solid transparent' },
    danger:  { background: 'transparent', color: '#BF4631', border: '1px solid #EBB6A9' },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...kinds[kind] }}
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.06)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}>
    {icon}{children}
  </button>;
}

function Card({ children, style, pad = 20, dark = false, hover = false, onClick }) {
  return (
    <div onClick={onClick} className={hover ? 'rs-card-hover' : ''} style={{
      background: dark ? RS.navy800 : RS.paper, border: `1px solid ${dark ? 'rgba(255,255,255,.08)' : RS.line}`,
      borderRadius: RS.radius, padding: pad, boxShadow: dark ? 'none' : RS.shadowSm, cursor: onClick ? 'pointer' : 'default', ...style,
    }}>{children}</div>
  );
}

function Avatar({ name, size = 36, dark = false }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
  const hues = [210, 24, 160, 280, 340]; const hue = hues[name.charCodeAt(0) % hues.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(140deg, oklch(.72 .12 ${hue}), oklch(.58 .13 ${hue + 18}))`,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: RS.font, fontWeight: 600, fontSize: size * 0.36, letterSpacing: '-.02em',
      boxShadow: dark ? 'inset 0 0 0 1px rgba(255,255,255,.12)' : 'none' }}>{initials}</div>
  );
}

// Field for forms
function Field({ label, hint, children }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontFamily: RS.font, fontSize: 12.5, fontWeight: 600, color: RS.ink2, marginBottom: 7, letterSpacing: '-.01em' }}>{label}</div>
      {children}
      {hint && <div style={{ fontFamily: RS.font, fontSize: 11.5, color: RS.slate3, marginTop: 6 }}>{hint}</div>}
    </label>
  );
}
const inputStyle = {
  width: '100%', padding: '11px 13px', fontFamily: RS.font, fontSize: 14, color: RS.ink,
  background: RS.paper, border: `1px solid ${RS.slate1}`, borderRadius: 9, outline: 'none', boxSizing: 'border-box',
};

// thin meter
function Meter({ value = 0, color = RS.navy800, track = RS.wash2, h = 6, animate = true }) {
  return (
    <div style={{ width: '100%', height: h, borderRadius: 99, background: track, overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(0, Math.min(100, value * 100))}%`, height: '100%', borderRadius: 99, background: color, transition: animate ? 'width .6s cubic-bezier(.4,0,.2,1)' : 'none' }} />
    </div>
  );
}

Object.assign(window, { RS, sigOf, SignalMark, Logo, Dot, SignalBadge, MonoLabel, Btn, Card, Avatar, Field, inputStyle, Meter });
