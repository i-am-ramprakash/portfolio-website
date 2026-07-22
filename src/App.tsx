import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Skills from './components/Skills/Skills';
import Experience from './components/Experience/Experience';
import Projects from './components/Projects/Projects';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import CommandPalette from './components/CommandPalette/CommandPalette';
import ProjectModal from './components/Projects/ProjectModal';
import IntroSequence from './components/IntroSequence/IntroSequence';
import type { Project } from './types';

const Enhanced3DBackground = lazy(() => import('./components/ThreeBackground/Enhanced3DBackground'));
const zones = ['hero', 'about', 'skills', 'experience', 'projects', 'quest', 'contact'];

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [activeZone, setActiveZone] = useState('hero');
  const [visited, setVisited] = useState(() => new Set(['hero']));
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [recruiterMode, setRecruiterMode] = useState(() => sessionStorage.getItem('recruiter-mode') === 'true');
  const [motionEnabled, setMotionEnabled] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('devverse-intro'));

  const finishIntro = useCallback(() => {
    sessionStorage.setItem('devverse-intro', 'seen');
    setShowIntro(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('recruiter-mode', recruiterMode);
    sessionStorage.setItem('recruiter-mode', String(recruiterMode));
  }, [recruiterMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('motion-off', !motionEnabled);
  }, [motionEnabled]);

  useEffect(() => {
    const elements = zones.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(entries => {
      const current = entries.find(entry => entry.isIntersecting);
      if (!current) return;
      setActiveZone(current.target.id);
      setVisited(previous => new Set(previous).add(current.target.id));
    }, { rootMargin: '-32% 0px -58%' });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
      if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !typing)) {
        event.preventDefault();
        setIsCmdOpen(open => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const progress = useMemo(() => Math.round((visited.size / zones.length) * 100), [visited]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#about">Skip to main content</a>
      {showIntro && <IntroSequence onComplete={finishIntro} motionEnabled={motionEnabled} />}
      <div className="noise" aria-hidden="true" />
      {motionEnabled && !recruiterMode && (
        <Suspense fallback={null}><Enhanced3DBackground isDark={isDark} /></Suspense>
      )}
      <Header
        activeZone={activeZone}
        progress={progress}
        isDark={isDark}
        toggleTheme={toggleTheme}
        recruiterMode={recruiterMode}
        toggleRecruiter={() => setRecruiterMode(value => !value)}
        motionEnabled={motionEnabled}
        toggleMotion={() => setMotionEnabled(value => !value)}
        onOpenCommandPalette={() => setIsCmdOpen(true)}
      />
      <main>
        <Hero onOpenCommandPalette={() => setIsCmdOpen(true)} />
        <About />
        <Skills />
        <Experience />
        <Projects onInspectProject={setSelectedProject} />
        <section id="quest" className="quest section-pad content-section" aria-labelledby="quest-title">
          <div className="section-kicker"><span>06</span> CURRENT QUEST — NOW</div>
          <div className="quest-panel">
            <div><span className="mono">ACTIVE OBJECTIVE</span><h2 id="quest-title">Deeper backend architecture.<br /><em>Sharper product engineering.</em></h2></div>
            <p>Currently advancing the systems thinking behind resilient Java services while continuing to build polished, interactive full-stack products end to end.</p>
          </div>
        </section>
        <Contact />
      </main>
      <Footer progress={progress} />
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} isDark={isDark} toggleTheme={toggleTheme} onSelectProject={setSelectedProject} recruiterMode={recruiterMode} toggleRecruiter={() => setRecruiterMode(value => !value)} />
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}

export default App;
