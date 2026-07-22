import { useState } from 'react';
import { ArrowDownRight, Github, Linkedin, Mail, Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const [activeTab, setActiveTab] = useState<'featured' | 'stack' | 'bio'>('featured');

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="hero section-pad">
      <div className="hero-copy">
        <motion.div 
          className="eyebrow" 
          initial={{ opacity: 0, y: 14 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="live-dot" /> 
          Full-Stack Developer @ Mentor Friends <span>• Kathmandu / Remote</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 24 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.08 }}
        >
          Full-Stack &<br />
          <span>Systems Engineer.</span>
        </motion.h1>

        <motion.p 
          className="hero-lead" 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.16 }}
        >
          Crafting high-performance Android games, CEFR-aligned Goethe exam platforms, and zero-knowledge encrypted web applications.
        </motion.p>

        <motion.div 
          className="hero-cta" 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.24 }}
        >
          <button className="primary-btn" onClick={() => scrollTo('projects')}>
            Explore Selected Works <ArrowDownRight />
          </button>
          <button className="secondary-btn" onClick={() => scrollTo('contact')}>
            <Mail /> Get in Touch
          </button>
        </motion.div>

        <div className="hero-socials">
          <span>CONNECT</span>
          <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer" aria-label="GitHub">
            <Github />
          </a>
          <a href="https://www.linkedin.com/in/ramprakash-sah-b368a5179/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <Linkedin />
          </a>
          <a href="mailto:ramprakash777.sah@gmail.com" aria-label="Email">
            <Mail />
          </a>
        </div>
      </div>

      {/* Interactive Hero Terminal */}
      <motion.div 
        className="hero-terminal"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot-red" />
            <span className="dot-yellow" />
            <span className="dot-green" />
          </div>
          <div className="terminal-title">
            <TerminalIcon style={{ width: 12, height: 12, display: 'inline', marginRight: 6 }} /> 
            ramprakash@dev-station:~
          </div>
          <div style={{ width: 40 }} />
        </div>

        <div className="terminal-tabs">
          <button 
            className={`terminal-tab ${activeTab === 'featured' ? 'active' : ''}`}
            onClick={() => setActiveTab('featured')}
          >
            <Sparkles style={{ width: 11, height: 11 }} /> ~/featured.sh
          </button>
          <button 
            className={`terminal-tab ${activeTab === 'stack' ? 'active' : ''}`}
            onClick={() => setActiveTab('stack')}
          >
            ~/stack.json
          </button>
          <button 
            className={`terminal-tab ${activeTab === 'bio' ? 'active' : ''}`}
            onClick={() => setActiveTab('bio')}
          >
            ~/bio.txt
          </button>
        </div>

        <div className="terminal-body">
          {activeTab === 'featured' && (
            <div>
              <p><span className="terminal-prompt">$</span> ./launch_showcase.sh --all</p>
              <p className="terminal-comment"># Active flagship engineering deployments</p>
              <p><span className="terminal-highlight">[01] MuTu LDR App</span> — <span className="terminal-string">WebRTC + Firebase + E2E Crypto + Gemini AI</span></p>
              <p><span className="terminal-highlight">[02] Space Ludo</span> — <span className="terminal-string">Android Compose Shell + HTML5 Canvas Engine</span></p>
              <p><span className="terminal-highlight">[03] DeutschSpaß</span> — <span className="terminal-string">Goethe Exam Prep + Spaced Repetition (SRS)</span></p>
              <p className="terminal-comment"># All systems operational. 6 production projects built.</p>
            </div>
          )}

          {activeTab === 'stack' && (
            <div>
              <p><span className="terminal-prompt">$</span> cat ~/tech-stack.json</p>
              <pre className="terminal-json">
{`{
  "frontend": ["React", "TypeScript", "Tailwind", "Vite", "Zustand"],
  "mobile": ["Kotlin", "Jetpack Compose", "Android SDK"],
  "backend": ["Node.js", "Express", "Spring Boot", "Python"],
  "cloud_db": ["Firebase", "Supabase", "PostgreSQL", "MongoDB"],
  "ai_crypto": ["Google Gemini AI", "WebRTC", "AES-256"]
}`}
              </pre>
            </div>
          )}

          {activeTab === 'bio' && (
            <div>
              <p><span className="terminal-prompt">$</span> cat ~/bio.txt</p>
              <p style={{ marginTop: 8 }}>
                Engineer with 3+ years experience spanning enterprise banking systems (TCS), multi-vendor platforms (Mentor Friends), and custom mobile/web products.
              </p>
              <p style={{ marginTop: 8, color: 'var(--accent)' }}>
                Focus: Clean Service Boundaries, Performant Web/Mobile UIs, & Practical AI Integrations.
              </p>
            </div>
          )}
        </div>

        <div className="terminal-actions">
          <button className="terminal-btn" onClick={() => setActiveTab('featured')}>sh featured.sh</button>
          <button className="terminal-btn" onClick={() => setActiveTab('stack')}>cat stack.json</button>
          <button className="terminal-btn" onClick={() => setActiveTab('bio')}>cat bio.txt</button>
        </div>
      </motion.div>
    </section>
  );
}
