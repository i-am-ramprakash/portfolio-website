import { Briefcase, MapPin } from 'lucide-react';
import { experiences } from '../../data/portfolio';

export default function Experience() {
  return <section id="experience" className="content-section section-pad" aria-labelledby="experience-title">
    <div className="section-kicker"><span>03</span> MISSION HISTORY — EXPERIENCE</div>
    <div className="section-heading"><h2 id="experience-title">Professional missions.<br /><em>Production context.</em></h2><p>Enterprise engineering and full-stack product work, presented without fictional metrics or confidential client details.</p></div>
    <div className="mission-line">{experiences.slice().reverse().map((job, index) => <article className="mission-card" key={job.id}>
      <div className="mission-index"><span>MISSION 0{index + 1}</span><i>{index === 0 ? 'ACTIVE' : 'COMPLETE'}</i></div>
      <div className="mission-heading"><div className="mission-icon"><Briefcase /></div><div><h3>{job.title}</h3><b>{job.company}</b><small><MapPin /> {job.location} · {job.period}</small></div></div>
      <div className="mission-objective"><span>MISSION OBJECTIVE</span><p>{job.objective}</p></div>
      <ul>{job.responsibilities.map(item => <li key={item}>{item}</li>)}</ul>
      <div className="tags">{job.technologies.map(tech => <span key={tech}>{tech}</span>)}</div>
    </article>)}</div>
  </section>;
}
