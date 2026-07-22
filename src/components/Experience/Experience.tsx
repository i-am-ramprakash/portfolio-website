import { Briefcase, MapPin } from 'lucide-react';
import { experiences } from '../../data/portfolio';

export default function Experience() {
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
          Experience across enterprise software engineering and high-velocity product development.
        </p>
      </div>

      <div className="timeline">
        {experiences.slice().reverse().map((job, index) => (
          <article className="timeline-item" key={job.id}>
            <div className="timeline-marker">
              <Briefcase />
            </div>
            <div className="timeline-meta">
              <span>{job.period}</span>
              <small><MapPin /> {job.location}</small>
            </div>
            <div className="timeline-card">
              <div>
                <span className="mono" style={{ color: 'var(--accent)', fontSize: '10px' }}>
                  ROLE / 0{index + 1}
                </span>
                <h3>{job.title}</h3>
                <h4>{job.company}</h4>
              </div>
              <ul>
                {job.responsibilities.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
