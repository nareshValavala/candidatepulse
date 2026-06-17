// CandidatePulse — signal visualizations (3 variations) + live gaze panel
const { useState: useStateV, useEffect: useEffectV, useRef: useRefV, useMemo: useMemoV } = React;

// convert stored drivers -> "AI-like contribution" 0..1 (higher = more pattern)
function contributions(d) {
  if (!d) return { Structural: 0, Specificity: 0, Timing: 0, Gaze: 0, Drift: 0 };
  return { Structural: d.structure, Specificity: 1 - d.specificity, Timing: d.timing, Gaze: d.gaze, Drift: d.drift };
}

// ============================================================ VARIATION A — ORB
function VizOrb({ block, conf, state }) {
  const s = sigOf(state);
  const R = 78, C = 2 * Math.PI * R;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '6px 0' }}>
      <div style={{ position: 'relative', width: 210, height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* soft halo */}
        <div style={{ position: 'absolute', width: 168, height: 168, borderRadius: '50%', background: `radial-gradient(circle, ${s.c}33, transparent 68%)`, filter: 'blur(6px)', transition: 'background .8s' }} />
        {state !== 'normal' && <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: `1px solid ${s.c}`, opacity: .25, animation: 'rsRipple 3.2s ease-out infinite' }} />}
        <svg width="210" height="210" viewBox="0 0 210 210" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle cx="105" cy="105" r={R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="10" />
          <circle cx="105" cy="105" r={R} fill="none" stroke={s.c} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - conf)} style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1), stroke .8s' }} />
        </svg>
        <div style={{ width: 124, height: 124, borderRadius: '50%', background: `radial-gradient(circle at 38% 32%, ${s.c}, ${s.c}cc)`, boxShadow: `0 0 40px ${s.c}55, inset 0 2px 14px rgba(255,255,255,.25)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'background .8s, box-shadow .8s' }}>
          <div style={{ fontFamily: RS.mono, fontSize: 32, fontWeight: 500, color: '#fff', letterSpacing: '-.02em', lineHeight: 1 }}>{conf.toFixed(2)}</div>
          <div style={{ fontFamily: RS.mono, fontSize: 8.5, color: 'rgba(255,255,255,.8)', letterSpacing: '.18em', marginTop: 5 }}>CONFIDENCE</div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 18, color: s.c, letterSpacing: '-.01em', transition: 'color .8s' }}>{s.label}</div>
        <div style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.onDarkDim, marginTop: 4 }}>Aggregated across {block ? block.q : 0} answered question{block && block.q !== 1 ? 's' : ''}</div>
      </div>
    </div>
  );
}

// ============================================================ VARIATION B — DRIVERS
function VizDrivers({ block, conf, state }) {
  const s = sigOf(state);
  const c = contributions(block && block.drivers);
  const order = ['Structural', 'Specificity', 'Timing', 'Gaze', 'Drift'];
  const full = { Structural: 'Structural fingerprint', Specificity: 'Specificity deficit', Timing: 'Latency regularity', Gaze: 'Overlay reading', Drift: 'Cross-question drift' };
  return (
    <div style={{ padding: '4px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <SignalBadge k={state} size="lg" />
        <div style={{ textAlign: 'right' }}><div style={{ fontFamily: RS.mono, fontSize: 26, color: '#fff', lineHeight: 1 }}>{conf.toFixed(2)}</div><MonoLabel size={8.5} color={RS.onDarkFaint} style={{ marginTop: 4 }}>confidence</MonoLabel></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {order.map(k => {
          const v = c[k] || 0;
          const col = v > 0.66 ? s.c : v > 0.4 ? RS.signal.mild.c : RS.onDarkFaint;
          return (
            <div key={k}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: RS.font, fontSize: 12.5, fontWeight: 500, color: RS.onDark }}>{full[k]}</span>
                <span style={{ fontFamily: RS.mono, fontSize: 11.5, color: col }}>{v.toFixed(2)}</span>
              </div>
              <div style={{ position: 'relative', height: 7, borderRadius: 99, background: 'rgba(255,255,255,.07)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v * 100}%`, borderRadius: 99, background: col, transition: 'width .9s cubic-bezier(.4,0,.2,1), background .6s' }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, fontFamily: RS.font, fontSize: 11, color: RS.onDarkFaint, lineHeight: 1.5 }}>No single driver is determinative. Only convergence across drivers over time is meaningful.</div>
    </div>
  );
}

