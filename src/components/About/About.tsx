import { ArrowUpRight, Cpu, ShieldCheck, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="content-section section-pad">
      <div className="section-kicker">
        <span>01</span> ABOUT / PROFILE
      </div>
      
      <div className="section-heading">
        <h2>
          Engineering with purpose.<br />
          <em>Building for impact.</em>
        </h2>
        <p>
          I bridge full-stack web engineering, native Android development, and intelligent cloud systems to deliver scalable digital products.
        </p>
      </div>

      <div className="bento-grid">
        {/* Main Bio Card */}
        <motion.div 
          className="bento-card bento-card-main"
          whileHover={{ translateY: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3>Full-Stack Developer & Product Architect</h3>
          <p style={{ fontSize: '15px', color: 'var(--ink)', marginBottom: '16px', lineHeight: 1.6 }}>
            I’m Ramprakash Sah—a software engineer dedicated to building fast, maintainable, and highly secure digital applications.
          </p>
          <p>
            With experience spanning enterprise banking software at Tata Consultancy Services (TCS) and multi-vendor web platforms at Mentor Friends, I specialize in taking products from architectural concepts to production deployment.
          </p>
          <div style={{ marginTop: '24px' }}>
            <a className="secondary-btn" href="mailto:ramprakash777.sah@gmail.com" style={{ display: 'inline-flex' }}>
              Let’s discuss your project <ArrowUpRight style={{ width: 15 }} />
            </a>
          </div>
        </motion.div>

        {/* Stat Metrics Card */}
        <motion.div 
          className="bento-card bento-card-stat"
          whileHover={{ translateY: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3>Production Proof</h3>
          <p>Proven execution across enterprise, mobile, and web applications.</p>
          
          <div className="metrics-row">
            <div className="metric-box">
              <b>06</b>
              <small>Projects</small>
            </div>
            <div className="metric-box">
              <b>3+</b>
              <small>Years Exp</small>
            </div>
            <div className="metric-box">
              <b>02</b>
              <small>Companies</small>
            </div>
          </div>
        </motion.div>

        {/* Pillar 1 */}
        <motion.div 
          className="bento-card bento-card-pillar"
          whileHover={{ translateY: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bento-icon"><Cpu style={{ width: 20, height: 20 }} /></div>
          <h3>System Architecture</h3>
          <p>
            Designing clean service boundaries, RESTful APIs, Spring Boot backends, and robust database layers.
          </p>
        </motion.div>

        {/* Pillar 2 */}
        <motion.div 
          className="bento-card bento-card-pillar"
          whileHover={{ translateY: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bento-icon"><Smartphone style={{ width: 20, height: 20 }} /></div>
          <h3>Frontend & Native Mobile</h3>
          <p>
            Crafting responsive React applications, Kotlin Jetpack Compose interfaces, and HTML5 Canvas game engines.
          </p>
        </motion.div>

        {/* Pillar 3 */}
        <motion.div 
          className="bento-card bento-card-pillar"
          whileHover={{ translateY: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bento-icon"><ShieldCheck style={{ width: 20, height: 20 }} /></div>
          <h3>AI & Security</h3>
          <p>
            Integrating Google Gemini AI models, WebRTC live streams, and zero-knowledge AES-256 client encryption.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
