import { Code2 } from "lucide-react";
import { digitalSkills } from "../../data/portfolio";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

interface ToolkitSectionProps {
  reducedMotion: boolean;
}

const ToolkitSection = ({ reducedMotion }: ToolkitSectionProps) => (
  <section
    id="toolkit"
    className="content-section toolkit-section narrative-section"
    data-narrative-effect="toolkit"
    data-character-side="right"
    aria-labelledby="toolkit-title"
  >
    <SectionHeading
      id="toolkit-title"
      number="05"
      eyebrow="Toolkit"
      title="Technologies selected"
      accent="for the problem."
      description="A practical toolkit for building, integrating, testing, and delivering complete products."
      reducedMotion={reducedMotion}
    />
    <div className="mobile-character-slot" data-mobile-character-anchor aria-hidden="true" />
    <div className="toolkit-grid" data-character-anchor>
      {digitalSkills.map((group, index) => (
        <Reveal
          className="toolkit-card"
          key={group.category}
          delay={(index % 3) * 80}
          reducedMotion={reducedMotion}
        >
          <div className="card-topline">
            <span>0{index + 1}</span>
            <Code2 aria-hidden="true" />
          </div>
          <h3>{group.category}</h3>
          <ul>
            {group.skills.map((skill) => <li key={skill}>{skill}</li>)}
          </ul>
        </Reveal>
      ))}
    </div>
  </section>
);

export default ToolkitSection;