// ============================================================ VARIATION C — BAND
function VizBand({ block, conf, state }) {
  const s = sigOf(state);
  const zones = [['normal', .25], ['mild', .25], ['elevated', .25], ['strong', .25]];
  return (
    <div style={{ padding: '14px 2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
        <div>
          <MonoLabel size={9} color={RS.onDarkFaint}>Current signal</MonoLabel>
          <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 22, color: s.c, marginTop: 6, letterSpacing: '-.01em', transition: 'color .8s' }}>{s.label}</div>
        </div>
        <div style={{ textAlign: 'right' }}><div style={{ fontFamily: RS.mono, fontSize: 30, color: '#fff', lineHeight: 1 }}>{conf.toFixed(2)}</div><MonoLabel size={8.5} color={RS.onDarkFaint} style={{ marginTop: 4 }}>confidence</MonoLabel></div>
      </div>
      {/* zone band */}
      <div style={{ position: 'relative', marginTop: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 3, height: 16, borderRadius: 6, overflow: 'hidden' }}>
          {zones.map(([k, w]) => <div key={k} style={{ flex: w, background: sigOf(k).c, opacity: state === k ? 1 : .26, transition: 'opacity .6s' }} />)}
        </div>
        {/* marker */}
        <div style={{ position: 'absolute', top: -7, left: `calc(${Math.min(0.985, Math.max(0.015, conf)) * 100}% - 7px)`, transition: 'left 1s cubic-bezier(.4,0,.2,1)' }}>
          <svg width="14" height="9" viewBox="0 0 14 9"><path d="M7 9L0 0h14z" fill="#fff" /></svg>
        </div>
        <div style={{ position: 'absolute', top: 22, left: `calc(${Math.min(0.985, Math.max(0.015, conf)) * 100}% - 1px)`, width: 2, height: 14, background: '#fff', opacity: .5 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
        {zones.map(([k]) => <div key={k} style={{ flex: 1, textAlign: 'center', fontFamily: RS.mono, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: state === k ? sigOf(k).c : RS.onDarkFaint, fontWeight: state === k ? 700 : 400 }}>{sigOf(k).glyph}</div>)}
      </div>
    </div>
  );
}

function SignalHero({ variation, block, conf, state }) {
  if (variation === 'drivers') return <VizDrivers block={block} conf={conf} state={state} />;
  if (variation === 'band') return <VizBand block={block} conf={conf} state={state} />;
  return <VizOrb block={block} conf={conf} state={state} />;
}

// ============================================================ GAZE PANEL
function GazePanel({ block, live }) {
  const reading = block && block.gaze && block.gaze.variance < 0.3;
  const path = useMemoV(() => gazePath(reading ? 'reading' : 'natural', 90), [block && block.q, reading]);
  const [head, setHead] = useStateV(0);
  useEffectV(() => {
    if (!live) return;
    let raf; const tick = () => { setHead(h => (h + 1) % path.length); raf = requestAnimationFrame(() => setTimeout(tick, 45)); };
    tick(); return () => cancelAnimationFrame(raf);
  }, [path, live]);

  const W = 260, H = 150, pad = 10;
  const px = (x) => pad + x * (W - 2 * pad), py = (y) => pad + y * (H - 2 * pad);
  const g = block ? block.gaze : { variance: 0.7, blink: 16, fixation: 3, head: 0.6 };
  const trail = 28;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <MonoLabel size={9.5} color={RS.onDarkDim}>Gaze · WebGazer.js</MonoLabel>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: RS.font, fontSize: 11, fontWeight: 600, color: reading ? RS.signal.elevated.c : RS.signal.normal.c }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: reading ? RS.signal.elevated.c : RS.signal.normal.c }} />{reading ? 'Reading signature' : 'Natural scan'}</span>
      </div>
      <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)', background: RS.navy900 }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          {/* screen grid */}
          {[0.25, 0.5, 0.75].map(f => <line key={'v' + f} x1={px(f)} y1={pad} x2={px(f)} y2={H - pad} stroke="rgba(255,255,255,.05)" />)}
          {[0.33, 0.66].map(f => <line key={'h' + f} x1={pad} y1={py(f)} x2={W - pad} y2={py(f)} stroke="rgba(255,255,255,.05)" />)}
          {reading && <rect x={px(0.16)} y={py(0.38)} width={px(0.82) - px(0.16)} height={py(0.56) - py(0.38)} fill={RS.signal.elevated.c} opacity=".08" rx="3" />}
          {/* full faint path */}
          <polyline points={path.map(p => `${px(p[0])},${py(p[1])}`).join(' ')} fill="none" stroke={reading ? RS.signal.elevated.c : RS.signal.normal.c} strokeWidth="1" opacity=".18" />
          {/* trailing live segment */}
          {live && <polyline points={path.slice(Math.max(0, head - trail), head + 1).map(p => `${px(p[0])},${py(p[1])}`).join(' ')} fill="none" stroke={reading ? RS.signal.elevated.c : RS.signal.normal.c} strokeWidth="1.6" opacity=".9" />}
          {/* current point */}
          {path[head] && <circle cx={px(path[head][0])} cy={py(path[head][1])} r="3.5" fill="#fff" />}
        </svg>
        {reading && <div style={{ position: 'absolute', bottom: 6, left: 8, fontFamily: RS.mono, fontSize: 8.5, color: RS.signal.elevated.c, letterSpacing: '.06em' }}>FIXED Y-BAND · L→R SACCADES</div>}
      </div>
      {/* metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        {[['Gaze variance', g.variance.toFixed(2), g.variance < 0.3], ['Blink / min', g.blink, g.blink < 8], ['Fixation', g.fixation + 's', g.fixation > 20], ['Head stillness', (1 - g.head).toFixed(2), (1 - g.head) > 0.7]].map(([l, v, flag]) => (
          <div key={l} style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,.04)', border: `1px solid ${flag ? RS.signal.elevated.c + '44' : 'rgba(255,255,255,.07)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: RS.font, fontSize: 10.5, color: RS.onDarkDim }}>{l}</span>
              <span style={{ fontFamily: RS.mono, fontSize: 13, color: flag ? RS.signal.elevated.c : '#fff' }}>{v}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SignalHero, GazePanel, contributions });
