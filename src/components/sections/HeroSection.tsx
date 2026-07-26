import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "../ui/Reveal";

interface HeroSectionProps {
  reducedMotion: boolean;
  onNavigate: (id: string) => void;
}

const HeroSection = ({ reducedMotion, onNavigate }: HeroSectionProps) => (
  <section
    id="home"
    className="hero-section narrative-section"
    data-narrative-effect="hero"
    data-character-side="center"
    aria-labelledby="hero-title"
  >
    <div className="hero-grid">
      <Reveal className="hero-copy" reducedMotion={reducedMotion}>
        <p className="status-line">
          <i aria-hidden="true" /> Full-Stack Developer · Kathmandu, Nepal
        </p>
        <h1
          id="hero-title"
          aria-label="Engineering reliable systems and clear products."
        >
          <span className="split-heading-visual" aria-hidden="true">
            {["Engineering", "reliable", "systems", "and"].map((word, index) => (
              <span data-narrative-word key={`${word}-${index}`}>{word}</span>
            ))}
            <em className="tilted-card-text" data-narrative-word>clear products.</em>
          </span>
        </h1>
        <p className="hero-summary">
          I&apos;m Ramprakash Sah, a full-stack systems engineer connecting robust Java and
          Spring Boot foundations with thoughtful React and TypeScript experiences.
        </p>
        <div className="hero-actions">
          <button className="button button-primary glass-button" type="button" onClick={() => onNavigate("work")}>
            View selected work <ArrowRight />
          </button>
          <button className="button button-secondary glass-button" type="button" onClick={() => onNavigate("contact")}>
            Start a conversation
          </button>
        </div>
      </Reveal>

      <div
        className="mobile-character-slot mobile-character-slot-hero"
        data-mobile-character-anchor
        aria-hidden="true"
      />

      <Reveal className="hero-aside" delay={120} reducedMotion={reducedMotion}>
        <span>What I bring</span>
        <ul>
          <li><b>01</b> Enterprise backend engineering</li>
          <li><b>02</b> Product-focused frontend systems</li>
          <li><b>03</b> Interactive and real-time products</li>
        </ul>
        <div className="hero-socials">
          <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight />
          </a>
          <a
            href="https://np.linkedin.com/in/ramprakash-sah-b368a5179"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn <ArrowUpRight />
          </a>
        </div>
      </Reveal>
    </div>
  </section>
);

export default HeroSection;
