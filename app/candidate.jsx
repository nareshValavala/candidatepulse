// CandidatePulse — candidate screens (mobile-first): consent + active session
const { useState: useStateC, useEffect: useEffectC, useRef: useRefC } = React;

// lightweight phone frame
function Phone({ children, dark = false }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', background: RS.wash, padding: 28 }}>
      <div style={{ width: 390, height: 800, borderRadius: 46, background: '#0A0E16', padding: 12, boxShadow: '0 40px 90px -30px rgba(15,31,61,.5), 0 0 0 1px rgba(15,31,61,.08)', position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 36, overflow: 'hidden', background: dark ? RS.navy900 : '#fff', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* notch */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 130, height: 30, background: '#0A0E16', borderRadius: '0 0 18px 18px', zIndex: 30 }} />
          {/* status bar */}
          <div style={{ height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', color: dark ? '#fff' : RS.ink, fontFamily: RS.font, fontWeight: 600, fontSize: 13, zIndex: 20 }}>
            <span>9:41</span>
            <span style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: .9 }}>
              <svg width="17" height="11" viewBox="0 0 17 11" fill="none"><rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor"/><rect x="4.5" y="4.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="9" y="2" width="3" height="9" rx="1" fill="currentColor"/><rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg>
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="1" y="1" width="19" height="10" rx="3" stroke="currentColor" strokeWidth="1" opacity=".5"/><rect x="2.5" y="2.5" width="14" height="7" rx="1.5" fill="currentColor"/><rect x="21" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg>
            </span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------- CONSENT
function CandidateConsent({ go }) {
  const [a, setA] = useStateC(false);
  return (
    <Phone>
      <div style={{ padding: '20px 26px 28px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 26 }}><Logo size={17} /></div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <div style={{ width: 76, height: 76, borderRadius: 22, background: RS.amberSoft, border: `1px solid ${RS.amberLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SignalMark size={34} color={RS.amber} dim="#E9C98A" />
          </div>
        </div>

        <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 21, letterSpacing: '-.02em', color: RS.ink, textAlign: 'center', lineHeight: 1.25 }}>Before your interview begins</div>
        <div style={{ fontFamily: RS.font, fontSize: 13.5, color: RS.slate, textAlign: 'center', marginTop: 10, lineHeight: 1.55 }}>
          This session captures your audio and video to analyze <b style={{ color: RS.ink2 }}>behavioral patterns</b> during your interview.
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[['Camera & microphone', 'Active only during the session.', <MicIcon />],
            ['Real-time signal — not a recording for HR', 'It is a behavioral signal system, not an evaluation of your answers.', <PulseIcon />],
            ['Auto-deleted', 'Raw audio & video are deleted after the interview window.', <TrashIcon />]].map(([t, d, ic]) => (
            <div key={t} style={{ display: 'flex', gap: 12, padding: 13, borderRadius: 11, background: RS.wash, border: `1px solid ${RS.line}` }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', border: `1px solid ${RS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RS.navy700, flexShrink: 0 }}>{ic}</div>
              <div><div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 12.5, color: RS.ink }}>{t}</div><div style={{ fontFamily: RS.font, fontSize: 11.5, color: RS.slate, marginTop: 2, lineHeight: 1.4 }}>{d}</div></div>
            </div>
          ))}
        </div>

        <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 20, cursor: 'pointer' }}>
          <span onClick={() => setA(!a)} style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `1.5px solid ${a ? RS.navy800 : RS.slate2}`, background: a ? RS.navy800 : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a && <Check c="#fff" />}</span>
          <span style={{ fontFamily: RS.font, fontSize: 12, color: RS.slate, lineHeight: 1.5 }}>By continuing, I consent to this behavioral analysis as described. I understand this is not a hiring decision.</span>
        </label>

        <div style={{ flex: 1, minHeight: 14 }} />
        <Btn kind="amber" full size="lg" disabled={!a} onClick={() => go('candidate-active')}>I agree — begin session</Btn>
        <div style={{ fontFamily: RS.mono, fontSize: 9.5, color: RS.slate3, textAlign: 'center', marginTop: 14, letterSpacing: '.04em' }}>Two-party consent satisfied · candidatepulse.io/s/9f2a-bell</div>
      </div>
    </Phone>
  );
}

