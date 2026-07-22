import { ArrowUpRight, Code2, Layers3, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const strengths = [
  { icon: Code2, title: 'Build', text: 'Production-grade frontends and dependable backend systems.' },
  { icon: Layers3, title: 'Design', text: 'Clear interfaces shaped around real people and real goals.' },
  { icon: Lightbulb, title: 'Solve', text: 'From ambiguous problem to a tested, maintainable product.' },
];

export default function About() {
  return <section id="about" className="content-section section-pad">
    <div className="section-kicker"><span>01</span> ABOUT / PROFILE</div>
    <div className="about-grid">
      <div>
        <h2>Curiosity in.<br/><em>Clarity out.</em></h2>
        <a className="inline-link" href="mailto:ramprakash777.sah@gmail.com">Let’s build something useful <ArrowUpRight /></a>
      </div>
      <div className="about-copy">
        <p className="large-copy">I’m Ramprakash Sah—a multidisciplinary developer who enjoys the difficult middle ground between engineering, design, and business.</p>
        <p>Over 3+ years, I’ve worked across enterprise banking software, multi-vendor marketplaces, machine learning, and secure distributed systems. I care about thoughtful details, clean architecture, and shipping work that performs as beautifully as it looks.</p>
      </div>
    </div>
    <div className="strength-grid">
      {strengths.map(({icon: Icon, title, text}, i) => <motion.article className="depth-card" key={title} whileHover={{ y: -8, rotateX: 3, rotateY: i === 1 ? 2 : -2 }}>
        <span className="card-index">0{i + 1}</span><Icon/><h3>{title}</h3><p>{text}</p>
      </motion.article>)}
    </div>
  </section>;
}
