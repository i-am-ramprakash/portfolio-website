import { useState } from 'react';
import { X, Github, ArrowUpRight, Check, Share2, Layers, Cpu, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../../types';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'features'>('overview');
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const handleShare = async () => {
    const data = {
      title: project.title,
      text: `Take a look at ${project.title} by Ramprakash Sah`,
      url: project.link || window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* Dismissed native share */
    }
  };

  return (
    <AnimatePresence>
      <div className="project-modal-backdrop" onClick={onClose}>
        <motion.div
          className="project-modal-dialog"
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 30 }}
          transition={{ duration: 0.25 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-title-group">
              <span className="mono" style={{ color: 'var(--accent)', fontSize: '11px' }}>
                PROJECT INSPECTOR / {project.status.toUpperCase()}
              </span>
              <h2>{project.title}</h2>
            </div>
            <button className="close-btn" onClick={onClose} aria-label="Close modal">
              <X />
            </button>
          </div>

          {/* Modal Image Banner */}
          <div className="modal-banner">
            <img src={project.image} alt={project.title} />
            <div className="modal-banner-overlay" />
          </div>

          {/* Modal Tabs */}
          <div className="modal-tabs">
            <button
              className={`modal-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Layers style={{ width: 14 }} /> Overview & Outcome
            </button>
            <button
              className={`modal-tab ${activeTab === 'architecture' ? 'active' : ''}`}
              onClick={() => setActiveTab('architecture')}
            >
              <Cpu style={{ width: 14 }} /> Architecture & Tech
            </button>
            <button
              className={`modal-tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              <CheckCircle2 style={{ width: 14 }} /> Key Deliverables
            </button>
          </div>

          {/* Modal Content */}
          <div className="modal-body">
            {activeTab === 'overview' && (
              <div>
                <p className="modal-lead">{project.description}</p>
                
                <div className="modal-outcome-box">
                  <b>KEY OUTCOME</b>
                  <p>{project.outcome}</p>
                </div>

                <div className="modal-meta-grid">
                  <div>
                    <span>ROLE</span>
                    <b>{project.role}</b>
                  </div>
                  <div>
                    <span>STATUS</span>
                    <b>{project.status}</b>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'architecture' && (
              <div>
                <h4 style={{ margin: '0 0 12px' }}>Technologies & Stack Layers</h4>
                <div className="tags" style={{ marginBottom: 20 }}>
                  {project.technologies.map(t => (
                    <span key={t} style={{ fontSize: 11, padding: '6px 12px' }}>
                      {t}
                    </span>
                  ))}
                </div>

                <div className="modal-architecture-box">
                  <span className="mono" style={{ color: 'var(--accent)', fontSize: 10 }}>
                    ENGINEERING HIGHLIGHTS
                  </span>
                  <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.7 }}>
                    Engineered with clean architectural separation, robust error boundaries, optimized responsive rendering, and comprehensive performance checks.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div>
                <ul className="modal-feature-list">
                  <li>Production-ready code architecture with strict type definitions.</li>
                  <li>Responsive cross-device layouts with high-contrast UI feedback.</li>
                  <li>Integrated security and persistence workflows tailored to user needs.</li>
                  <li>Comprehensive documentation and automated build scripts.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer">
            <a className="primary-btn" href={project.link} target="_blank" rel="noreferrer">
              <Github /> View Code Repository <ArrowUpRight />
            </a>
            <button className="secondary-btn" onClick={handleShare}>
              {copied ? <Check style={{ color: 'var(--accent)' }} /> : <Share2 />} 
              {copied ? 'Link Copied!' : 'Share Project'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
