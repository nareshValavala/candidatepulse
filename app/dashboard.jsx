// CandidatePulse — live recruiter dashboard + scripted interview playback engine
const { useState: uS, useEffect: uE, useRef: uR } = React;

const LS_KEY = 'rs_dash_v1';
const bandFor = (c) => c < 0.33 ? 'normal' : c < 0.55 ? 'mild' : c < 0.72 ? 'elevated' : 'strong';

function Dashboard({ go }) {
  // playback cursor
  const saved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } })();
  const [cur, setCur] = uS(saved.cur || { qi: 0, sub: 'think', wi: 0, t: 0 });
  const [playing, setPlaying] = uS(false);
  const [speed, setSpeed] = uS(1);
  const [variation, setVariation] = uS(saved.variation || 'orb');
  const [clock, setClock] = uS(saved.clock || 862); // 14:22
  const transcriptRef = uR(null);

  const block = SCRIPT[cur.qi];
  const words = block.answer.split(' ');
  const typing = cur.sub === 'type';
  const resolved = cur.sub === 'hold';
  const shownWords = resolved ? words.length : cur.wi;

  // displayed confidence ramps as the answer streams
  const ramp = resolved ? 1 : cur.sub === 'type' ? Math.min(1, cur.wi / words.length) : 0;
  const dispConf = block.confidence * (cur.sub === 'think' ? 0.04 : ramp);
  const dispState = bandFor(dispConf);

  // engine
  uE(() => {
    if (!playing) return;
    const THINK = 14, HOLD = 26, WPT = 1.4;
    const id = setInterval(() => {
      setCur(c => {
        const b = SCRIPT[c.qi]; const w = b.answer.split(' ');
        let { qi, sub, wi, t } = c;
        if (sub === 'think') { t += 1; if (t >= THINK * (0.6 + b.latency * 0.3)) { sub = 'type'; t = 0; wi = 0; } }
        else if (sub === 'type') { wi += WPT; if (wi >= w.length) { wi = w.length; sub = 'hold'; t = 0; } }
        else { t += 1; if (t >= HOLD) { if (qi < SCRIPT.length - 1) { qi += 1; sub = 'think'; wi = 0; t = 0; } else { sub = 'hold'; setPlaying(false); } } }
        return { qi, sub, wi: Math.floor(wi), t };
      });
    }, 70 / speed);
    return () => clearInterval(id);
  }, [playing, speed]);

  // clock
  uE(() => { if (!playing) return; const id = setInterval(() => setClock(c => c + 1), 1000); return () => clearInterval(id); }, [playing]);

  // persist
  uE(() => { try { localStorage.setItem(LS_KEY, JSON.stringify({ cur, variation, clock })); } catch (e) {} }, [cur, variation, clock]);

  // autoscroll transcript
  uE(() => { if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight; }, [cur]);

  const resolvedUpTo = resolved ? cur.qi : cur.qi - 1;
  const jump = (qi) => { setCur({ qi, sub: 'hold', wi: SCRIPT[qi].answer.split(' ').length, t: 0 }); };
  const restart = () => { setCur({ qi: 0, sub: 'think', wi: 0, t: 0 }); setClock(862); setPlaying(true); };
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ minHeight: '100%', background: `radial-gradient(130% 100% at 80% -10%, ${RS.navy700}, ${RS.navy900} 60%)`, color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 26px', borderBottom: '1px solid rgba(255,255,255,.08)', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,21,38,.72)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button onClick={() => go('sessions')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: RS.onDarkDim, display: 'flex' }}><svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
          <Logo color="#fff" mark={RS.amber} size={15} />
          <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <Avatar name={LIVE.name} size={32} dark />
            <div><div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 13.5 }}>{LIVE.name}</div><div style={{ fontFamily: RS.mono, fontSize: 10, color: RS.onDarkFaint }}>{LIVE.role}</div></div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 99, background: 'rgba(191,70,49,.16)', border: `1px solid ${RS.signal.strong.c}66` }}>
            <Dot k="strong" size={7} pulse /><span style={{ fontFamily: RS.font, fontWeight: 700, fontSize: 11.5, color: RS.signal.strong.c, letterSpacing: '.04em' }}>LIVE</span>
            <span style={{ fontFamily: RS.mono, fontSize: 12, color: '#fff' }}>{mmss(clock)}</span>
          </span>
          <Btn kind="ghostDark" size="sm" onClick={() => go('pip')} icon={<PipIcon />}>PiP</Btn>
          <Btn kind="amber" size="sm" onClick={() => go('report')}>End & view report</Btn>
        </div>
      </div>

      {/* playback strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 26px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' }}>
        <button onClick={() => (cur.qi === SCRIPT.length - 1 && resolved) ? restart() : setPlaying(p => !p)} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer', background: RS.amber, color: RS.navy900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {playing ? <svg width="13" height="13" viewBox="0 0 12 12"><rect x="2" y="1.5" width="3" height="9" rx="1" fill="currentColor"/><rect x="7" y="1.5" width="3" height="9" rx="1" fill="currentColor"/></svg> : <svg width="13" height="13" viewBox="0 0 12 12"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>}
        </button>
        <button onClick={restart} title="Restart" style={{ background: 'none', border: 'none', cursor: 'pointer', color: RS.onDarkDim, display: 'flex' }}><svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M3 9a6 6 0 106-6M3 9V5M3 9h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        {/* question scrubber */}
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {SCRIPT.map((b, i) => {
            const isResolved = i <= resolvedUpTo, isCur = i === cur.qi;
            const st = isResolved ? sigOf(b.signal) : null;
            return (
              <button key={i} onClick={() => jump(i)} style={{ flex: 1, cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}>
                <div style={{ height: 5, borderRadius: 99, background: isResolved ? st.c : isCur ? RS.amber : 'rgba(255,255,255,.12)', opacity: isCur && !isResolved ? 1 : isResolved ? .9 : 1, transition: 'all .4s' }} />
                <div style={{ fontFamily: RS.mono, fontSize: 9, color: isCur ? '#fff' : RS.onDarkFaint, marginTop: 5, textAlign: 'left' }}>Q{b.q}</div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.06)', borderRadius: 8, padding: 3 }}>
          {[1, 2].map(s => <button key={s} onClick={() => setSpeed(s)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: RS.mono, fontSize: 11, fontWeight: 600, background: speed === s ? RS.navy600 : 'transparent', color: speed === s ? '#fff' : RS.onDarkDim }}>{s}×</button>)}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 372px', gap: 18, padding: '20px 26px 30px' }}>
        {/* left main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* current question */}
          <div style={{ padding: '18px 20px', borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <MonoLabel size={9.5} color={RS.amber}>Question {block.q} of {SCRIPT.length} · Recruiter</MonoLabel>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Waveform active={typing} />
                <span style={{ fontFamily: RS.mono, fontSize: 10.5, color: RS.onDarkDim }}>{cur.sub === 'think' ? `+${block.latency.toFixed(1)}s to first word` : typing ? 'answering' : 'answer complete'}</span>
              </span>
            </div>
            <div style={{ fontFamily: RS.font, fontWeight: 500, fontSize: 19, letterSpacing: '-.015em', lineHeight: 1.35, color: '#fff' }}>“{block.question}”</div>
          </div>

          {/* signal hero */}
          <div style={{ padding: 20, borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <MonoLabel size={9.5} color={RS.onDarkDim}>Live signal</MonoLabel>
              <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,.06)', borderRadius: 8, padding: 3 }}>
                {[['orb', 'Orb'], ['drivers', 'Drivers'], ['band', 'Band']].map(([k, l]) => (
                  <button key={k} onClick={() => setVariation(k)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: RS.font, fontSize: 11.5, fontWeight: 600, background: variation === k ? RS.navy600 : 'transparent', color: variation === k ? '#fff' : RS.onDarkDim }}>{l}</button>
                ))}
              </div>
            </div>
            <SignalHero variation={variation} block={block} conf={dispConf} state={dispState} />
          </div>

          {/* detected patterns */}
          <div style={{ padding: 20, borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
            <MonoLabel size={9.5} color={RS.onDarkDim} style={{ marginBottom: 14 }}>Detected patterns · this answer</MonoLabel>
            {resolved && block.patterns.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {block.patterns.map((p, i) => {
                  const s = sigOf(p.sev);
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 13px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: `1px solid ${s.c}33`, animation: `rsRise .4s ease ${i * 0.08}s both` }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.c, marginTop: 5, flexShrink: 0, boxShadow: `0 0 8px ${s.c}` }} />
                      <div style={{ flex: 1 }}><div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 13, color: '#fff' }}>{p.t}</div><div style={{ fontFamily: RS.font, fontSize: 12, color: RS.onDarkDim, marginTop: 2 }}>{p.d}</div></div>
                      <span style={{ fontFamily: RS.mono, fontSize: 9, letterSpacing: '.08em', color: s.c, textTransform: 'uppercase', padding: '3px 7px', borderRadius: 5, background: `${s.c}1a`, alignSelf: 'flex-start' }}>{p.sev}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontFamily: RS.font, fontSize: 13, color: RS.onDarkFaint, padding: '6px 0' }}>{resolved ? 'No significant patterns detected in this answer.' : 'Analyzing answer…'}</div>
            )}
          </div>

          {/* follow up */}
          {resolved && block.followup && (
            <div style={{ padding: 20, borderRadius: 14, background: `linear-gradient(180deg, ${RS.amber}1f, ${RS.amber}0a)`, border: `1px solid ${RS.amber}55`, animation: 'rsRise .45s ease both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}><SignalMark size={16} color={RS.amber} dim="#5a4a22" /><MonoLabel size={9.5} color={RS.amber}>Suggested follow-up</MonoLabel></div>
              <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 17, lineHeight: 1.4, color: '#fff', letterSpacing: '-.01em' }}>“{block.followup.q}”</div>
              <div style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.onDarkDim, marginTop: 9 }}>{block.followup.why}</div>
            </div>
          )}
        </div>

        {/* right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* transcript */}
          <div style={{ padding: 18, borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column', height: 300 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><MonoLabel size={9.5} color={RS.onDarkDim}>Live transcript · Deepgram</MonoLabel><span style={{ fontFamily: RS.mono, fontSize: 9.5, color: RS.signal.normal.c }}>● 94% conf</span></div>
            <div ref={transcriptRef} style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 4 }}>
              {SCRIPT.slice(0, cur.qi + 1).map((b, i) => {
                const isCur = i === cur.qi;
                const shown = isCur ? (cur.sub === 'think' ? 0 : shownWords) : b.answer.split(' ').length;
                const txt = b.answer.split(' ').slice(0, shown).join(' ');
                return (
                  <div key={i}>
                    <div style={{ fontFamily: RS.mono, fontSize: 9.5, color: RS.amber, marginBottom: 5, letterSpacing: '.04em' }}>RECRUITER · Q{b.q}</div>
                    <div style={{ fontFamily: RS.font, fontSize: 12, color: RS.onDarkDim, fontStyle: 'italic', marginBottom: 8 }}>{b.question}</div>
                    {(shown > 0 || !isCur) && <>
                      <div style={{ fontFamily: RS.mono, fontSize: 9.5, color: RS.onDarkFaint, marginBottom: 5, letterSpacing: '.04em' }}>{LIVE.name.toUpperCase()}</div>
                      <div style={{ fontFamily: RS.font, fontSize: 13, color: '#fff', lineHeight: 1.55 }}>{txt}{isCur && cur.sub === 'type' && <span style={{ borderRight: `2px solid ${RS.amber}`, marginLeft: 1, animation: 'rsBlink 1s step-end infinite' }}>&nbsp;</span>}</div>
                    </>}
                  </div>
                );
              })}
            </div>
          </div>
          {/* gaze */}
          <div style={{ padding: 18, borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
            <GazePanel block={block} live={playing && (typing || resolved)} />
          </div>
          {/* timeline */}
          <div style={{ padding: 18, borderRadius: 14, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
            <MonoLabel size={9.5} color={RS.onDarkDim} style={{ marginBottom: 14 }}>Signal timeline</MonoLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SCRIPT.map((b, i) => {
                const isResolved = i <= resolvedUpTo, isCur = i === cur.qi;
                const st = isResolved ? sigOf(b.signal) : null;
                return (
                  <div key={i} onClick={() => jump(i)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '7px 8px', borderRadius: 8, cursor: 'pointer', background: isCur ? 'rgba(255,255,255,.05)' : 'transparent' }}>
                    <span style={{ fontFamily: RS.mono, fontSize: 10.5, color: RS.onDarkFaint, width: 18 }}>Q{b.q}</span>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: isResolved ? st.c : 'rgba(255,255,255,.14)', boxShadow: isResolved ? `0 0 8px ${st.c}66` : 'none', flexShrink: 0 }} />
                    <span style={{ fontFamily: RS.font, fontSize: 12, color: isResolved ? '#fff' : RS.onDarkFaint, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isResolved ? st.glyph : isCur ? 'Analyzing…' : 'Pending'}</span>
                    {isResolved && <span style={{ fontFamily: RS.mono, fontSize: 10, color: st.c }}>{b.confidence.toFixed(2)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Waveform({ active }) {
  const bars = [0.4, 0.8, 0.55, 1, 0.65, 0.85, 0.45];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 14 }}>
      {bars.map((h, i) => <span key={i} style={{ width: 2.5, borderRadius: 2, background: active ? RS.signal.normal.c : RS.onDarkFaint, height: `${h * 100}%`, animation: active ? `rsWave .9s ease-in-out ${i * 0.1}s infinite` : 'none', opacity: active ? 1 : .4 }} />)}
    </span>
  );
}
const PipIcon = () => <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="8.5" width="5.5" height="4.5" rx="1" fill="currentColor"/></svg>;

Object.assign(window, { Dashboard });
