// CandidatePulse — app shell + prototype navigator
const { useState: uSa, useEffect: uEa } = React;

const SCREENS = {
  login: { c: 'LoginScreen', label: 'Sign in', group: 'Recruiter' },
  sessions: { c: 'SessionsScreen', label: 'Session list', group: 'Recruiter' },
  create: { c: 'CreateScreen', label: 'Create session', group: 'Recruiter' },
  dashboard: { c: 'Dashboard', label: 'Live dashboard', group: 'Live interview' },
  pip: { c: 'PipScreen', label: 'Picture-in-Picture', group: 'Live interview' },
  candidate: { c: 'CandidateConsent', label: 'Consent screen', group: 'Candidate' },
  'candidate-active': { c: 'CandidateActive', label: 'Active session', group: 'Candidate' },
  report: { c: 'ReportScreen', label: 'Signal report', group: 'Reports & account' },
  settings: { c: 'SettingsScreen', label: 'Settings & billing', group: 'Reports & account' },
};
const ORDER = ['login', 'sessions', 'create', 'dashboard', 'pip', 'candidate', 'candidate-active', 'report', 'settings'];

function App() {
  const [screen, setScreen] = uSa(() => localStorage.getItem('rs_screen') || 'login');
  const [navOpen, setNavOpen] = uSa(false);
  const go = (s) => { setScreen(s); setNavOpen(false); window.scrollTo(0, 0); const m = document.querySelector('main'); if (m) m.scrollTop = 0; };
  uEa(() => { localStorage.setItem('rs_screen', screen); }, [screen]);

  const Comp = window[SCREENS[screen].c];
  const groups = {};
  ORDER.forEach(k => { const g = SCREENS[k].group; (groups[g] = groups[g] || []).push(k); });

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div key={screen} style={{ minHeight: '100vh', animation: 'rsFade .25s ease' }}>
        {Comp ? <Comp go={go} /> : <div style={{ padding: 40 }}>Missing: {screen}</div>}
      </div>

      {/* prototype navigator */}
      <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 1000, fontFamily: RS.font }}>
        {navOpen && (
          <div style={{ position: 'absolute', bottom: 56, right: 0, width: 256, background: RS.navy900, borderRadius: 14, border: '1px solid rgba(255,255,255,.1)', boxShadow: RS.shadowDark, padding: 12, animation: 'rsRise .2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 10px' }}>
              <span style={{ fontFamily: RS.mono, fontSize: 9.5, letterSpacing: '.16em', color: RS.onDarkFaint, textTransform: 'uppercase' }}>Prototype · 9 screens</span>
            </div>
            {Object.entries(groups).map(([g, keys]) => (
              <div key={g} style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: RS.mono, fontSize: 8.5, letterSpacing: '.12em', color: RS.amber, textTransform: 'uppercase', padding: '5px 6px 4px' }}>{g}</div>
                {keys.map(k => (
                  <button key={k} onClick={() => go(k)} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left', padding: '7px 8px', borderRadius: 7, border: 'none', cursor: 'pointer', background: screen === k ? 'rgba(255,255,255,.1)' : 'transparent', color: screen === k ? '#fff' : RS.onDarkDim, fontFamily: RS.font, fontSize: 12.5, fontWeight: 500 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: screen === k ? RS.amber : 'rgba(255,255,255,.22)' }} />{SCREENS[k].label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setNavOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 15px', borderRadius: 99, border: '1px solid rgba(255,255,255,.12)', background: RS.navy800, color: '#fff', cursor: 'pointer', boxShadow: RS.shadowDark, fontFamily: RS.font, fontWeight: 600, fontSize: 12.5 }}>
          <SignalMark size={15} color={RS.amber} dim="#3A567F" />Screens
          <span style={{ fontFamily: RS.mono, fontSize: 10, color: RS.onDarkFaint, marginLeft: 2 }}>{ORDER.indexOf(screen) + 1}/9</span>
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
