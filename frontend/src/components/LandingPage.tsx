import { useNavigate } from 'react-router-dom';

/* ── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  bg:        '#FBFBFA',
  bgElev:    '#FFFFFF',
  bgSoft:    '#F4F4F1',
  ink:       '#0A0A0A',
  ink2:      '#1F1F1D',
  muted:     '#6B6B68',
  muted2:    '#98988F',
  line:      '#E7E7E2',
  line2:     '#EFEFEA',
  accent:    '#2D5BFF',
  accentInk: '#1E3FB8',
  success:   '#16A34A',
} as const;

const shadowCard = '0 1px 0 rgba(10,10,10,.04), 0 1px 2px rgba(10,10,10,.04)';
const shadowLift = '0 1px 0 rgba(10,10,10,.04), 0 10px 30px -12px rgba(10,10,10,.18), 0 30px 60px -30px rgba(10,10,10,.12)';

const font    = '"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const fontMono = '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace';

/* ── Buttons ────────────────────────────────────────────────────────────── */
function BtnPrimary({ onClick, children, lg }: { onClick?: () => void; children: React.ReactNode; lg?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: lg ? 46 : 38, padding: lg ? '0 22px' : '0 16px',
        borderRadius: lg ? 9 : 8, fontSize: lg ? 15 : 14, fontWeight: 500,
        letterSpacing: '-0.005em', border: '1px solid transparent',
        background: C.ink, color: '#fff',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 1px 0 rgba(0,0,0,.1)',
        cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: font,
        transition: 'background .15s ease',
      }}
      onMouseOver={e => (e.currentTarget.style.background = '#000')}
      onMouseOut={e => (e.currentTarget.style.background = C.ink)}
      onMouseDown={e => (e.currentTarget.style.transform = 'translateY(1px)')}
      onMouseUp={e => (e.currentTarget.style.transform = '')}
    >
      {children}
    </button>
  );
}

function BtnSecondary({ onClick, children, lg }: { onClick?: () => void; children: React.ReactNode; lg?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: lg ? 46 : 38, padding: lg ? '0 22px' : '0 16px',
        borderRadius: lg ? 9 : 8, fontSize: lg ? 15 : 14, fontWeight: 500,
        letterSpacing: '-0.005em', border: `1px solid ${C.line}`,
        background: C.bgElev, color: C.ink,
        boxShadow: shadowCard, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: font,
        transition: 'border-color .15s ease',
      }}
      onMouseOver={e => (e.currentTarget.style.borderColor = '#D4D4CE')}
      onMouseOut={e => (e.currentTarget.style.borderColor = C.line)}
      onMouseDown={e => (e.currentTarget.style.transform = 'translateY(1px)')}
      onMouseUp={e => (e.currentTarget.style.transform = '')}
    >
      {children}
    </button>
  );
}

function BtnGhost({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        height: 38, padding: '0 16px', borderRadius: 8, fontSize: 14,
        fontWeight: 500, letterSpacing: '-0.005em', border: '1px solid transparent',
        background: 'transparent', color: C.ink, cursor: 'pointer', fontFamily: font,
        transition: 'background .15s ease',
      }}
      onMouseOver={e => (e.currentTarget.style.background = C.bgSoft)}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  );
}

/* ── Arrow span ─────────────────────────────────────────────────────────── */
function Arr() {
  return <span style={{ display: 'inline-block' }}>→</span>;
}

/* ── Eyebrow label ──────────────────────────────────────────────────────── */
function Eyebrow({ children, light }: { children: string; light?: boolean }) {
  return (
    <div style={{
      fontFamily: fontMono, fontSize: 12, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: light ? 'rgba(255,255,255,.5)' : C.muted,
      fontWeight: 500,
    }}>
      {children}
    </div>
  );
}

