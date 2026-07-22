import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, Github, Maximize2, Share2 } from 'lucide-react';
import { projects } from '../../data/portfolio';
import type { Project } from '../../types';

type Filter = 'all' | 'web' | 'interactive' | 'research';
const category = (id: string): Filter => id === '4' ? 'interactive' : ['1', '2'].includes(id) ? 'research' : 'web';

export default function Projects({ onInspectProject }: { onInspectProject: (project: Project) => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [shared, setShared] = useState<string | null>(null);
  const filtered = useMemo(() => projects.filter(project => filter === 'all' || category(project.id) === filter), [filter]);
  const share = async (project: Project) => { const url = `${location.origin}${location.pathname}#projects`; try { if (navigator.share) await navigator.share({ title: project.title, text: `Explore ${project.title} by Ramprakash Sah`, url }); else { await navigator.clipboard.writeText(url); setShared(project.id); window.setTimeout(() => setShared(null), 1800); } } catch { /* native share dismissed */ } };
  return <section id="projects" className="content-section section-pad" aria-labelledby="projects-title">
    <div className="section-kicker"><span>04</span> PROJECT WORLDS — SELECTED WORK</div>
    <div className="section-heading project-heading"><div><h2 id="projects-title">Choose a world.<br /><em>Inspect the build.</em></h2><p>Six real projects spanning learning, games, secure communication, enterprise Java and applied research.</p></div><div className="world-count"><b>{String(projects.length).padStart(2, '0')}</b><span>WORLDS<br />DISCOVERABLE</span></div></div>
    <div className="filter-bar" aria-label="Project filters">{([['all', 'All worlds'], ['web', 'Web platforms'], ['interactive', 'Games + mobile'], ['research', 'Research + security']] as const).map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div>
    <div className="world-grid-list">{filtered.map((project, index) => <article className={`world-card world-${project.id}`} key={project.id}>
      <button className="world-visual" onClick={() => onInspectProject(project)} aria-label={`Open case study for ${project.title}`}><img src={project.image} alt="" loading="lazy" decoding="async" /><span className="world-number">WORLD {String(index + 1).padStart(2, '0')}</span><span className="world-open"><Maximize2 /> INSPECT</span></button>
      <div className="world-info"><span className="world-status"><i /> {project.status}</span><h3>{project.title}</h3><p>{project.description}</p><div className="world-outcome"><span>MISSION RESULT</span>{project.outcome}</div><div className="tags">{project.technologies.slice(0, 5).map(tech => <span key={tech}>{tech}</span>)}</div><div className="project-actions"><button className="primary-btn" onClick={() => onInspectProject(project)}>Open case study <ArrowUpRight /></button>{project.link && <a href={project.link} target="_blank" rel="noreferrer"><Github /> Source</a>}<button onClick={() => share(project)} aria-label={`Share ${project.title}`}>{shared === project.id ? <Check /> : <Share2 />}</button></div></div>
    </article>)}</div><p className="sr-only" aria-live="polite">{shared ? 'Project link copied.' : ''}</p>
  </section>;
}
