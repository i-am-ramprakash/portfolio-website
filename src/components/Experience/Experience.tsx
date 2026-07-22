import { useState } from 'react';
import { Briefcase, MapPin, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { experiences } from '../../data/portfolio';

export default function Experience() {
  const [expandedId, setExpandedId] = useState<string | null>(experiences[experiences.length - 1]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <section id="experience" className="content-section section-pad">
      <div className="section-kicker">
        <span>03</span> CAREER / EXPERIENCE
      </div>

      <div className="section-heading">
        <h2>
          Where I’ve<br />
          <em>made an impact.</em>
        </h2>
        <p>
          Click any role to expand key deliverables, architectural contributions, and technologies used.
        </p>
      </div>

      <div className="timeline">
        {experiences.slice().reverse().map((job, index) => {
          const isExpanded = expandedId === job.id;
          return (
            <article className="timeline-item" key={job.id}>
              <div className="timeline-marker">
                <Briefcase />
              </div>
              
              <div className="timeline-meta">
                <span>{job.period}</span>
                <small><MapPin /> {job.location}</small>
              </div>

              <div 
                className={`timeline-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleExpand(job.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="timeline-card-header">
                  <div>
                    <span className="mono" style={{ color: 'var(--accent)', fontSize: '10px' }}>
                      ROLE / 0{index + 1}
                    </span>
                    <h3>{job.title}</h3>
                    <h4>{job.company}</h4>
                  </div>
                  <button className="expand-btn" aria-label="Toggle details">
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="timeline-accordion-body"
                    >
                      <div className="timeline-deliverables-title">
                        <Layers style={{ width: 13, marginRight: 6 }} /> Deliverables & Impact
                      </div>
                      <ul>
                        {job.responsibilities.map(item => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
