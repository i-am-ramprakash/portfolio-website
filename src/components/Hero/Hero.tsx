import { ArrowDown, ArrowUpRight, Briefcase, Github, Linkedin, Mail, Radio, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return <section id="hero" className="hero section-pad" aria-labelledby="hero-title">
    <div className="hero-copy">
      <motion.div className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><span className="live-dot" /> AVAILABLE FOR SELECT ROLES <span>// KATHMANDU + REMOTE</span></motion.div>
      <motion.p className="hero-code" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>PLAYER_01 / RAMPRAKASH SAH</motion.p>
      <motion.h1 id="hero-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>Backend strength.<br /><span>Immersive interfaces.</span></motion.h1>
      <motion.p className="hero-role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .12 }}>FULL-STACK DEVELOPER — JAVA · SPRING BOOT · REACT · TYPESCRIPT</motion.p>
      <motion.p className="hero-lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }}>I build scalable products where robust backend engineering meets polished, interactive frontend experiences—from enterprise services and role-aware platforms to gamified web products.</motion.p>
      <motion.div className="hero-cta" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>
        <button className="primary-btn" onClick={() => go('projects')}>Enter project worlds <ArrowUpRight /></button>
        <button className="secondary-btn" onClick={() => go('experience')}><Briefcase /> Explore experience</button>
      </motion.div>
      <div className="hero-links"><a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer"><Github /> GitHub</a><a href="https://www.linkedin.com/in/ramprakash-sah-b368a5179/" target="_blank" rel="noreferrer"><Linkedin /> LinkedIn</a><a href="mailto:ramprakash777.sah@gmail.com?subject=Resume%20request"><Mail /> Request résumé</a><button onClick={onOpenCommandPalette}><Search /> Command palette</button></div>
    </div>
    <motion.div className="hero-world" initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .16 }} aria-label="Abstract developer core visualization">
      <div className="world-grid" aria-hidden="true" />
      <div className="orbit orbit-one" aria-hidden="true"><i>JAVA</i><i>REACT</i></div><div className="orbit orbit-two" aria-hidden="true"><i>API</i><i>TS</i></div>
      <div className="core"><span>RS</span><small>FULL STACK<br />CORE</small></div>
      <div className="world-panel panel-top"><Radio /><span>SYSTEM STATUS</span><b>OPERATIONAL</b></div>
      <div className="world-panel panel-bottom"><span>PRIMARY CLASS</span><b>JAVA + REACT ENGINEER</b></div>
      <div className="coordinate">27.7172° N / DEVVERSE NODE</div>
    </motion.div>
    <button className="journey" onClick={() => go('about')}>BEGIN JOURNEY <ArrowDown /></button>
  </section>;
}
