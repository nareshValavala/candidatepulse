// CandidatePulse — post-interview report, settings/billing, PiP widget
const { useState: uSr } = React;

// aggregate the scripted session
const SESSION_SCORES = { structure: 0.79, specificity: 0.31, timing: 0.68, gaze: 0.84, drift: 0.72 };
const OVERALL = { state: 'elevated', conf: 0.74 };

// ===================================================================== REPORT
function ReportScreen({ go }) {
  const evidence = [SCRIPT[2], SCRIPT[5]];
  return (
    <AppChrome go={go} active="report">
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <button onClick={() => go('sessions')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: RS.font, fontSize: 13, color: RS.slate, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, padding: 0 }}><span style={{ transform: 'rotate(180deg)', display: 'flex' }}><Chevron /></span> All sessions</button>
          <MonoLabel style={{ marginBottom: 8 }}>Behavioral Signal Report</MonoLabel>
          <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 26, letterSpacing: '-.025em', color: RS.ink }}>Jordan Bell</div>
          <div style={{ fontFamily: RS.font, fontSize: 14, color: RS.slate, marginTop: 3 }}>Senior Backend Engineer · 41:09 · Jun 7, 2026</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}><Btn kind="ghost" icon={<Copy />}>Share with hiring manager</Btn><Btn kind="primary" icon={<DownloadIcon />}>Export PDF</Btn></div>
      </div>

      {/* disclaimer banner */}
      <div style={{ display: 'flex', gap: 11, padding: '13px 16px', borderRadius: 10, background: RS.wash, border: `1px solid ${RS.line}`, marginBottom: 20 }}>
        <span style={{ color: RS.slate, flexShrink: 0, marginTop: 1 }}><InfoIcon /></span>
        <div style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.ink2, lineHeight: 1.5 }}>This is a <b>behavioral signal</b>, not a verdict. It does not determine capability, truthfulness, or hiring suitability. Signals are probabilistic and intended to guide where a recruiter digs deeper. Non-native English speakers are a known false-positive category.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
        {/* exec summary */}
        <Card pad={24}>
          <MonoLabel style={{ marginBottom: 16 }}>Executive summary</MonoLabel>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <RingScore conf={OVERALL.conf} state={OVERALL.state} />
            </div>
            <div style={{ flex: 1 }}>
              <SignalBadge k={OVERALL.state} size="lg" />
              <div style={{ fontFamily: RS.font, fontSize: 13.5, color: RS.ink2, lineHeight: 1.6, marginTop: 12 }}>
                Multiple signals converged from Q3 onward. Answers to open behavioral prompts showed a <b>repeated 3-point template</b>, low specificity, and a sustained fixed-gaze signature consistent with on-screen reading. Conversational register returned on Q5, then the template re-appeared on Q6.
              </div>
            </div>
          </div>
        </Card>

        {/* recommended action */}
        <Card pad={24} style={{ background: `linear-gradient(180deg, ${RS.amberSoft}, #fff)`, border: `1px solid ${RS.amberLine}` }}>
          <MonoLabel color={RS.amberDeep} style={{ marginBottom: 14 }}>Recommended action</MonoLabel>
          <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 16, color: RS.ink, lineHeight: 1.4, letterSpacing: '-.01em' }}>Recommend a follow-up live conversation focused on specifics.</div>
          <div style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.ink2, marginTop: 10, lineHeight: 1.55 }}>Ask the candidate to walk through one project in concrete detail — names, files, numbers. This is a <b>process recommendation, not a hiring decision</b>.</div>
        </Card>
      </div>

      {/* timeline */}
      <Card pad={24} style={{ marginTop: 18 }}>
        <MonoLabel style={{ marginBottom: 18 }}>Signal timeline</MonoLabel>
        <div style={{ display: 'flex', gap: 10 }}>
          {SCRIPT.map(b => {
            const s = sigOf(b.signal);
            return (
              <div key={b.q} style={{ flex: 1 }}>
                <div style={{ height: 56, borderRadius: 9, background: s.bg, border: `1px solid ${s.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: s.c }} />
                  <span style={{ fontFamily: RS.mono, fontSize: 10, color: s.c }}>{b.confidence.toFixed(2)}</span>
                </div>
                <div style={{ fontFamily: RS.mono, fontSize: 10, color: RS.slate, textAlign: 'center', marginTop: 7 }}>Q{b.q}</div>
                <div style={{ fontFamily: RS.font, fontSize: 10.5, color: RS.slate3, textAlign: 'center', marginTop: 2 }}>{s.glyph}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18 }}>
        {/* pattern breakdown */}
        <Card pad={24}>
          <MonoLabel style={{ marginBottom: 18 }}>Pattern breakdown</MonoLabel>
          {[['Structural consistency', SESSION_SCORES.structure], ['Specificity deficit', 1 - SESSION_SCORES.specificity], ['Timing regularity', SESSION_SCORES.timing], ['Gaze / reading behavior', SESSION_SCORES.gaze], ['Cross-question drift', SESSION_SCORES.drift]].map(([l, v]) => {
            const col = v > 0.66 ? RS.signal.elevated.c : v > 0.4 ? RS.signal.mild.c : RS.signal.normal.c;
            return (
              <div key={l} style={{ marginBottom: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}><span style={{ fontFamily: RS.font, fontSize: 13, color: RS.ink2, fontWeight: 500 }}>{l}</span><span style={{ fontFamily: RS.mono, fontSize: 12, color: col }}>{v.toFixed(2)}</span></div>
                <Meter value={v} color={col} h={6} />
              </div>
            );
          })}
        </Card>

        {/* behavioral summary */}
        <Card pad={24}>
          <MonoLabel style={{ marginBottom: 14 }}>Behavioral summary</MonoLabel>
          {[['Dominant response style', 'Templated, evenly-paced, low-specificity on open behavioral prompts.'],
            ['Observed anomaly', 'Sustained fixed-gaze (31–44s) + blink-rate floor (5–7/min) during Q3, Q4, Q6.'],
            ['Consistency across arc', 'Bimodal — natural on factual/role questions, templated on “tell me about a time” prompts.'],
            ['Non-native consideration', 'No phonetic markers flagged. Register shift on Q5 argues against a language-fluency explanation.']].map(([t, d]) => (
            <div key={t} style={{ paddingBottom: 13, marginBottom: 13, borderBottom: `1px solid ${RS.lineSoft}` }}>
              <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 12.5, color: RS.ink }}>{t}</div>
              <div style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.slate, marginTop: 3, lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* evidence */}
      <Card pad={24} style={{ marginTop: 18 }}>
        <MonoLabel style={{ marginBottom: 18 }}>Evidence examples</MonoLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {evidence.map(b => {
            const s = sigOf(b.signal);
            return (
              <div key={b.q} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, borderRadius: 11, background: RS.wash, border: `1px solid ${RS.line}` }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}><span style={{ fontFamily: RS.mono, fontSize: 10.5, color: RS.slate }}>Q{b.q}</span><SignalBadge k={b.signal} size="sm" /></div>
                  <div style={{ fontFamily: RS.font, fontSize: 12, color: RS.slate, fontStyle: 'italic', marginBottom: 8 }}>{b.question}</div>
                  <div style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.ink2, lineHeight: 1.55, padding: '10px 12px', background: '#fff', borderRadius: 8, borderLeft: `3px solid ${s.c}` }}>“{b.answer.slice(0, 180)}…”</div>
                </div>
                <div>
                  <MonoLabel size={9} style={{ marginBottom: 9 }}>Contributing features</MonoLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {b.patterns.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: sigOf(p.sev).c, marginTop: 5, flexShrink: 0 }} />
                        <div><span style={{ fontFamily: RS.font, fontSize: 12.5, fontWeight: 600, color: RS.ink }}>{p.t}.</span> <span style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.slate }}>{p.d}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginTop: 18, padding: '14px 18px', borderRadius: 10, background: RS.navy800, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 13.5 }}>Was this signal accurate?</span><span style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.onDarkDim }}>Your correction trains the eval dataset — the moat.</span></div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}><Btn kind="ghostDark" size="sm">Looks human</Btn><Btn kind="ghostDark" size="sm">Looks AI-assisted</Btn><Btn kind="ghostDark" size="sm">Inconclusive</Btn></div>
      </div>
    </AppChrome>
  );
}

function RingScore({ conf, state }) {
  const s = sigOf(state); const R = 40, C = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: 104, height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="104" height="104" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}><circle cx="52" cy="52" r={R} fill="none" stroke={RS.wash2} strokeWidth="9" /><circle cx="52" cy="52" r={R} fill="none" stroke={s.c} strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - conf)} /></svg>
      <div style={{ textAlign: 'center' }}><div style={{ fontFamily: RS.mono, fontSize: 22, color: RS.ink, lineHeight: 1 }}>{conf.toFixed(2)}</div><div style={{ fontFamily: RS.mono, fontSize: 8, color: RS.slate3, letterSpacing: '.12em', marginTop: 3 }}>CONF</div></div>
    </div>
  );
}

// ===================================================================== SETTINGS
function SettingsScreen({ go }) {
  const [retention, setRetention] = uSr('7d');
  const [sensitivity, setSensitivity] = uSr(2);
  const [disclose, setDisclose] = uSr(true);
  return (
    <AppChrome go={go} active="settings">
      <MonoLabel style={{ marginBottom: 8 }}>Settings</MonoLabel>
      <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 25, letterSpacing: '-.025em', color: RS.ink, marginBottom: 24 }}>Account & billing</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        {/* plan */}
        <Card pad={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div><MonoLabel style={{ marginBottom: 10 }}>Current plan</MonoLabel><div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 22, color: RS.ink }}>Team</span><span style={{ fontFamily: RS.mono, fontSize: 13, color: RS.slate }}>$299 / mo</span></div></div>
            <Btn kind="ghost" size="sm">Change plan</Btn>
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.ink2 }}>68 of 100 interviews this cycle</span><span style={{ fontFamily: RS.mono, fontSize: 12, color: RS.slate }}>resets Jul 1</span></div>
            <Meter value={0.68} color={RS.amber} h={8} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            {[['Per-interview cost', '$0.54'], ['Your price', '$2.99'], ['Margin', '~5.5×']].map(([l, v]) => (
              <div key={l} style={{ flex: 1, padding: '12px 14px', borderRadius: 9, background: RS.wash, border: `1px solid ${RS.line}` }}><MonoLabel size={9}>{l}</MonoLabel><div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 17, color: RS.ink, marginTop: 6 }}>{v}</div></div>
            ))}
          </div>
        </Card>

        {/* payment */}
        <Card pad={24}>
          <MonoLabel style={{ marginBottom: 14 }}>Payment · Stripe</MonoLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 9, background: RS.wash, border: `1px solid ${RS.line}` }}>
            <div style={{ width: 40, height: 26, borderRadius: 5, background: RS.navy800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: RS.mono, fontSize: 9, color: '#fff' }}>VISA</div>
            <div style={{ flex: 1 }}><div style={{ fontFamily: RS.mono, fontSize: 13, color: RS.ink }}>•••• 4242</div><div style={{ fontFamily: RS.font, fontSize: 11, color: RS.slate3 }}>Expires 09 / 28</div></div>
            <Btn kind="quiet" size="sm">Edit</Btn>
          </div>
          <div style={{ fontFamily: RS.font, fontSize: 12, color: RS.slate, marginTop: 14, lineHeight: 1.5 }}>Next invoice <b style={{ color: RS.ink2 }}>$299.00</b> on Jul 1, 2026.</div>
        </Card>
      </div>

      {/* signal config */}
      <Card pad={24} style={{ marginTop: 18 }}>
        <MonoLabel style={{ marginBottom: 18 }}>Signal & compliance</MonoLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div>
            <Field label="Default data retention" hint="Raw audio & video auto-delete after this window. Signal scores are retained for reporting.">
              <div style={{ display: 'flex', gap: 8 }}>
                {[['24h', '24 hours'], ['7d', '7 days'], ['30d', '30 days']].map(([k, l]) => (
                  <button key={k} onClick={() => setRetention(k)} style={{ flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontFamily: RS.font, fontWeight: 600, fontSize: 12.5, border: `1.5px solid ${retention === k ? RS.navy800 : RS.slate1}`, background: retention === k ? RS.navy800 : RS.paper, color: retention === k ? '#fff' : RS.ink2 }}>{l}</button>
                ))}
              </div>
            </Field>
            <div style={{ marginTop: 20 }}>
              <Field label="Signal sensitivity" hint="Higher sensitivity surfaces more signals — and more false positives. We recommend Balanced.">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Conservative', 'Balanced', 'Sensitive'].map((l, i) => (
                    <button key={l} onClick={() => setSensitivity(i + 1)} style={{ flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontFamily: RS.font, fontWeight: 600, fontSize: 12, border: `1.5px solid ${sensitivity === i + 1 ? RS.navy800 : RS.slate1}`, background: sensitivity === i + 1 ? RS.navy800 : RS.paper, color: sensitivity === i + 1 ? '#fff' : RS.ink2 }}>{l}</button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Toggle on={disclose} set={setDisclose} title="Non-native speaker disclosure" desc="Show the known false-positive disclaimer on every report shared externally." />
            <Toggle on={true} set={() => {}} title="Consent-first gate (locked)" desc="Streams cannot begin without explicit candidate consent. Required — cannot be disabled." locked />
            <Toggle on={true} set={() => {}} title="Behavioral-only signals" desc="No demographic inference. EEOC-aligned. Recommended on." />
            <div style={{ padding: '13px 15px', borderRadius: 10, background: RS.wash, border: `1px solid ${RS.line}` }}>
              <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 12.5, color: RS.ink }}>Eval dataset contribution</div>
              <div style={{ fontFamily: RS.font, fontSize: 11.5, color: RS.slate, marginTop: 3, lineHeight: 1.5 }}>Your recruiter corrections improve detection accuracy. Stored separately from customer data, never auto-deleted.</div>
            </div>
          </div>
        </div>
      </Card>

      <Card pad={20} style={{ marginTop: 18, border: `1px solid ${RS.signal.strong.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 13.5, color: RS.signal.strong.c }}>Delete all session data</div><div style={{ fontFamily: RS.font, fontSize: 12, color: RS.slate, marginTop: 3 }}>Permanently removes audio, video, transcripts, and scores. Cannot be undone.</div></div>
          <Btn kind="danger" size="sm">Delete data</Btn>
        </div>
      </Card>
    </AppChrome>
  );
}

function Toggle({ on, set, title, desc, locked }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <button onClick={() => !locked && set(!on)} style={{ width: 40, height: 24, borderRadius: 99, border: 'none', cursor: locked ? 'default' : 'pointer', background: on ? RS.signal.normal.c : RS.slate2, position: 'relative', flexShrink: 0, marginTop: 1, opacity: locked ? .7 : 1 }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 19 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,.2)' }} />
      </button>
      <div><div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 12.5, color: RS.ink }}>{title}</div><div style={{ fontFamily: RS.font, fontSize: 11.5, color: RS.slate, marginTop: 2, lineHeight: 1.45 }}>{desc}</div></div>
    </div>
  );
}

