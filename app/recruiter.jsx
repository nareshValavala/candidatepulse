// CandidatePulse — recruiter screens: login, session list, create session
const { useState } = React;

// ---------------------------------------------------------------- LOGIN
function LoginScreen({ go }) {
  return (
    <div style={{ minHeight: '100%', display: 'grid', gridTemplateColumns: '1.05fr 1fr', background: RS.wash }}>
      {/* left: brand panel */}
      <div style={{ background: `radial-gradient(120% 90% at 0% 0%, ${RS.navy700}, ${RS.navy900} 70%)`, padding: '54px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .5, backgroundImage: `linear-gradient(${RS.navy600}55 1px, transparent 1px), linear-gradient(90deg, ${RS.navy600}55 1px, transparent 1px)`, backgroundSize: '46px 46px', maskImage: 'radial-gradient(80% 80% at 30% 20%, #000, transparent)' }} />
        <div style={{ position: 'relative' }}><Logo color="#fff" mark={RS.amber} size={19} /></div>
        <div style={{ position: 'relative', maxWidth: 420 }}>
          <MonoLabel color={RS.amber} style={{ marginBottom: 18 }}>Behavioral Signal System</MonoLabel>
          <div style={{ fontFamily: RS.font, fontWeight: 500, fontSize: 30, lineHeight: 1.18, letterSpacing: '-.025em', color: '#fff' }}>
            Know when answers look like they were generated, not remembered.
          </div>
          <div style={{ fontFamily: RS.font, fontSize: 14.5, lineHeight: 1.6, color: RS.onDarkDim, marginTop: 18 }}>
            A live signal — never a verdict. CandidatePulse reads behavioral patterns in spoken answers so you know when to dig deeper.
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: 26 }}>
          {[['38.5%', 'of interviews flag patterns'], ['$0.54', 'loaded cost / interview'], ['~75%', 'overlay-read detection']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: RS.mono, fontSize: 22, color: '#fff', letterSpacing: '-.02em' }}>{n}</div>
              <div style={{ fontFamily: RS.font, fontSize: 11.5, color: RS.onDarkFaint, marginTop: 3, maxWidth: 130 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* right: form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 360 }}>
          <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 23, letterSpacing: '-.02em', color: RS.ink }}>Sign in</div>
          <div style={{ fontFamily: RS.font, fontSize: 13.5, color: RS.slate, marginTop: 5, marginBottom: 26 }}>Welcome back. Continue to your sessions.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Work email"><input style={inputStyle} defaultValue="you@northwind.co" /></Field>
            <Field label="Password"><input style={inputStyle} type="password" defaultValue="••••••••••" /></Field>
            <Btn kind="primary" full size="lg" onClick={() => go('sessions')}>Continue</Btn>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: RS.line }} /><MonoLabel size={9.5}>or</MonoLabel><div style={{ flex: 1, height: 1, background: RS.line }} />
            </div>
            <Btn kind="ghost" full size="lg" onClick={() => go('sessions')} icon={<span style={{ fontFamily: RS.mono, fontWeight: 700 }}>G</span>}>Continue with Google</Btn>
          </div>
          <div style={{ fontFamily: RS.font, fontSize: 11.5, color: RS.slate3, marginTop: 22, lineHeight: 1.5 }}>
            Powered by Clerk · SOC 2 Type II · Consent-first by design
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------- SESSION LIST
function statusMeta(s) {
  if (s === 'live') return { label: 'Live', c: '#BF4631', bg: '#F8E3DE' };
  if (s === 'scheduled') return { label: 'Scheduled', c: RS.slate, bg: RS.wash2 };
  return { label: 'Complete', c: RS.navy700, bg: '#E7ECF3' };
}

