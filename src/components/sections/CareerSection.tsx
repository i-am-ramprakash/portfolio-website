import { experiences } from "../../data/portfolio";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

interface CareerSectionProps {
  reducedMotion: boolean;
}

const CareerSection = ({ reducedMotion }: CareerSectionProps) => (
  <section
    id="career"
    className="content-section career-section narrative-section"
    data-narrative-effect="career"
    data-character-side="right"
    aria-labelledby="career-title"
  >
    <SectionHeading
      id="career-title"
      number="03"
      eyebrow="Career"
      title="Experience built"
      accent="in the real world."
      description="Enterprise delivery and product development across India and Nepal."
      reducedMotion={reducedMotion}
    />
    <div className="career-list" data-character-anchor>
      {[...experiences].reverse().map((experience, index) => (
        <Reveal
          className="career-card"
          key={experience.id}
          delay={index * 100}
          reducedMotion={reducedMotion}
        >
          <div className="career-index">
            <span>0{index + 1}</span>
            <i aria-hidden="true" />
          </div>
          <div className="career-content">
            <div className="career-heading">
              <div>
                <p>{experience.period}</p>
                <small>{experience.location}</small>
              </div>
              <div>
                <h3>{experience.title}</h3>
                <b>{experience.company}</b>
              </div>
            </div>
            <p className="career-objective">{experience.objective}</p>
            <details>
              <summary>Responsibilities and technologies</summary>
              <div className="career-details">
                <ul>
                  {experience.responsibilities.map((responsibility) => (
                    <li key={responsibility}>{responsibility}</li>
                  ))}
                </ul>
                <ul className="skill-list" aria-label={`${experience.company} technologies`}>
                  {experience.technologies.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
              </div>
            </details>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

export default CareerSection;
