import { useState } from 'react';
import { ArrowUpRight, Check, Github, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { projects } from '../../data/portfolio';

export default function Projects() {
  const [shared, setShared] = useState<string | null>(null);
  const share = async (id: string, title: string) => {
    const data = { title, text: `Take a look at ${title} by Ramprakash Sah`, url: `${window.location.origin}${window.location.pathname}#projects` };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); setShared(id); window.setTimeout(() => setShared(null), 2200); }
    } catch { /* The native share sheet can be dismissed intentionally. */ }
  };
  return <section id="projects" className="content-section section-pad projects-section">
    <div className="section-kicker"><span>04</span> SELECTED / WORK</div>
    <div className="section-heading"><h2>Selected systems.<br/><em>Real-world problems.</em></h2><p>A focused collection of work across artificial intelligence, security, cloud, and enterprise platforms.</p></div>
    <div className="project-stack">
      {projects.map((project, index) => <motion.article className="project-card" key={project.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }}>
        <div className="project-visual"><img src={project.image} alt="" width="1536" height="1024" loading="lazy" decoding="async"/><div className="visual-grid"/><b>0{index + 1}</b><span>CASE STUDY / {project.technologies[0].toUpperCase()}</span></div>
        <div className="project-info">
          <div className="project-title"><span>{project.status.toUpperCase()}</span><h3>{project.title}</h3></div>
          <div className="project-meta"><span>ROLE</span><b>{project.role}</b></div>
          <p>{project.description}</p><p className="project-outcome"><span>OUTCOME</span>{project.outcome}</p>
          <div className="tags">{project.technologies.map(tech => <span key={tech}>{tech}</span>)}</div>
          <div className="project-actions"><a href={project.link} target="_blank" rel="noreferrer"><Github/> View repository <ArrowUpRight/></a><button onClick={() => share(project.id, project.title)} aria-label={`Share ${project.title}`}>{shared === project.id ? <Check/> : <Share2/>}</button></div>
        </div>
      </motion.article>)}
    </div><p className="sr-only" aria-live="polite">{shared ? 'Project link copied to clipboard.' : ''}</p>
  </section>;
}