function SessionsScreen({ go }) {
  const [filter, setFilter] = useState('all');
  const tabs = [['all', 'All'], ['live', 'Live'], ['scheduled', 'Scheduled'], ['complete', 'Complete']];
  const rows = SESSIONS.filter(s => filter === 'all' || s.status === filter);
  return (
    <AppChrome go={go} active="sessions">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <MonoLabel style={{ marginBottom: 8 }}>Sessions</MonoLabel>
          <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 25, letterSpacing: '-.025em', color: RS.ink }}>Interview sessions</div>
        </div>
        <Btn kind="amber" size="md" onClick={() => go('create')} icon={<Plus />}>New session</Btn>
      </div>

      {/* stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {[['Live now', '1', RS.signal.strong.c], ['This week', '14', RS.ink], ['Patterns flagged', '6', RS.signal.elevated.c], ['Avg. signal', 'Normal', RS.signal.normal.c]].map(([l, v, c]) => (
          <Card key={l} pad={16}>
            <MonoLabel size={9.5}>{l}</MonoLabel>
            <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 22, color: c, marginTop: 8, letterSpacing: '-.02em' }}>{v}</div>
          </Card>
        ))}
      </div>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: RS.font, fontWeight: 600, fontSize: 13,
            background: filter === k ? RS.navy800 : 'transparent', color: filter === k ? '#fff' : RS.slate }}>{l}</button>
        ))}
      </div>

      <Card pad={0}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.4fr 1fr 1.1fr 0.5fr', padding: '12px 20px', borderBottom: `1px solid ${RS.line}` }}>
          {['Candidate', 'Role', 'Status', 'Signal', ''].map(h => <MonoLabel key={h} size={9.5}>{h}</MonoLabel>)}
        </div>
        {rows.map((s, i) => {
          const sm = statusMeta(s.status);
          return (
            <div key={s.id} className="rs-row" onClick={() => go(s.status === 'live' ? 'dashboard' : s.status === 'complete' ? 'report' : 'create')}
              style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.4fr 1fr 1.1fr 0.5fr', alignItems: 'center', padding: '14px 20px', borderBottom: i < rows.length - 1 ? `1px solid ${RS.lineSoft}` : 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={s.name} size={34} />
                <div>
                  <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 14, color: RS.ink, letterSpacing: '-.01em' }}>{s.name}</div>
                  <div style={{ fontFamily: RS.mono, fontSize: 10.5, color: RS.slate3, marginTop: 2 }}>{s.when}{s.dur ? ` · ${s.dur}` : ''}</div>
                </div>
              </div>
              <div style={{ fontFamily: RS.font, fontSize: 13, color: RS.ink2 }}>{s.role}</div>
              <div><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 99, background: sm.bg, color: sm.c, fontFamily: RS.font, fontWeight: 600, fontSize: 11.5 }}>
                {s.status === 'live' && <Dot k="strong" size={7} pulse />}{sm.label}</span></div>
              <div>{s.signal ? <SignalBadge k={s.signal} size="sm" /> : <span style={{ fontFamily: RS.mono, fontSize: 11, color: RS.slate2 }}>—</span>}</div>
              <div style={{ textAlign: 'right', color: RS.slate2 }}><Chevron /></div>
            </div>
          );
        })}
      </Card>
    </AppChrome>
  );
}

// ------------------------------------------------------- CREATE SESSION
function CreateScreen({ go }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [retention, setRetention] = useState('7d');
  const [created, setCreated] = useState(false);

  if (created) return <SessionCreated go={go} name={name || 'Candidate'} role={role || 'Role'} />;

  return (
    <AppChrome go={go} active="sessions">
      <button onClick={() => go('sessions')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: RS.font, fontSize: 13, color: RS.slate, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: 0 }}><span style={{ transform: 'rotate(180deg)', display: 'flex' }}><Chevron /></span> Back to sessions</button>
      <div style={{ maxWidth: 560 }}>
        <MonoLabel style={{ marginBottom: 8 }}>New session</MonoLabel>
        <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 25, letterSpacing: '-.025em', color: RS.ink, marginBottom: 6 }}>Create an interview session</div>
        <div style={{ fontFamily: RS.font, fontSize: 13.5, color: RS.slate, marginBottom: 26 }}>We’ll generate a candidate link and your live dashboard link.</div>

        <Card pad={24}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field label="Candidate name"><input style={inputStyle} placeholder="e.g. Jordan Bell" value={name} onChange={e => setName(e.target.value)} /></Field>
            <Field label="Role"><input style={inputStyle} placeholder="e.g. Senior Backend Engineer" value={role} onChange={e => setRole(e.target.value)} /></Field>
            <Field label="Resume" hint="Optional. Used to ground specificity analysis against claimed experience.">
              <div style={{ border: `1.5px dashed ${RS.slate1}`, borderRadius: 9, padding: '20px', textAlign: 'center', background: RS.wash, cursor: 'pointer' }}>
                <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 13, color: RS.ink2 }}>Drop a PDF or click to upload</div>
                <div style={{ fontFamily: RS.mono, fontSize: 10.5, color: RS.slate3, marginTop: 5 }}>PDF · DOCX · up to 10MB</div>
              </div>
            </Field>
            <Field label="Data retention" hint="Raw audio & video auto-delete after this window. Signal scores are kept for reporting.">
              <div style={{ display: 'flex', gap: 8 }}>
                {[['24h', '24 hours'], ['7d', '7 days'], ['30d', '30 days']].map(([k, l]) => (
                  <button key={k} onClick={() => setRetention(k)} style={{ flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontFamily: RS.font, fontWeight: 600, fontSize: 13,
                    border: `1.5px solid ${retention === k ? RS.navy800 : RS.slate1}`, background: retention === k ? RS.navy800 : RS.paper, color: retention === k ? '#fff' : RS.ink2 }}>{l}</button>
                ))}
              </div>
            </Field>
          </div>
        </Card>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <Btn kind="primary" size="lg" onClick={() => setCreated(true)}>Create session & generate links</Btn>
          <Btn kind="ghost" size="lg" onClick={() => go('sessions')}>Cancel</Btn>
        </div>
      </div>
    </AppChrome>
  );
}

function SessionCreated({ go, name, role }) {
  const candLink = 'candidatepulse.io/s/9f2a-bell';
  const dashLink = 'candidatepulse.io/d/9f2a';
  return (
    <AppChrome go={go} active="sessions">
      <div style={{ maxWidth: 560 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '6px 12px', borderRadius: 99, background: RS.signal.normal.bg, border: `1px solid ${RS.signal.normal.line}`, marginBottom: 18 }}>
          <Check c={RS.signal.normal.c} /><span style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 12.5, color: RS.signal.normal.c }}>Session created</span>
        </div>
        <div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 23, letterSpacing: '-.02em', color: RS.ink }}>{name} · <span style={{ color: RS.slate, fontWeight: 500 }}>{role}</span></div>
        <div style={{ fontFamily: RS.font, fontSize: 13.5, color: RS.slate, marginTop: 6, marginBottom: 24 }}>Two links. Paste the candidate link into your calendar invite next to the Zoom/Teams link.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['Candidate link', candLink, 'Goes to the candidate. Opens consent → capture. No download.', RS.amber],
            ['Your dashboard link', dashLink, 'Your live signal view. Open in a second tab or monitor.', RS.navy800]].map(([t, link, desc, c]) => (
            <Card key={t} pad={18}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: c }} /><div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 13.5, color: RS.ink }}>{t}</div></div>
                  <div style={{ fontFamily: RS.mono, fontSize: 13, color: RS.navy700, marginTop: 10, padding: '9px 12px', background: RS.wash, borderRadius: 7, border: `1px solid ${RS.line}` }}>{link}</div>
                  <div style={{ fontFamily: RS.font, fontSize: 12, color: RS.slate3, marginTop: 8 }}>{desc}</div>
                </div>
                <Btn kind="ghost" size="sm" icon={<Copy />}>Copy</Btn>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Btn kind="amber" size="lg" onClick={() => go('dashboard')}>Open live dashboard</Btn>
          <Btn kind="ghost" size="lg" onClick={() => go('candidate')}>Preview candidate view</Btn>
        </div>
      </div>
    </AppChrome>
  );
}

// ---------------------------------------------------------- APP CHROME
function AppChrome({ children, go, active }) {
  const nav = [['sessions', 'Sessions', <IconGrid />], ['dashboard', 'Live', <IconPulse />], ['report', 'Reports', <IconDoc />], ['settings', 'Settings', <IconGear />]];
  return (
    <div style={{ minHeight: '100%', display: 'grid', gridTemplateColumns: '232px 1fr', background: RS.wash }}>
      <aside style={{ background: RS.navy800, padding: '22px 16px', display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 0, height: '100%' }}>
        <div style={{ padding: '4px 8px 22px' }}><Logo color="#fff" mark={RS.amber} size={16} /></div>
        {nav.map(([k, l, ic]) => (
          <button key={k} onClick={() => go(k)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
            background: active === k ? 'rgba(255,255,255,.10)' : 'transparent', color: active === k ? '#fff' : RS.onDarkDim, fontFamily: RS.font, fontWeight: 600, fontSize: 13.5 }}>
            <span style={{ opacity: active === k ? 1 : .7, display: 'flex' }}>{ic}</span>{l}
            {k === 'dashboard' && <Dot k="strong" size={7} pulse />}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
          <MonoLabel size={9} color={RS.onDarkFaint}>Plan · Team</MonoLabel>
          <div style={{ fontFamily: RS.font, fontSize: 12.5, color: RS.onDark, marginTop: 6 }}>68 / 100 interviews</div>
          <div style={{ marginTop: 8 }}><Meter value={0.68} color={RS.amber} track="rgba(255,255,255,.12)" h={5} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', marginTop: 4 }}>
          <Avatar name="You Northwind" size={30} dark /><div><div style={{ fontFamily: RS.font, fontWeight: 600, fontSize: 12.5, color: '#fff' }}>You</div><div style={{ fontFamily: RS.mono, fontSize: 9.5, color: RS.onDarkFaint }}>Northwind</div></div>
        </div>
      </aside>
      <main style={{ padding: '32px 40px', overflow: 'auto' }}>{children}</main>
    </div>
  );
}

// tiny icons
const Plus = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const Chevron = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const Copy = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M11 5V3a2 2 0 00-2-2H4a2 2 0 00-2 2v5a2 2 0 002 2h2" stroke="currentColor" strokeWidth="1.5" /></svg>;
const Check = ({ c }) => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.2 3.2L13 5" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IconGrid = () => <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" /></svg>;
const IconPulse = () => <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M1 9h4l2-5 3 11 2-6h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IconDoc = () => <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M4 2h6l4 4v10a0 0 0 010 0H4a0 0 0 010 0V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 2v4h4M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
const IconGear = () => <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.5" /><path d="M9 1.5v2M9 14.5v2M16.5 9h-2M3.5 9h-2M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4M14.3 14.3l-1.4-1.4M5.1 5.1L3.7 3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;

Object.assign(window, { LoginScreen, SessionsScreen, CreateScreen, AppChrome, statusMeta, Chevron, Copy, Check, Plus });
