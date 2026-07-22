import { lazy, Suspense, useEffect, useState } from 'react';
import { useTheme } from './hooks/useTheme';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Skills from './components/Skills/Skills';
import Experience from './components/Experience/Experience';
import Projects from './components/Projects/Projects';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';

const Enhanced3DBackground = lazy(() => import('./components/ThreeBackground/Enhanced3DBackground'));

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (window.scrollY / height) * 100 : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => setShow3D(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#about">Skip to main content</a>
      <div className="scroll-progress" style={{ width: `${progress}%` }} />
      <div className="noise" aria-hidden="true" />
      {show3D && <Suspense fallback={null}><Enhanced3DBackground isDark={isDark} /></Suspense>}
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
