import { ArrowDownRight, Github, Linkedin, Mail, MousePointer2 } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function Hero() {
  const rx = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });
  const move = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - .5) * 16);
    rx.set(-((e.clientY - r.top) / r.height - .5) * 16);
  };
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <section id="hero" className="hero section-pad" onMouseMove={move}>
      <div className="hero-copy">
        <motion.div className="eyebrow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}><span className="live-dot" /> Available for ambitious projects <span>• Kathmandu / Remote</span></motion.div>
        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}>
          I engineer<br/><span>digital worlds.</span>
        </motion.h1>
        <motion.p className="hero-lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}>
          Full-stack developer and product-minded designer turning complex ideas into fast, intuitive, high-impact experiences.
        </motion.p>
        <motion.div className="hero-cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28 }}>
          <button className="primary-btn" onClick={() => go('projects')}>Explore my work <ArrowDownRight /></button>
          <button className="text-btn" onClick={() => go('contact')}>Start a conversation</button>
        </motion.div>
        <div className="hero-socials">
          <span>CONNECT</span>
          <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer" aria-label="GitHub"><Github /></a>
          <a href="https://www.linkedin.com/in/ramprakash-sah-b368a5179/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin /></a>
          <a href="mailto:ramprakash777.sah@gmail.com" aria-label="Email"><Mail /></a>
        </div>
      </div>
      <motion.div className="hero-object" style={{ rotateX: rx, rotateY: ry }}>
        <div className="orbit orbit-a"><i /><i /><i /></div>
        <div className="orbit orbit-b"><i /><i /></div>
        <div className="core-cube">
          <div className="cube-face front"><span>&lt;RS /&gt;</span></div><div className="cube-face back" />
          <div className="cube-face right" /><div className="cube-face left" /><div className="cube-face top" /><div className="cube-face bottom" />
        </div>
        <div className="float-label label-one"><span>03</span> PRODUCTION PROJECTS</div>
        <div className="float-label label-two"><span>3+</span> YEARS EXPERIENCE</div>
      </motion.div>
      <div className="scroll-cue"><MousePointer2 /> SCROLL TO ENTER</div>
    </section>
  );
}