// ===================================================================== PiP
function PipScreen({ go }) {
  const block = SCRIPT[2]; // elevated Q3
  const s = sigOf(block.signal);
  return (
    <div style={{ minHeight: '100%', background: '#1A1D23', padding: 0, display: 'flex', flexDirection: 'column' }}>
      {/* fake conferencing chrome */}
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <span style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 13, color: '#fff' }}>Northwind · Interview — Jordan Bell</span>
        <button onClick={() => go('dashboard')} style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.onDarkDim, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 7, padding: '6px 12px', cursor: 'pointer' }}>← Back to dashboard</button>
      </div>
      <div style={{ flex: 1, position: 'relative', padding: 20 }}>
        {/* video gallery placeholder */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, height: 'calc(100vh - 220px)', minHeight: 380 }}>
          {[['Jordan Bell', true], ['You', false]].map(([n, cand]) => (
            <div key={n} style={{ borderRadius: 14, background: 'repeating-linear-gradient(45deg, #23262E, #23262E 12px, #20232A 12px, #20232A 24px)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <Avatar name={n} size={72} dark />
              <div style={{ position: 'absolute', bottom: 12, left: 12, fontFamily: RS.font, fontSize: 12.5, fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,.45)', padding: '4px 10px', borderRadius: 7 }}>{n}{cand && ' · speaking'}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: RS.mono, fontSize: 10, color: 'rgba(255,255,255,.3)', textAlign: 'center', marginTop: 14, letterSpacing: '.06em' }}>[ ZOOM / TEAMS CALL — NOT EMBEDDABLE · RUNS IN ITS OWN WINDOW · READSIGNAL FLOATS VIA PICTURE-IN-PICTURE API ]</div>

        {/* PiP widget */}
        <div style={{ position: 'absolute', right: 36, bottom: 36, width: 280, borderRadius: 16, overflow: 'hidden', background: `radial-gradient(120% 100% at 80% 0%, ${RS.navy700}, ${RS.navy900})`, border: `1px solid ${s.c}66`, boxShadow: `0 24px 60px -16px rgba(0,0,0,.7), 0 0 0 1px ${s.c}22` }}>
          <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SignalMark size={14} color={RS.amber} dim="#3A567F" /><span style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 11.5, color: '#fff' }}>CandidatePulse</span></div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Dot k="strong" size={6} pulse /><span style={{ fontFamily: RS.mono, fontSize: 9, color: RS.onDarkDim }}>LIVE</span></span>
          </div>
          <div style={{ padding: 16, color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, ${s.c}, ${s.c}cc)`, boxShadow: `0 0 22px ${s.c}66` }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: RS.mono, fontSize: 15, color: '#fff' }}>{block.confidence.toFixed(2)}</div>
              </div>
              <div><div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 14, color: s.c }}>{s.label}</div><div style={{ fontFamily: RS.font, fontSize: 11, color: RS.onDarkDim, marginTop: 2 }}>Q3 · led-a-team prompt</div></div>
            </div>
            <div style={{ padding: '10px 12px', borderRadius: 9, background: `${RS.amber}1a`, border: `1px solid ${RS.amber}40` }}>
              <MonoLabel size={8.5} color={RS.amber} style={{ marginBottom: 5 }}>Ask next</MonoLabel>
              <div style={{ fontFamily: RS.font, fontSize: 12, color: '#fff', lineHeight: 1.4, fontWeight: 500 }}>“{block.followup.q}”</div>
            </div>
            <button onClick={() => go('dashboard')} style={{ width: '100%', marginTop: 12, padding: '9px', borderRadius: 8, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.06)', color: '#fff', fontFamily: RS.font, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Expand dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DownloadIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1v9m0 0L5 7m3 3l3-3M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const InfoIcon = () => <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9 8v4M9 5.6v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;

Object.assign(window, { ReportScreen, SettingsScreen, PipScreen });
