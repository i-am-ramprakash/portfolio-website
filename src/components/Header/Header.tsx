import { useEffect, useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';

interface HeaderProps { isDark: boolean; toggleTheme: () => void; }

const items = ['about', 'skills', 'experience', 'projects', 'contact'];

export default function Header({ isDark, toggleTheme }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('hero');
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const sections = ['hero', ...items].map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: '-35% 0px -55%' });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setOpen(false); };

  return (
    <header className={`nav-wrap ${scrolled ? 'nav-scrolled' : ''}`}>
      <nav className="nav-panel" aria-label="Primary navigation">
        <button className="brand" onClick={() => go('hero')} aria-label="Back to top">
          <span className="brand-cube"><i>R</i><i>S</i></span>
          <span><b>RAM</b><small>FULL-STACK DEVELOPER</small></span>
        </button>
        <div className={`nav-links ${open ? 'nav-open' : ''}`}>
          {items.map((item, index) => <button key={item} className={active === item ? 'active' : ''} aria-current={active === item ? 'location' : undefined} onClick={() => go(item)}><span>0{index + 1}</span>{item}</button>)}
        </div>
        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle color theme">{isDark ? <Sun /> : <Moon />}</button>
          <button className="icon-btn menu-btn" onClick={() => setOpen(v => !v)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </nav>
    </header>
  );
}
