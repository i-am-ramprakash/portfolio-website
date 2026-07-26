import PolarBear3DCanvas from "../Character/PolarBear3DCanvas";

interface CharacterStageProps {
  activeSection: string;
  reducedMotion: boolean;
}

const sectionSides: Record<string, "left" | "center" | "right"> = {
  home: "center",
  about: "right",
  capabilities: "left",
  career: "right",
  work: "left",
  toolkit: "right",
  contact: "left",
  footer: "center",
};

const CharacterStage = ({ activeSection, reducedMotion }: CharacterStageProps) => (
  <div
    className={`character-stage character-stage-${sectionSides[activeSection] ?? "center"}`}
    data-character-section={activeSection}
    aria-hidden="true"
  >
    <PolarBear3DCanvas activeSection={activeSection} reducedMotion={reducedMotion} />
  </div>
);

export default CharacterStage;
