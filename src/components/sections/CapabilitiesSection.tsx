import { ArrowUpRight, Braces, Database, Radio } from "lucide-react";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

const capabilities = [
  {
    icon: Database,
    title: "Backend engineering",
    subtitle: "Reliable services and data workflows",
    copy: "Secure REST APIs, Spring Boot applications, persistence layers, authentication, role-aware systems, and maintainable service boundaries.",
    skills: ["Java", "Spring Boot", "REST APIs", "Hibernate/JPA", "PostgreSQL", "RBAC"],
  },
  {
    icon: Braces,
    title: "Frontend & product UI",
    subtitle: "Responsive interfaces built around real tasks",
    copy: "Typed React experiences, Angular applications, dashboards, design systems, and accessible interfaces that remain clear under real product complexity.",
    skills: ["React", "TypeScript", "Angular", "Tailwind CSS", "Responsive UI", "Accessibility"],
  },
  {
    icon: Radio,
    title: "Interactive products",
    subtitle: "Real-time, mobile, and playful systems",
    copy: "Android shells, Canvas game engines, WebRTC communication, synchronized multiplayer, and interaction systems that make products feel alive.",
    skills: ["Kotlin", "Jetpack Compose", "WebRTC", "Canvas", "Firebase", "Gamification"],
  },
];

interface CapabilitiesSectionProps {
  reducedMotion: boolean;
}

const CapabilitiesSection = ({ reducedMotion }: CapabilitiesSectionProps) => (
  <section
    id="capabilities"
    className="content-section capabilities-section narrative-section"
    data-narrative-effect="capabilities"
    data-character-side="left"
    aria-labelledby="capabilities-title"
  >
    <SectionHeading
      id="capabilities-title"
      number="02"
      eyebrow="Capabilities"
      title="How I turn ideas"
      accent="into products."
      description="Engineering capabilities that cover the service layer, the interface, and the interactions between them."
      reducedMotion={reducedMotion}
    />
    <div className="capability-grid" data-character-anchor>
      {capabilities.map((capability, index) => {
        const Icon = capability.icon;
        return (
          <Reveal
            className="capability-card"
            key={capability.title}
            delay={index * 90}
            reducedMotion={reducedMotion}
          >
            <div className="card-topline">
              <span>0{index + 1}</span>
              <Icon aria-hidden="true" />
            </div>
            <h3>{capability.title}</h3>
            <b>{capability.subtitle}</b>
            <p>{capability.copy}</p>
            <ul className="skill-list" aria-label={`${capability.title} skills`}>
              {capability.skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
            <ArrowUpRight className="card-corner" aria-hidden="true" />
          </Reveal>
        );
      })}
    </div>
  </section>
);

export default CapabilitiesSection;