/* ── Resume mini card (used in hero + features) ─────────────────────────── */
function ResumeCard({ style, name, role, contact, experiences, skills }: {
  style?: React.CSSProperties;
  name: string;
  role: string;
  contact?: string[];
  experiences?: { company: string; date: string; title?: string; bullets?: string[] }[];
  skills?: string[];
}) {
  const s: React.CSSProperties = {
    position: 'absolute', background: '#fff',
    border: `1px solid ${C.line}`, borderRadius: 12,
    boxShadow: shadowLift, overflow: 'hidden', ...style,
  };
  const pad: React.CSSProperties = { padding: '22px 24px' };
  return (
    <div style={s}>
      <div style={pad}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${C.line2}`, paddingBottom: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>{name}</div>
            <div style={{ fontFamily: fontMono, fontSize: 10, color: C.muted, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>{role}</div>
          </div>
          {contact && (
            <div style={{ fontFamily: fontMono, fontSize: 9, color: C.muted2, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
              {contact.map(c => <span key={c}>{c}</span>)}
            </div>
          )}
        </div>

        {/* experience */}
        {experiences && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Experience</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginTop: i > 0 ? 10 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.ink }}>{exp.company}</div>
                  <div style={{ fontFamily: fontMono, fontSize: 9, color: C.muted2 }}>{exp.date}</div>
                </div>
                {exp.title && <div style={{ fontSize: 10, color: C.ink2, marginTop: 1 }}>{exp.title}</div>}
                {exp.bullets?.map((b, j) => (
                  <div key={j} style={{ fontSize: 9.5, color: C.muted, lineHeight: 1.45, marginTop: 4, display: 'flex', gap: 6 }}>
                    <span style={{ flex: '0 0 3px', width: 3, height: 3, borderRadius: '50%', background: C.muted2, marginTop: 5, flexShrink: 0 }} />
                    {b}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* skills */}
        {skills && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: fontMono, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 8 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {skills.map(sk => (
                <span key={sk} style={{ fontSize: 9, padding: '2px 6px', border: `1px solid ${C.line}`, borderRadius: 4, color: C.ink2 }}>{sk}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Hero visual: stacked resume cards ──────────────────────────────────── */
function HeroVisual() {
  return (
    <div style={{ position: 'relative', aspectRatio: '1 / 1.05', perspective: 1400, width: '100%' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* back-2 */}
        <ResumeCard
          style={{ top: '8%', left: '-4%', width: '58%', aspectRatio: '8.5/11', zIndex: 1, transform: 'rotate(-6deg)', opacity: 0.85 }}
          name="A. Mendes" role="Product Designer"
          skills={['Figma', 'CSS', 'Design Systems']}
        />
        {/* back-1 */}
        <ResumeCard
          style={{ top: '1%', left: '33%', width: '64%', aspectRatio: '8.5/11', zIndex: 2, transform: 'rotate(5deg)', opacity: 0.95 }}
          name="M. Tanaka" role="Engineering Lead"
          experiences={[{ company: 'Linear', date: '2023 — Present', title: 'Staff Engineer' }]}
        />
        {/* front */}
        <ResumeCard
          style={{ top: '4%', left: '11%', width: '78%', aspectRatio: '8.5/11', zIndex: 3, transform: 'rotate(-1.2deg)' }}
          name="Sam Carter" role="Senior Frontend Engineer"
          contact={['sam@carter.dev', '+1 (415) 555 0117', 'sf · california']}
          experiences={[
            { company: 'Stripe', date: '2022 — Present', title: 'Senior Frontend Engineer', bullets: ['Led migration of Checkout to React 18, reducing TTI by 41%.', 'Owned design-system contributions across 14 product teams.'] },
            { company: 'Notion', date: '2019 — 2022', title: 'Frontend Engineer', bullets: ['Built the new database block, used by 6M+ daily users.'] },
          ]}
          skills={['TypeScript', 'React', 'Next.js', 'PostgreSQL', 'Spring Boot', 'Design Systems']}
        />
        {/* ATS chip */}
        <div style={{
          position: 'absolute', bottom: '8%', left: '-2%', zIndex: 5,
          background: C.bgElev, border: `1px solid ${C.line}`, borderRadius: 10,
          padding: '10px 12px', boxShadow: '0 8px 24px -12px rgba(10,10,10,.18)',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
        }}>
          <div style={{ fontFamily: fontMono, fontSize: 16, fontWeight: 600, color: C.success }}>98</div>
          <div>
            <div style={{ fontWeight: 500, color: C.ink }}>ATS Score</div>
            <div style={{ fontFamily: fontMono, fontSize: 10, color: C.muted }}>Passes 12 of 12 checks</div>
          </div>
        </div>
        {/* Sync chip */}
        <div style={{
          position: 'absolute', top: '6%', right: '-2%', zIndex: 5,
          background: C.bgElev, border: `1px solid ${C.line}`, borderRadius: 10,
          padding: '10px 12px', boxShadow: '0 8px 24px -12px rgba(10,10,10,.18)',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success, boxShadow: '0 0 0 3px rgba(22,163,74,.18)', display: 'inline-block' }} />
          <div style={{ fontFamily: fontMono, fontSize: 11, color: C.ink2 }}>Auto-saved · just now</div>
        </div>
      </div>
    </div>
  );
}

/* ── Mini resume thumb (template gallery) ───────────────────────────────── */
function MiniLine({ w = 'l' }: { w?: 's' | 'm' | 'l' }) {
  const widths = { s: '60%', m: '80%', l: '95%' };
  return <div style={{ height: 3, background: '#E5E5E0', borderRadius: 1, marginBottom: 3, width: widths[w] }} />;
}

function MiniSecH({ children }: { children: string }) {
  return (
    <div style={{ fontFamily: fontMono, fontSize: 6, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, borderBottom: `0.5px solid ${C.line}`, paddingBottom: 2, marginBottom: 4 }}>
      {children}
    </div>
  );
}

function TplClassic() {
  return (
    <div style={{ padding: 16, height: '100%', fontSize: 6.5, lineHeight: 1.4, color: C.ink2, fontFamily: font }}>
      <div style={{ textAlign: 'center', borderBottom: `0.5px solid ${C.line}`, paddingBottom: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '-0.02em' }}>SAM CARTER</div>
        <div style={{ fontFamily: fontMono, fontSize: 6, color: C.muted, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>sam@carter.dev · sf, ca</div>
      </div>
      <div style={{ marginTop: 10 }}>
        <MiniSecH>Experience</MiniSecH>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 600, fontSize: 7 }}>Stripe</span>
          <span style={{ fontFamily: fontMono, fontSize: 5.5, color: C.muted }}>2022 — Now</span>
        </div>
        <MiniLine /><MiniLine w="m" />
        <div style={{ height: 6 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 600, fontSize: 7 }}>Notion</span>
          <span style={{ fontFamily: fontMono, fontSize: 5.5, color: C.muted }}>2019 — 2022</span>
        </div>
        <MiniLine />
      </div>
      <div style={{ marginTop: 10 }}>
        <MiniSecH>Education</MiniSecH>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 600, fontSize: 7 }}>UC Berkeley</span>
          <span style={{ fontFamily: fontMono, fontSize: 5.5, color: C.muted }}>2015 — 2019</span>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <MiniSecH>Skills</MiniSecH>
        <MiniLine w="m" />
      </div>
    </div>
  );
}

function TplSidebar() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '32% 1fr', height: '100%' }}>
      <div style={{ background: '#0A0A0A', color: '#fff', padding: '14px 10px', fontSize: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 9, letterSpacing: '-0.02em', color: '#fff' }}>Sam<br />Carter</div>
        <div style={{ fontSize: 5, color: '#888', marginTop: 3 }}>Frontend Engineer</div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: fontMono, fontSize: 6, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', borderBottom: '0.5px solid #2a2a2a', paddingBottom: 2, marginBottom: 4 }}>Contact</div>
          <div style={{ height: 3, background: '#2a2a2a', borderRadius: 1, marginBottom: 3, width: '60%' }} />
          <div style={{ height: 3, background: '#2a2a2a', borderRadius: 1, marginBottom: 3, width: '80%' }} />
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontFamily: fontMono, fontSize: 6, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', borderBottom: '0.5px solid #2a2a2a', paddingBottom: 2, marginBottom: 4 }}>Skills</div>
          <div style={{ height: 3, background: '#2a2a2a', borderRadius: 1, marginBottom: 3, width: '95%' }} />
          <div style={{ height: 3, background: '#2a2a2a', borderRadius: 1, marginBottom: 3, width: '80%' }} />
          <div style={{ height: 3, background: '#2a2a2a', borderRadius: 1, marginBottom: 3, width: '60%' }} />
        </div>
      </div>
      <div style={{ padding: '14px 12px' }}>
        <div style={{ marginTop: 0 }}>
          <MiniSecH>Experience</MiniSecH>
          <div style={{ fontWeight: 600, fontSize: 7 }}>Stripe</div>
          <MiniLine /><MiniLine w="m" />
          <div style={{ height: 4 }} />
          <div style={{ fontWeight: 600, fontSize: 7 }}>Notion</div>
          <MiniLine />
        </div>
        <div style={{ marginTop: 10 }}>
          <MiniSecH>Education</MiniSecH>
          <MiniLine w="m" />
        </div>
      </div>
    </div>
  );
}

function TplModern() {
  return (
    <div style={{ padding: 16, height: '100%', fontSize: 6.5, lineHeight: 1.4, color: C.ink2, fontFamily: font }}>
      <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.03em' }}>Sam Carter.</div>
      <div style={{ height: 3, width: 32, background: C.accent, margin: '6px 0 8px' }} />
      <div style={{ fontFamily: fontMono, fontSize: 6, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Frontend Engineer · San Francisco</div>
      <div style={{ marginTop: 10 }}>
        <MiniSecH>Experience</MiniSecH>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 600, fontSize: 7 }}>Stripe</span>
          <span style={{ fontFamily: fontMono, fontSize: 5.5, color: C.muted }}>2022 — Now</span>
        </div>
        <MiniLine /><MiniLine w="m" />
        <div style={{ height: 6 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 600, fontSize: 7 }}>Notion</span>
          <span style={{ fontFamily: fontMono, fontSize: 5.5, color: C.muted }}>2019 — 2022</span>
        </div>
        <MiniLine /><MiniLine w="s" />
      </div>
      <div style={{ marginTop: 10 }}>
        <MiniSecH>Skills</MiniSecH>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {['React', 'TypeScript', 'Spring'].map(s => (
            <span key={s} style={{ fontSize: 5, padding: '1px 4px', border: `0.5px solid ${C.line}`, borderRadius: 2 }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TplSerif() {
  return (
    <div style={{ padding: 16, height: '100%', fontSize: 6.5, lineHeight: 1.4, color: C.ink2, fontFamily: '"Times New Roman", Georgia, serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '-0.02em' }}>Sam Carter</div>
        <div style={{ fontSize: 6, color: C.muted, fontStyle: 'italic' }}>Frontend Engineer</div>
        <div style={{ fontSize: 5.5, color: C.muted, marginTop: 2 }}>sam@carter.dev — +1 415 555 0117</div>
      </div>
      <div style={{ height: 0.5, background: C.ink, margin: '8px 0' }} />
      <div>
        <MiniSecH>Experience</MiniSecH>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 600, fontSize: 7, fontStyle: 'italic' }}>Stripe — San Francisco</span>
          <span style={{ fontFamily: fontMono, fontSize: 5.5, color: C.muted }}>2022 — Now</span>
        </div>
        <MiniLine /><MiniLine w="m" />
        <div style={{ height: 6 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontWeight: 600, fontSize: 7, fontStyle: 'italic' }}>Notion</span>
          <span style={{ fontFamily: fontMono, fontSize: 5.5, color: C.muted }}>2019 — 2022</span>
        </div>
        <MiniLine />
      </div>
      <div style={{ marginTop: 10 }}>
        <MiniSecH>Education</MiniSecH>
        <MiniLine w="m" />
      </div>
    </div>
  );
}

/* ── Feature icon wrapper ────────────────────────────────────────────────── */
function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8, background: C.bgSoft,
      border: `1px solid ${C.line}`, display: 'grid', placeItems: 'center', color: C.ink,
    }}>
      {children}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export function LandingPage() {
  const navigate = useNavigate();
  const goAuth = () => navigate('/auth');
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const root: React.CSSProperties = {
    fontFamily: font,
    background: C.bg,
    color: C.ink,
    minHeight: '100vh',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: '-0.005em',
  };

  return (
    <div style={root}>

      {/* ── NAV ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'saturate(150%) blur(12px)',
        WebkitBackdropFilter: 'saturate(150%) blur(12px)',
        background: 'color-mix(in oklab, #FBFBFA 78%, transparent)',
        borderBottom: `1px solid ${C.line2}`,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, letterSpacing: '-0.02em', fontSize: 16, cursor: 'pointer' }} onClick={goAuth}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: C.ink, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14 }}>R</div>
            <span>CV Builder</span>
          </div>
          {/* links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14, color: C.ink2 }}>
            {[['Features','features'],['Templates','templates'],['How it works','how'],['Built with','stack']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 14, color: C.ink2, padding: 0, transition: 'color .15s' }}
                onMouseOver={e => (e.currentTarget.style.color = C.ink)}
                onMouseOut={e => (e.currentTarget.style.color = C.ink2)}
              >{label}</button>
            ))}
          </nav>
          {/* actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BtnGhost onClick={goAuth}>Sign in</BtnGhost>
            <BtnPrimary onClick={goAuth}>Build Resume <Arr /></BtnPrimary>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '80px 0 40px', overflow: 'hidden' }}>
        {/* grid bg */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(to right, rgba(10,10,10,.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,.035) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 70%)',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 70%)',
        }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)', gap: 64, alignItems: 'center' }}>
          <div>
            {/* eyebrow pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '5px 10px 5px 5px', background: C.bgElev,
              border: `1px solid ${C.line}`, borderRadius: 999,
              fontSize: 12, color: C.muted, marginBottom: 24,
            }}>
              <span style={{ background: '#EAF0FF', color: C.accentInk, fontFamily: fontMono, fontSize: 11, padding: '2px 8px', borderRadius: 999, letterSpacing: '0.02em' }}>v2.4</span>
              Now with AI-assisted content suggestions
            </div>

            <h1 style={{ margin: 0, fontSize: 'clamp(40px, 6vw, 68px)', lineHeight: 1.02, letterSpacing: '-0.035em', fontWeight: 600, color: C.ink }}>
              A resume builder<br />
              recruiters <em style={{ fontStyle: 'normal', color: C.muted }}>actually</em><br />
              finish reading.
            </h1>

            <p style={{ margin: '24px 0 0', fontSize: 18, lineHeight: 1.55, color: C.muted, maxWidth: 520 }}>
              Draft, polish, and export a clean, ATS-ready resume in under ten minutes. Live preview as you type. No watermarks, no template lock-in.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 32, flexWrap: 'wrap' }}>
              <BtnPrimary onClick={goAuth} lg>Build Resume <Arr /></BtnPrimary>
              <BtnSecondary onClick={() => scrollTo('templates')} lg>View Templates</BtnSecondary>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 28, fontSize: 13, color: C.muted }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, boxShadow: '0 0 0 4px rgba(22,163,74,.12)', display: 'inline-block' }} />
              <span>Free forever · No card required</span>
              <span style={{ width: 1, height: 14, background: C.line, display: 'inline-block' }} />
              <span>Exports to PDF &amp; DOCX</span>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ padding: '56px 0 40px', textAlign: 'center' }}>
          <div style={{ fontFamily: fontMono, fontSize: 12, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 28 }}>
            Resumes built here have landed roles at
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 36, alignItems: 'center', opacity: 0.55 }}>
            {['Atlassian', 'Shopify', 'Datadog', 'Figma', 'Cloudflare'].map(name => (
              <div key={name} style={{ textAlign: 'center', fontWeight: 600, letterSpacing: '-0.02em', color: C.ink2, fontSize: 16 }}>{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '96px 0', borderTop: `1px solid ${C.line2}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          {/* section head */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'end', marginBottom: 56 }}>
            <div>
              <Eyebrow>Features</Eyebrow>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.03em', fontWeight: 600, lineHeight: 1.08, margin: '12px 0 0', maxWidth: '18ch' }}>
                Everything you need. Nothing you don't.
              </h2>
            </div>
            <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.55, maxWidth: '44ch' }}>
              A focused set of tools, built around the actual problem: getting a polished resume out the door without fighting the editor.
            </p>
          </div>

          {/* features grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: `1px solid ${C.line}`, borderRadius: 14, background: C.bgElev, overflow: 'hidden' }}>
            {/* large feature: live preview */}
            <div style={{ gridColumn: 'span 2', padding: 0, overflow: 'hidden', minHeight: 360, position: 'relative', background: 'linear-gradient(180deg, #FFFFFF 0%, #F9F9F6 100%)', borderRight: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
              <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '50%' }}>
                <FeatureIcon>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                </FeatureIcon>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>Live preview, always in view</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55 }}>Edit on the left, see the typeset PDF on the right. No "render" buttons, no surprises at export time.</div>
              </div>
              {/* floating mini resume */}
              <div style={{ position: 'absolute', right: -40, bottom: -40, width: '56%', aspectRatio: '1/1', borderRadius: 16, background: '#fff', border: `1px solid ${C.line}`, boxShadow: '0 30px 60px -30px rgba(10,10,10,.18)', overflow: 'hidden', transform: 'rotate(-3deg)' }}>
                <div style={{ padding: 16, fontSize: 6.5, lineHeight: 1.4, color: C.ink2, fontFamily: font }}>
                  <div style={{ fontWeight: 700, fontSize: 11, letterSpacing: '-0.02em' }}>Sam Carter</div>
                  <div style={{ fontFamily: fontMono, fontSize: 6, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Frontend Engineer</div>
                  <div style={{ marginTop: 10 }}>
                    <MiniSecH>Experience</MiniSecH>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, fontSize: 7 }}>Stripe</span>
                      <span style={{ fontFamily: fontMono, fontSize: 5.5, color: C.muted }}>2022 — Now</span>
                    </div>
                    <div style={{ height: 4 }} />
                    <MiniLine /><MiniLine w="m" />
                    <div style={{ height: 8 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, fontSize: 7 }}>Notion</span>
                      <span style={{ fontFamily: fontMono, fontSize: 5.5, color: C.muted }}>2019 — 2022</span>
                    </div>
                    <div style={{ height: 4 }} />
                    <MiniLine /><MiniLine w="s" />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <MiniSecH>Skills</MiniSecH>
                    <MiniLine w="m" /><MiniLine />
                  </div>
                </div>
              </div>
            </div>

            {/* small features */}
            {[
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 7 9 18l-5-5"/></svg>, title: 'ATS-friendly by default', desc: 'Every template is parsed and validated against the same systems recruiters use, so your file makes it past the filter.', col: 1, row: 1 },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>, title: 'Keyboard-first editing', desc: 'Reorder sections, duplicate roles, format bullets — all with shortcuts. Slash-commands open a quick action palette.', col: 1, row: 2 },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>, title: 'Pixel-true PDF export', desc: 'Font-embedded, vector PDF output. What you see on screen is exactly what lands in the recruiter\'s inbox.', col: 2, row: 1 },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, title: 'Twelve curated templates', desc: 'Switch layouts without redoing your content. Type, spacing, and rhythm tuned individually — not just recolored.', col: 2, row: 2 },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/></svg>, title: 'Tailored versions', desc: 'Keep one master profile. Spin up role-specific variants in seconds and track which one you sent where.', col: 3, row: 2 },
            ].map((f, i) => (
              <div key={f.title} style={{
                padding: 32, borderRight: i === 0 || i === 2 ? `1px solid ${C.line}` : 'none',
                borderBottom: i < 2 ? `1px solid ${C.line}` : 'none',
                background: C.bgElev, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 220,
              }}>
                <FeatureIcon>{f.icon}</FeatureIcon>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section id="templates" style={{ padding: '96px 0', borderTop: `1px solid ${C.line2}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'end', marginBottom: 56 }}>
            <div>
              <Eyebrow>Templates</Eyebrow>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.03em', fontWeight: 600, lineHeight: 1.08, margin: '12px 0 0', maxWidth: '18ch' }}>
                Twelve layouts. One source of truth.
              </h2>
            </div>
            <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.55, maxWidth: '44ch' }}>
              Change templates without rewriting a word. Each layout is hand-tuned — not just a coat of paint over the same grid.
            </p>
          </div>

          {/* tabs */}
          <div style={{ display: 'inline-flex', background: C.bgElev, border: `1px solid ${C.line}`, borderRadius: 999, padding: 4, gap: 2, marginBottom: 32 }}>
            {['All', 'Minimal', 'Technical', 'Executive', 'Creative'].map((tab, i) => (
              <button key={tab} style={{
                border: 0, padding: '6px 14px', borderRadius: 999, fontSize: 13, fontFamily: font,
                background: i === 0 ? C.ink : 'transparent',
                color: i === 0 ? '#fff' : C.muted, cursor: 'pointer',
              }}>{tab}</button>
            ))}
          </div>

          {/* template cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { component: <TplClassic />, name: 'Classic', tag: 'Minimal' },
              { component: <TplSidebar />, name: 'Aperture', tag: 'Technical' },
              { component: <TplModern />, name: 'Vector', tag: 'Modern' },
              { component: <TplSerif />, name: 'Bodoni', tag: 'Executive' },
            ].map(tpl => (
              <article key={tpl.name}
                style={{ background: C.bgElev, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'transform .15s ease, box-shadow .15s ease, border-color .15s ease' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = shadowLift; (e.currentTarget as HTMLElement).style.borderColor = '#D4D4CE'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = C.line; }}
                onClick={goAuth}
              >
                <div style={{ aspectRatio: '8.5/11', background: '#fff', borderBottom: `1px solid ${C.line2}`, position: 'relative', overflow: 'hidden' }}>
                  {tpl.component}
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em' }}>{tpl.name}</div>
                  <div style={{ fontFamily: fontMono, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tpl.tag}</div>
                </div>
              </article>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <BtnSecondary onClick={goAuth}>Browse all 12 templates <Arr /></BtnSecondary>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '96px 0', borderTop: `1px solid ${C.line2}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'end', marginBottom: 56 }}>
            <div>
              <Eyebrow>How it works</Eyebrow>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.03em', fontWeight: 600, lineHeight: 1.08, margin: '12px 0 0', maxWidth: '18ch' }}>
                From blank page to PDF in ten minutes.
              </h2>
            </div>
            <p style={{ color: C.muted, fontSize: 17, lineHeight: 1.55, maxWidth: '44ch' }}>
              Three steps. No onboarding wizard, no forced sign-up before you can see what you're building.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, border: `1px solid ${C.line}`, borderRadius: 14, background: C.bgElev, padding: 8 }}>
            {/* step 1 */}
            <div style={{ background: C.bgSoft, borderRadius: 10, padding: 28, minHeight: 240, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontFamily: fontMono, fontSize: 12, color: C.muted, letterSpacing: '0.04em' }}>01 / Draft</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 28 }}>Pick a layout, start typing.</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, marginTop: 8 }}>Start from a blank profile or paste an old resume — we'll parse it into structured fields automatically.</div>
              </div>
              <div style={{ marginTop: 'auto', height: 64, borderRadius: 8, background: '#fff', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, fontFamily: fontMono, fontSize: 11, color: C.muted }}>
                <span style={{ color: C.accent }}>›</span>
                Senior Frontend Engineer
                <span style={{ display: 'inline-block', width: 7, height: 14, background: C.accent, marginLeft: 2, animation: 'lp-blink 1s steps(2) infinite' }} />
              </div>
            </div>
            {/* step 2 */}
            <div style={{ background: C.bgSoft, borderRadius: 10, padding: 28, minHeight: 240, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontFamily: fontMono, fontSize: 12, color: C.muted, letterSpacing: '0.04em' }}>02 / Refine</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 28 }}>Polish with smart suggestions.</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, marginTop: 8 }}>Stronger verbs, missing metrics, gaps in dates — the editor flags them inline. Take the suggestion or skip it.</div>
              </div>
              <div style={{ marginTop: 'auto', height: 64, borderRadius: 8, background: '#fff', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, fontFamily: fontMono, fontSize: 11, color: C.muted }}>
                <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: 3, fontSize: 10 }}>→ add metric</span>
                <span>Led migration of Checkout…</span>
              </div>
            </div>
            {/* step 3 */}
            <div style={{ background: C.bgSoft, borderRadius: 10, padding: 28, minHeight: 240, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontFamily: fontMono, fontSize: 12, color: C.muted, letterSpacing: '0.04em' }}>03 / Export</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 28 }}>Send a file recruiters can parse.</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, marginTop: 8 }}>Download as PDF or DOCX, share a private link, or push directly to LinkedIn Easy Apply.</div>
              </div>
              <div style={{ marginTop: 'auto', height: 64, borderRadius: 8, background: '#fff', border: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, fontFamily: fontMono, fontSize: 11, color: C.muted }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: `1px solid ${C.line}`, padding: '3px 8px', borderRadius: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>
                  resume_sam_carter.pdf
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH ── */}
      <section id="stack" style={{ padding: '96px 0', borderTop: `1px solid ${C.line2}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ background: '#0A0A0A', color: '#fff', borderRadius: 20, padding: '72px 56px', position: 'relative', overflow: 'hidden' }}>
            {/* grid bg */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.04) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 30% 30%, black 30%, transparent 75%)',
              maskImage: 'radial-gradient(ellipse 70% 60% at 30% 30%, black 30%, transparent 75%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
              <div>
                <Eyebrow light>Engineering</Eyebrow>
                <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 38px)', letterSpacing: '-0.025em', fontWeight: 600, lineHeight: 1.1, margin: '12px 0 16px', color: '#fff' }}>
                  Boring, reliable tools.<br />That's the whole point.
                </h2>
                <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 16, lineHeight: 1.55, maxWidth: '44ch' }}>
                  CV Builder is built on a stack chosen for one reason: it stays up. Strict typing on the frontend, a hardened JVM backend, and a database you've actually heard of.
                </p>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 0 3px rgba(74,222,128,.18)', display: 'inline-block' }} />
                  <span style={{ fontFamily: fontMono }}>99.98% uptime · last 90 days</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { name: 'React', role: 'UI Layer' },
                  { name: 'TypeScript', role: 'Type Safety' },
                  { name: 'Spring Boot', role: 'API · Java' },
                  { name: 'PostgreSQL', role: 'Data Store' },
                ].map(t => (
                  <div key={t.name} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontFamily: fontMono, fontSize: 14, color: '#fff', letterSpacing: '-0.005em' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontFamily: fontMono, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ textAlign: 'center', padding: '120px 0', borderTop: `1px solid ${C.line2}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: '-0.03em', fontWeight: 600, lineHeight: 1.05, margin: '0 0 18px' }}>
            Your next resume,<br />in about ten minutes.
          </h2>
          <p style={{ fontSize: 17, color: C.muted, margin: '0 0 32px' }}>
            Free to start. No watermarks. Cancel anytime — but you probably won't need to.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <BtnPrimary onClick={goAuth} lg>Build Resume <Arr /></BtnPrimary>
            <BtnSecondary onClick={() => scrollTo('templates')} lg>View Templates</BtnSecondary>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${C.line2}`, padding: '64px 0 40px', background: C.bg }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, letterSpacing: '-0.02em', fontSize: 16, cursor: 'pointer' }} onClick={goAuth}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: C.ink, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 14 }}>R</div>
                <span>CV Builder</span>
              </div>
              <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.55, margin: '14px 0 0', maxWidth: '32ch' }}>
                A modern resume builder for engineers, designers, and the recruiters who read their work.
              </p>
            </div>
            {[
              { heading: 'Product', links: ['Builder', 'Templates', 'Examples', 'Pricing', 'Changelog'] },
              { heading: 'Resources', links: ['Resume Guide', 'ATS Tips', 'Cover Letters', 'Career Blog'] },
              { heading: 'Company', links: ['About', 'Privacy', 'Terms', 'Contact'] },
            ].map(col => (
              <div key={col.heading}>
                <h4 style={{ fontSize: 12, fontFamily: fontMono, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, margin: '0 0 14px', fontWeight: 500 }}>{col.heading}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(link => (
                    <li key={link}>
                      <button onClick={goAuth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, fontSize: 14, color: C.ink2, padding: 0, transition: 'color .15s' }}
                        onMouseOver={e => (e.currentTarget.style.color = C.ink)}
                        onMouseOut={e => (e.currentTarget.style.color = C.ink2)}
                      >{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: `1px solid ${C.line2}`, color: C.muted, fontSize: 13, gap: 16, flexWrap: 'wrap' }}>
            <div>© 2026 CV Builder. All rights reserved.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, boxShadow: '0 0 0 3px rgba(22,163,74,.15)', display: 'inline-block' }} />
              <span style={{ fontFamily: fontMono }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
