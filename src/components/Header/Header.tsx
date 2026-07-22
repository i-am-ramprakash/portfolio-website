import { useState } from 'react';
import { Activity, Menu, Moon, Search, Sparkles, Sun, X } from 'lucide-react';

interface HeaderProps {
  activeZone: string;
  progress: number;
  isDark: boolean;
  toggleTheme: () => void;
  recruiterMode: boolean;
  toggleRecruiter: () => void;
  motionEnabled: boolean;
  toggleMotion: () => void;
  onOpenCommandPalette: () => void;
}

const items = [
  ['about', 'Profile', 'About'], ['skills', 'Skill Tree', 'Skills'], ['experience', 'Missions', 'Experience'],
  ['projects', 'Worlds', 'Projects'], ['quest', 'Quest', 'Now'], ['contact', 'Portal', 'Contact'],
];

export default function Header(props: HeaderProps) {
  const [open, setOpen] = useState(false);
  const go = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: props.motionEnabled ? 'smooth' : 'auto' }); setOpen(false); };
  const activeLabel = items.find(item => item[0] === props.activeZone)?.[1] ?? 'Command Center';
  return (
    <header className="hud-wrap">
      <nav className="hud" aria-label="Primary navigation">
        <button className="brand" onClick={() => go('hero')} aria-label="Command Center — Home">
          <span className="brand-mark"><span>RS</span></span>
          <span><b>RAM'S DEVVERSE</b><small>FULL-STACK SYSTEM ONLINE</small></span>
        </button>
        <div className={`zone-nav ${open ? 'nav-open' : ''}`}>
          {items.map(([id, game, conventional], index) => <button key={id} className={props.activeZone === id ? 'active' : ''} onClick={() => go(id)} aria-current={props.activeZone === id ? 'location' : undefined}><span>0{index + 1}</span><b>{props.recruiterMode ? conventional : game}</b><small>{conventional}</small></button>)}
        </div>
        <div className="hud-actions">
          <button className={`recruiter-toggle ${props.recruiterMode ? 'active' : ''}`} onClick={props.toggleRecruiter}><Activity /> <span>Recruiter</span></button>
          <button className="icon-btn command-button" onClick={props.onOpenCommandPalette} aria-label="Open command palette"><Search /><kbd>⌘K</kbd></button>
          <button className="icon-btn desktop-control" onClick={props.toggleMotion} aria-label={`${props.motionEnabled ? 'Disable' : 'Enable'} motion`}><Sparkles className={props.motionEnabled ? '' : 'muted-icon'} /></button>
          <button className="icon-btn desktop-control" onClick={props.toggleTheme} aria-label="Toggle color theme">{props.isDark ? <Sun /> : <Moon />}</button>
          <button className="icon-btn menu-btn" onClick={() => setOpen(value => !value)} aria-label="Toggle navigation" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </nav>
      <div className="hud-status"><span>ZONE // {activeLabel.toUpperCase()}</span><div><i style={{ width: `${props.progress}%` }} /></div><span>{props.progress}% EXPLORED</span></div>
    </header>
  );
}
