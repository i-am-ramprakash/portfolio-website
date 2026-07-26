import { ArrowUpRight, Check, Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { projects } from "../../data/portfolio";
import type { Project } from "../../types";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

interface WorkSectionProps {
  reducedMotion: boolean;
}

interface ProjectStreamCardProps {
  project: Project;
  index: number;
  duplicate?: boolean;
  onSelect: (project: Project) => void;
}

const ProjectStreamCard = ({
  project,
  index,
  duplicate = false,
  onSelect,
}: ProjectStreamCardProps) => {
  const visibleTechnologies = project.technologies.slice(0, 4);
  const remainingTechnologies = project.technologies.length - visibleTechnologies.length;

  return (
    <article className="project-stream-card">
      <div className="project-header">
        <span>0{index + 1}</span>
        <small>{project.status}</small>
      </div>
      <h3>{project.title}</h3>
      <p className="project-description">{project.description}</p>
      <ul className="skill-list" aria-label={duplicate ? undefined : `${project.title} technologies`}>
        {visibleTechnologies.map((technology) => <li key={technology}>{technology}</li>)}
        {remainingTechnologies > 0 && <li>+{remainingTechnologies} more</li>}
      </ul>
      <button
        className="project-card-action glass-button"
        type="button"
        tabIndex={duplicate ? -1 : undefined}
        onClick={() => onSelect(project)}
      >
        View project details <ArrowUpRight />
      </button>
    </article>
  );
};

const WorkSection = ({ reducedMotion }: WorkSectionProps) => {
  const [manualPaused, setManualPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const resumeTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  const pauseForInteraction = () => {
    window.clearTimeout(resumeTimer.current);
    setInteractionPaused(true);
  };

  const resumeAfterInteraction = () => {
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setInteractionPaused(false), 1400);
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    setManualPaused(true);
  };

  const carouselPaused = manualPaused || interactionPaused || reducedMotion;

  return (
    <section
      id="work"
      className="content-section work-section narrative-section"
      data-narrative-effect="work"
      data-character-side="left"
      aria-labelledby="work-title"
    >
      <SectionHeading
        id="work-title"
        number="04"
        eyebrow="Selected work"
        title="Products shaped by"
        accent="engineering depth."
        description="Six projects spanning learning, games, communication, enterprise workflows, security, and machine learning."
        reducedMotion={reducedMotion}
      />

      <div
        className="mobile-character-slot mobile-character-slot-work"
        data-mobile-character-anchor
        aria-hidden="true"
      />

      <Reveal
        className={`project-carousel ${carouselPaused ? "is-paused" : ""} ${reducedMotion ? "is-reduced" : ""}`}
        characterAnchor
        reducedMotion={reducedMotion}
      >
        <div className="project-carousel-toolbar">
          <div>
            <span>Project stream</span>
            <p>Explore the cards or pause the movement to read at your pace.</p>
          </div>
          <button
            className="glass-button carousel-control"
            type="button"
            onClick={() => setManualPaused((paused) => !paused)}
            aria-pressed={manualPaused}
            disabled={reducedMotion}
            aria-label={
              reducedMotion
                ? "Project movement disabled by reduced-motion preference"
                : manualPaused
                  ? "Resume project carousel"
                  : "Pause project carousel"
            }
          >
            {manualPaused || reducedMotion ? <Play /> : <Pause />}
            <span>{reducedMotion ? "Motion off" : manualPaused ? "Resume" : "Pause"}</span>
          </button>
        </div>

        <div
          className="project-carousel-viewport"
          onPointerDown={pauseForInteraction}
          onPointerUp={resumeAfterInteraction}
          onPointerCancel={resumeAfterInteraction}
          onPointerLeave={resumeAfterInteraction}
        >
          <div className="project-carousel-track">
            <div className="project-carousel-group project-carousel-group-clone" aria-hidden="true">
              {projects.map((project, index) => (
                <ProjectStreamCard
                  key={`clone-${project.id}`}
                  project={project}
                  index={index}
                  duplicate
                  onSelect={selectProject}
                />
              ))}
            </div>
            <div className="project-carousel-group">
              {projects.map((project, index) => (
                <ProjectStreamCard
                  key={project.id}
                  project={project}
                  index={index}
                  onSelect={selectProject}
                />
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {selectedProject && (
        <article className="project-detail-panel" aria-live="polite">
          <div className="project-detail-heading">
            <div>
              <span>Selected project</span>
              <h3>{selectedProject.title}</h3>
            </div>
            <button
              className="glass-button detail-close-button"
              type="button"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project details"
            >
              <X />
            </button>
          </div>
          <div className="project-detail-summary">
            <div><span>Role</span><p>{selectedProject.role}</p></div>
            <div><span>Outcome</span><p>{selectedProject.outcome}</p></div>
            <div><span>Challenge</span><p>{selectedProject.challenge}</p></div>
            <div><span>Architecture</span><p>{selectedProject.architecture}</p></div>
          </div>
          <div className="project-detail-footer">
            <ul>
              {selectedProject.features.map((feature) => (
                <li key={feature}><Check /> {feature}</li>
              ))}
            </ul>
            {selectedProject.link && (
              <a href={selectedProject.link} target="_blank" rel="noreferrer">
                View repository <ArrowUpRight />
              </a>
            )}
          </div>
        </article>
      )}
    </section>
  );
};

export default WorkSection;
