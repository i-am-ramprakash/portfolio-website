import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Cpu, Github, Layers3, X } from 'lucide-react';
import type { Project } from '../../types';

export default function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'architecture' | 'features'>('overview');
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!project) return; setTab('overview'); const previous = document.activeElement as HTMLElement; document.body.style.overflow = 'hidden'; closeRef.current?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', onKey); return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); previous?.focus(); }; }, [project, onClose]);
  if (!project) return null;
  return <div className="project-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="project-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="case-title">
      <header className="modal-header"><div><span className="mono">PROJECT WORLD // {project.status.toUpperCase()}</span><h2 id="case-title">{project.title}</h2></div><button ref={closeRef} className="close-btn" onClick={onClose} aria-label="Close case study"><X /></button></header>
      <div className="modal-banner"><img src={project.image} alt={`Project artwork for ${project.title}`} /><div /></div>
      <div className="modal-tabs" role="tablist">{([['overview', Layers3, 'Overview'], ['architecture', Cpu, 'Architecture'], ['features', CheckCircle2, 'Features']] as const).map(([value, Icon, label]) => <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}><Icon /> {label}</button>)}</div>
      <div className="modal-body">{tab === 'overview' && <><p className="modal-lead">{project.description}</p><div className="case-grid"><div><span>PROBLEM / CHALLENGE</span><p>{project.challenge}</p></div><div><span>MY ROLE</span><p>{project.role}</p></div><div className="wide"><span>RESULT</span><p>{project.outcome}</p></div></div></>}{tab === 'architecture' && <><div className="architecture-flow"><span>INTERFACE</span><i>→</i><span>SERVICES</span><i>→</i><span>DATA / STATE</span></div><p className="modal-lead">{project.architecture}</p><div className="tags">{project.technologies.map(tech => <span key={tech}>{tech}</span>)}</div></>}{tab === 'features' && <ul className="feature-list">{project.features.map(feature => <li key={feature}><CheckCircle2 /> {feature}</li>)}</ul>}</div>
      <footer className="modal-footer">{project.link && <a className="primary-btn" href={project.link} target="_blank" rel="noreferrer"><Github /> View source <ArrowUpRight /></a>}<button className="secondary-btn" onClick={onClose}>Return to worlds</button></footer>
    </section>
  </div>;
}