// -------------------------------------------------------- ACTIVE STATUS
function CandidateActive({ go }) {
  const [phase, setPhase] = useStateC('calibrating'); // calibrating -> active
  const [dots, setDots] = useStateC(0);
  useEffectC(() => {
    const t1 = setTimeout(() => setPhase('active'), 3200);
    const iv = setInterval(() => setDots(d => (d + 1) % 4), 450);
    return () => { clearTimeout(t1); clearInterval(iv); };
  }, []);

  return (
    <Phone dark>
      <div style={{ padding: '18px 26px 28px', display: 'flex', flexDirection: 'column', minHeight: '100%', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 6, paddingBottom: 8 }}><Logo color="#fff" mark={RS.amber} size={15} /></div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {/* breathing ring */}
          <div style={{ position: 'relative', width: 168, height: 168, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
            {phase === 'active' && [0, 1, 2].map(i => (
              <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1.5px solid ${RS.signal.normal.c}`, opacity: 0, animation: `rsRipple 3s ease-out ${i}s infinite` }} />
            ))}
            <div style={{ width: 132, height: 132, borderRadius: '50%', background: phase === 'active' ? `radial-gradient(circle, ${RS.signal.normal.c}26, transparent 70%)` : `radial-gradient(circle, ${RS.amber}22, transparent 70%)`, border: `1.5px solid ${phase === 'active' ? RS.signal.normal.c + '66' : RS.amber + '55'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: phase === 'active' ? RS.signal.normal.c : RS.amber, boxShadow: `0 0 22px ${phase === 'active' ? RS.signal.normal.c : RS.amber}` }} />
            </div>
          </div>

          {phase === 'calibrating' ? (
            <>
              <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 19, letterSpacing: '-.01em' }}>Calibrating{'.'.repeat(dots)}</div>
              <div style={{ fontFamily: RS.font, fontSize: 13, color: RS.onDarkDim, textAlign: 'center', marginTop: 8, maxWidth: 240, lineHeight: 1.5 }}>Follow the dot with your eyes for a moment. Camera and mic are on.</div>
            </>
          ) : (
            <>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 15px', borderRadius: 999, background: 'rgba(28,154,119,.14)', border: `1px solid ${RS.signal.normal.c}55` }}>
                <Dot k="normal" size={9} pulse /><span style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 14, color: RS.signal.normal.c }}>Session Active</span>
              </div>
              <div style={{ fontFamily: RS.font, fontSize: 13, color: RS.onDarkDim, textAlign: 'center', marginTop: 16, maxWidth: 250, lineHeight: 1.55 }}>You’re all set. You can keep this tab open and join your Zoom/Teams call as normal.</div>
            </>
          )}
        </div>

        {/* device chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[['Camera', <CamIcon />], ['Mic', <MicIcon />], ['Gaze', <EyeIcon />]].map(([l, ic]) => (
            <div key={l} style={{ flex: 1, padding: '11px 8px', borderRadius: 11, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ color: phase === 'active' ? RS.signal.normal.c : RS.onDarkFaint }}>{ic}</span>
              <span style={{ fontFamily: RS.mono, fontSize: 9.5, color: RS.onDarkDim, letterSpacing: '.06em' }}>{l}</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: phase === 'active' ? RS.signal.normal.c : RS.amber }} />
            </div>
          ))}
        </div>
        <div style={{ fontFamily: RS.mono, fontSize: 9.5, color: RS.onDarkFaint, textAlign: 'center', letterSpacing: '.04em' }}>Jordan Bell · Senior Backend Engineer · Northwind</div>
      </div>
    </Phone>
  );
}

const MicIcon = () => <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><rect x="6" y="2" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4 8a5 5 0 0010 0M9 13v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const CamIcon = () => <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M13 8l3-2v6l-3-2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
const EyeIcon = () => <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M1 9s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>;
const PulseIcon = () => <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M1 9h4l2-5 3 11 2-6h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const TrashIcon = () => <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M7 5V3h4v2M5 5l1 10h6l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

Object.assign(window, { Phone, CandidateConsent, CandidateActive });
