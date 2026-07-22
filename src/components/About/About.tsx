import { Braces, Layers3, ServerCog, ShieldCheck } from 'lucide-react';

const stats = [['ROLE', 'Full-Stack Developer'], ['PRIMARY CLASS', 'Java + React Engineer'], ['BACKEND', 'Spring Boot + REST APIs'], ['FRONTEND', 'React + TypeScript + Angular'], ['PRODUCT FOCUS', 'Scalable interactive applications'], ['STYLE', 'Product-minded + end-to-end']];

export default function About() {
  return <section id="about" className="content-section section-pad" aria-labelledby="about-title">
    <div className="section-kicker"><span>01</span> PLAYER PROFILE — ABOUT</div>
    <div className="section-heading"><h2 id="about-title">A product engineer with<br /><em>full-stack range.</em></h2><p>Approximately three years across enterprise applications, marketplace systems, dashboards, APIs and interactive products.</p></div>
    <div className="profile-grid">
      <article className="profile-card profile-bio"><div className="profile-id"><span>RS</span><div><b>RAMPRAKASH SAH</b><small>PLAYER ID // FS-0323</small></div></div><p>I design and ship maintainable digital products across the stack. My experience spans enterprise banking software at TCS, multi-vendor platform development at Mentor Friends, and independent mobile, learning and security-focused products.</p><p>My best work connects dependable service architecture with interfaces that make complex workflows feel direct and approachable.</p></article>
      <div className="profile-stats" aria-label="Professional profile attributes">{stats.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
      <article className="profile-pillar"><ServerCog /><h3>Backend systems</h3><p>Java services, Spring Boot APIs, persistence and database-backed workflows.</p></article>
      <article className="profile-pillar"><Braces /><h3>Frontend products</h3><p>Typed component systems, responsive dashboards and accessible interfaces.</p></article>
      <article className="profile-pillar"><Layers3 /><h3>End-to-end ownership</h3><p>From requirements and architecture through implementation, testing and delivery.</p></article>
      <article className="profile-pillar"><ShieldCheck /><h3>Role-aware platforms</h3><p>Authentication, permissions, secure workflows and multi-user product design.</p></article>
    </div>
  </section>;
}
