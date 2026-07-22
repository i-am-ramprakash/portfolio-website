import { useState } from 'react';
import { ArrowUpRight, Check, Github, Share2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../../data/portfolio';
import { Project } from '../../types';

type CategoryFilter = 'all' | 'web' | 'mobile-games' | 'ai-security';

interface ProjectsProps {
  onInspectProject: (project: Project) => void;
}

export default function Projects({ onInspectProject }: ProjectsProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [shared, setShared] = useState<string | null>(null);

  const share = async (id: string, title: string) => {
    const data = { 
      title, 
      text: `Check out ${title} by Ramprakash Sah`, 
      url: `${window.location.origin}${window.location.pathname}#projects` 
    };
    try {
      if (navigator.share) await navigator.share(data);
      else { 
        await navigator.clipboard.writeText(data.url); 
        setShared(id); 
        window.setTimeout(() => setShared(null), 2200); 
      }
    } catch { 
      /* Native share sheet dismissal */ 
    }
  };

  const getProjectCategory = (id: string): CategoryFilter[] => {
    switch (id) {
      case '1': return ['ai-security'];
      case '2': return ['ai-security', 'web'];
      case '3': return ['web'];
      case '4': return ['mobile-games'];
      case '5': return ['web'];
      case '6': return ['web', 'ai-security'];
      default: return ['web'];
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    return getProjectCategory(p.id).includes(filter);
  });

  return (
    <section id="projects" className="content-section section-pad projects-section">
      <div className="section-kicker">
        <span>04</span> SELECTED / WORK
      </div>

      <div className="section-heading">
        <h2>
          Featured projects.<br />
          <em>Engineered for real impact.</em>
        </h2>
        <p>
          Click any project card to inspect detailed architectural diagrams, tech stack specs, and key deliverables.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Projects ({projects.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'web' ? 'active' : ''}`}
          onClick={() => setFilter('web')}
        >
          Full-Stack Web (4)
        </button>
        <button 
          className={`filter-btn ${filter === 'mobile-games' ? 'active' : ''}`}
          onClick={() => setFilter('mobile-games')}
        >
          Mobile & Games (1)
        </button>
        <button 
          className={`filter-btn ${filter === 'ai-security' ? 'active' : ''}`}
          onClick={() => setFilter('ai-security')}
        >
          AI & Security (3)
        </button>
      </div>

      <motion.div className="project-stack" layout>
        <AnimatePresence>
          {filteredProjects.map((project, index) => (
            <motion.article 
              className="project-card" 
              key={project.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="project-visual" 
                onClick={() => onInspectProject(project)}
                style={{ cursor: 'pointer' }}
                title="Click to inspect architecture"
              >
                <img 
                  src={project.image} 
                  alt={project.title} 
                  width="1536" 
                  height="1024" 
                  loading="lazy" 
                  decoding="async" 
                />
                <b>0{index + 1}</b>
                <span>CASE STUDY / {project.technologies[0].toUpperCase()}</span>
                <div className="visual-inspect-badge">
                  <Maximize2 style={{ width: 14 }} /> Click to Inspect
                </div>
              </div>

              <div className="project-info">
                <div className="project-title">
                  <span>{project.status.toUpperCase()}</span>
                  <h3 onClick={() => onInspectProject(project)} style={{ cursor: 'pointer' }}>
                    {project.title}
                  </h3>
                </div>

                <div className="project-meta">
                  <span>ROLE:</span>
                  <b>{project.role}</b>
                </div>

                <p>{project.description}</p>

                <div className="project-outcome">
                  <span>KEY OUTCOME</span>
                  {project.outcome}
                </div>

                <div className="tags">
                  {project.technologies.map(tech => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>

                <div className="project-actions">
                  <button 
                    className="primary-btn" 
                    onClick={() => onInspectProject(project)}
                    style={{ padding: '0 16px', height: 42, fontSize: 12 }}
                  >
                    <Maximize2 style={{ width: 14 }} /> Inspect Details
                  </button>

                  <a href={project.link} target="_blank" rel="noreferrer">
                    <Github /> Code <ArrowUpRight />
                  </a>

                  <button 
                    onClick={() => share(project.id, project.title)} 
                    aria-label={`Share ${project.title}`}
                  >
                    {shared === project.id ? <Check /> : <Share2 />}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      <p className="sr-only" aria-live="polite">
        {shared ? 'Project link copied to clipboard.' : ''}
      </p>
    </section>
  );
}
