import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

interface AboutSectionProps {
  reducedMotion: boolean;
}

const AboutSection = ({ reducedMotion }: AboutSectionProps) => (
  <section
    id="about"
    className="content-section about-section narrative-section"
    data-narrative-effect="about"
    data-character-side="right"
    aria-labelledby="about-title"
  >
    <SectionHeading
      id="about-title"
      number="01"
      eyebrow="About"
      title="Complex systems,"
      accent="made clear."
      description="A pragmatic engineering approach grounded in reliability, usability, and real product needs."
      reducedMotion={reducedMotion}
    />
    <div className="mobile-character-slot" data-mobile-character-anchor aria-hidden="true" />
    <div className="about-grid" data-character-anchor>
      <Reveal className="about-lead" delay={70} reducedMotion={reducedMotion}>
        <h3>I build across the full product stack.</h3>
      </Reveal>
      <Reveal className="about-story" delay={140} reducedMotion={reducedMotion}>
        <p>
          I&apos;m Ramprakash Sah, a full-stack systems engineer with experience across
          enterprise banking software, multi-vendor platforms, Android products, real-time
          communication, and interactive applications.
        </p>
        <p>
          My work connects robust Java and Spring Boot foundations with thoughtful React and
          TypeScript interfaces—because reliable engineering and good experience design belong
          together.
        </p>
      </Reveal>
    </div>
    <div className="fact-grid" data-character-anchor>
      {[
        ["Based in", "Kathmandu, Nepal"],
        ["Currently", "Full-Stack Developer"],
        ["Focus", "Product engineering"],
      ].map(([label, value], index) => (
        <Reveal key={label} className="fact-card" delay={180 + index * 70} reducedMotion={reducedMotion}>
          <span>{label}</span>
          <b>{value}</b>
        </Reveal>
      ))}
    </div>
  </section>
);

export default AboutSection;
