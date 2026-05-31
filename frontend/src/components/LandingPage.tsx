import { useNavigate } from 'react-router-dom';

/* ─── small reusable pieces ─────────────────────────────────────────────── */

function Label({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-4">
      {children}
    </p>
  );
}

function DarkButton({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 bg-[#111111] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#333] transition-colors"
    >
      {children}
    </button>
  );
}

function OutlineButton({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 border border-[#d1d5db] text-[#111111] text-sm font-semibold px-5 py-2.5 rounded-full hover:border-[#111111] transition-colors bg-white"
    >
      {children}
    </button>
  );
}

/* ─── Hero mockup ────────────────────────────────────────────────────────── */

function HeroMockup() {
  return (
    <div className="relative flex justify-center">
      {/* browser chrome */}
      <div className="w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* title bar */}
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-white rounded text-[10px] text-gray-400 text-center px-2 py-0.5 border border-gray-200">
            cvbuilder.app/cv/preview
          </div>
        </div>

        {/* CV content */}
        <div className="p-5 font-serif">
          <div className="text-center border-b border-gray-100 pb-4 mb-4">
            <div className="text-base font-bold text-gray-900">Sam Carter</div>
            <div className="text-[11px] text-gray-500 mt-0.5">sam@openai.com · github.com/samcarter</div>
          </div>

          <SectionBlock title="EXPERIENCE">
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="text-[11px] font-bold text-gray-800">OpenAI</span>
              <span className="text-[9px] text-gray-400">2022 – Present</span>
            </div>
            <div className="text-[10px] text-gray-500 italic mb-1">Senior Software Engineer</div>
            <div className="text-[10px] text-gray-600 leading-relaxed">• Led infrastructure team scaling to 100M+ users</div>
            <div className="text-[10px] text-gray-600 leading-relaxed">• Reduced latency by 40% via distributed caching</div>
          </SectionBlock>

          <SectionBlock title="EDUCATION">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] font-bold text-gray-800">MIT</span>
              <span className="text-[9px] text-gray-400">2022</span>
            </div>
            <div className="text-[10px] text-gray-500 italic">B.Sc. Computer Science</div>
          </SectionBlock>

          <SectionBlock title="SKILLS">
            <div className="text-[10px] text-gray-600">Python · Go · Kubernetes · AWS · PostgreSQL</div>
          </SectionBlock>
        </div>
      </div>

      {/* ATS badge */}
      <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2">
        <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wide">ATS Score</div>
          <div className="text-sm font-black text-gray-900 leading-none">98 / 100</div>
        </div>
      </div>

      {/* saved badge */}
      <div className="absolute -top-3 -right-3 bg-white rounded-lg shadow-md border border-gray-100 px-3 py-1.5 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        <span className="text-[10px] font-semibold text-gray-600">Auto-saved</span>
      </div>
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[9px] font-black tracking-[0.2em] text-gray-400 border-b border-gray-100 pb-0.5 mb-1.5">{title}</div>
      {children}
    </div>
  );
}

/* ─── Template mini-previews ─────────────────────────────────────────────── */

function TemplateMini({ name, type, dark }: { name: string; type: 'classic' | 'modern' | 'ats' | 'pro'; dark?: boolean }) {
  const bg = dark ? 'bg-[#111111]' : 'bg-white';
  const line = dark ? 'bg-white/20' : 'bg-gray-200';
  const lineDark = dark ? 'bg-white/40' : 'bg-gray-400';

  return (
    <div className="flex-1 min-w-[140px]">
      <div className={`${bg} border border-gray-200 rounded-lg p-3 h-44 overflow-hidden shadow-sm`}>
        {type === 'classic' && (
          <div className="space-y-1.5">
            <div className={`${lineDark} h-2 w-3/4 rounded`} />
            <div className={`${line} h-1.5 w-1/2 rounded`} />
            <div className="mt-2 space-y-1">
              <div className={`${line} h-1 w-full rounded`} />
              <div className={`${line} h-1 w-5/6 rounded`} />
              <div className={`${line} h-1 w-full rounded`} />
            </div>
            <div className="mt-1.5 space-y-1">
              <div className={`${line} h-1 w-3/4 rounded`} />
              <div className={`${line} h-1 w-5/6 rounded`} />
            </div>
          </div>
        )}
        {type === 'modern' && (
          <div className="flex gap-2">
            <div className="w-12 bg-gray-800 rounded h-full flex-shrink-0 space-y-2 p-1.5">
              <div className="w-6 h-6 rounded-full bg-white/30 mx-auto" />
              <div className="h-1 bg-white/20 rounded" />
              <div className="h-1 bg-white/20 rounded" />
              <div className="h-1 bg-white/20 rounded w-2/3" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2 bg-gray-800 w-3/4 rounded" />
              <div className="h-1 bg-gray-200 w-full rounded" />
              <div className="h-1 bg-gray-200 w-5/6 rounded" />
              <div className="h-1 bg-gray-200 w-full rounded" />
            </div>
          </div>
        )}
        {type === 'ats' && (
          <div className="space-y-1">
            <div className="h-2 bg-gray-900 w-1/2 rounded" />
            <div className="h-1 bg-gray-300 w-2/3 rounded" />
            <div className="mt-1.5 h-px bg-gray-200" />
            <div className="h-1.5 bg-gray-700 w-1/3 rounded mt-1" />
            <div className="space-y-0.5 mt-0.5">
              <div className="h-1 bg-gray-200 w-full rounded" />
              <div className="h-1 bg-gray-200 w-5/6 rounded" />
              <div className="h-1 bg-gray-200 w-full rounded" />
            </div>
            <div className="h-1.5 bg-gray-700 w-1/4 rounded mt-1" />
            <div className="h-1 bg-gray-200 w-4/5 rounded" />
          </div>
        )}
        {type === 'pro' && (
          <div className="space-y-1.5">
            <div className="text-center">
              <div className="h-2 bg-gray-900 w-2/3 rounded mx-auto" />
              <div className="h-1 bg-gray-300 w-1/2 rounded mx-auto mt-0.5" />
            </div>
            <div className="h-px bg-red-800/40" />
            <div className="h-1.5 bg-red-800 w-1/4 rounded" />
            <div className="space-y-0.5">
              <div className="h-1 bg-gray-200 w-full rounded" />
              <div className="h-1 bg-gray-200 w-5/6 rounded" />
            </div>
            <div className="h-1.5 bg-red-800 w-1/3 rounded" />
            <div className="h-1 bg-gray-200 w-3/4 rounded" />
          </div>
        )}
      </div>
      <div className="mt-2">
        <div className="text-[11px] font-semibold text-gray-800">{name}</div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */

export function LandingPage() {
  const navigate = useNavigate();
  const goAuth = () => navigate('/auth');

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#111111] rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-black italic">B.</span>
            </div>
            <span className="font-black text-sm tracking-tight">CV Builder</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-gray-500">
            <a href="#features" className="hover:text-[#111] transition-colors">Features</a>
            <a href="#templates" className="hover:text-[#111] transition-colors">Templates</a>
            <a href="#how-it-works" className="hover:text-[#111] transition-colors">How it works</a>
            <a href="#built-with" className="hover:text-[#111] transition-colors">Built with</a>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={goAuth} className="text-[13px] font-medium text-gray-500 hover:text-[#111] transition-colors">
              Sign in
            </button>
            <DarkButton onClick={goAuth}>Build CV →</DarkButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-[11px] font-semibold text-gray-500 mb-8">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            AI-powered content suggestions
          </div>

          <h1 className="text-[52px] font-black leading-[1.05] tracking-tight mb-6">
            A CV builder recruiters{' '}
            <span className="italic font-black text-gray-400">actually</span>{' '}
            finish reading.
          </h1>

          <p className="text-[17px] text-gray-500 leading-relaxed mb-8 max-w-md">
            Draft, polish, and export a clean, ATS-ready CV in under ten minutes.
            Live preview as you type. No watermarks, no template lock-in.
          </p>

          <div className="flex items-center gap-3 mb-5">
            <DarkButton onClick={goAuth}>Build Your CV →</DarkButton>
            <OutlineButton onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}>
              View Templates
            </OutlineButton>
          </div>

          <p className="text-[12px] text-gray-400">
            Free to start · No card required · Exports to PDF
          </p>
        </div>

        <div className="flex justify-center">
          <HeroMockup />
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="border-y border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-300 text-center mb-7">
            CVs built here have landed roles at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {['Atlassian', 'Shopify', 'Datadog', 'Figma', 'Cloudflare'].map(name => (
              <span key={name} className="text-[15px] font-semibold text-gray-300 tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          <div>
            <Label>Features</Label>
            <h2 className="text-[38px] font-black leading-tight tracking-tight">
              Everything you need.<br />Nothing you don't.
            </h2>
          </div>
          <div className="flex items-end">
            <p className="text-[15px] text-gray-500 leading-relaxed">
              A focused set of tools built around the actual problem: getting a
              polished CV out the door without fighting the editor.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: '◧',
              title: 'Live preview, always in view',
              desc: 'Edit on the left, see the typeset PDF on the right. No "render" buttons, no surprises at export time.',
            },
            {
              icon: '✓',
              title: 'ATS-friendly by default',
              desc: 'Every template is parsed against the same systems recruiters use, so your file makes it past the filter.',
            },
            {
              icon: '⌨',
              title: 'Keyboard-first editing',
              desc: 'Reorder sections, duplicate roles, format bullets — all with shortcuts. Quick action palette included.',
            },
            {
              icon: '⬡',
              title: 'Pixel-true PDF export',
              desc: 'Font-embedded, vector PDF output. What you see on-screen is exactly what lands in the recruiter\'s inbox.',
            },
            {
              icon: '▣',
              title: 'Four curated templates',
              desc: 'Switch layouts without retyping content. Each template is hand-tuned — not just a coat of paint over the same grid.',
            },
            {
              icon: '⊕',
              title: 'Tailored versions',
              desc: 'Keep one master profile. Spin up role-specific variants in seconds and track which one you sent where.',
            },
          ].map(f => (
            <div key={f.title} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
              <div className="text-xl mb-4 text-gray-400">{f.icon}</div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section id="templates" className="max-w-6xl mx-auto px-6 py-24 border-t border-gray-100">
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div>
            <Label>Templates</Label>
            <h2 className="text-[38px] font-black leading-tight tracking-tight">
              Four layouts.<br />One source of truth.
            </h2>
          </div>
          <div className="flex items-end">
            <p className="text-[15px] text-gray-500 leading-relaxed">
              Change templates without rewriting a word. Each layout is
              hand-tuned — not just a coat of paint over the same grid.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
          {['All', 'Minimal', 'Technical', 'Executive'].map((tab, i) => (
            <button
              key={tab}
              className={`text-[12px] font-semibold px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                i === 0
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          <TemplateMini name="Classic" type="classic" />
          <TemplateMini name="Modern" type="modern" dark />
          <TemplateMini name="ATS" type="ats" />
          <TemplateMini name="Pro" type="pro" />
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={goAuth}
            className="text-[13px] font-semibold text-gray-500 hover:text-[#111] transition-colors inline-flex items-center gap-1"
          >
            Browse all templates →
          </button>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 border-t border-gray-100">
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          <div>
            <Label>How it works</Label>
            <h2 className="text-[38px] font-black leading-tight tracking-tight">
              From blank page to PDF<br />in ten minutes.
            </h2>
          </div>
          <div className="flex items-end">
            <p className="text-[15px] text-gray-500 leading-relaxed">
              Three steps. No onboarding wizard, no forced sign-up before
              you can see what you're building.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              num: '#1 / DRAFT',
              color: 'text-blue-500',
              title: 'Pick a layout, start typing.',
              desc: 'Start from a base profile or paste an old resume — we\'ll parse it into structured fields automatically.',
            },
            {
              num: '#2 / REFINE',
              color: 'text-amber-500',
              title: 'Polish with smart suggestions.',
              desc: 'Stronger verbs, missing metrics, gaps to close — the editor flags them inline. Take the suggestion or skip it.',
            },
            {
              num: '#3 / EXPORT',
              color: 'text-gray-400',
              title: 'Send a file recruiters can parse.',
              desc: 'Download as PDF, share a private link, or push directly to your applications.',
            },
          ].map(step => (
            <div key={step.num} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className={`text-[11px] font-black tracking-widest uppercase mb-4 ${step.color}`}>{step.num}</div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-2 leading-snug">{step.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section id="built-with" className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-[#111111] rounded-3xl p-12 text-white">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <Label>Built with</Label>
              <h2 className="text-[34px] font-black leading-tight tracking-tight text-white mb-4">
                Boring, reliable tools.<br />That's the whole point.
              </h2>
              <p className="text-[14px] text-gray-400 leading-relaxed mb-6">
                CV Builder is built on a stack chosen for one reason: it stays up.
                Direct typing on the frontend, a hardened JVM backend, and a
                database you've actually heard of.
              </p>
              <div className="flex items-center gap-2 text-[12px] text-gray-500">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                99.9% uptime · Last 30 days
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'React', label: 'UI Library' },
                { name: 'TypeScript', label: 'Type Safety' },
                { name: 'Spring Boot', label: 'API Server' },
                { name: 'PostgreSQL', label: 'Data Store' },
              ].map(tech => (
                <div key={tech.name} className="border border-white/10 rounded-xl p-4">
                  <div className="text-[15px] font-bold text-white mb-0.5">{tech.name}</div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">{tech.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="max-w-6xl mx-auto px-6 py-28 text-center">
        <h2 className="text-[52px] font-black leading-tight tracking-tight mb-4">
          Your next CV,<br />in about ten minutes.
        </h2>
        <p className="text-[16px] text-gray-400 mb-10">
          Free to start. No watermarks. Cancel anytime — but you probably won't need to.
        </p>
        <div className="flex items-center justify-center gap-3">
          <DarkButton onClick={goAuth}>Build Your CV →</DarkButton>
          <OutlineButton onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}>
            View Templates
          </OutlineButton>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#111111] rounded flex items-center justify-center">
                <span className="text-white text-[10px] font-black italic">B.</span>
              </div>
              <span className="font-black text-sm tracking-tight">CV Builder</span>
            </div>
            <p className="text-[13px] text-gray-400 leading-relaxed max-w-[220px]">
              A resume builder for engineers and designers who read their tools.
            </p>
          </div>

          {[
            {
              heading: 'Product',
              links: ['Builder', 'Templates', 'Examples', 'Pricing', 'Changelog'],
            },
            {
              heading: 'Resources',
              links: ['Resume Guide', 'ATS Tips', 'Cover Letters', 'Career Blog'],
            },
            {
              heading: 'Company',
              links: ['About', 'Privacy', 'Terms', 'Contact'],
            },
          ].map(col => (
            <div key={col.heading}>
              <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">{col.heading}</div>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <button onClick={goAuth} className="text-[13px] text-gray-500 hover:text-[#111] transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <p className="text-[12px] text-gray-400">© 2025 CV Builder. All rights reserved.</p>
            <p className="text-[12px] text-gray-400">Built with ♥ using Spring Boot & React</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
