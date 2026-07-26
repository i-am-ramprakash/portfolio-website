import Reveal from "./Reveal";

interface SectionHeadingProps {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  reducedMotion?: boolean;
}

const SectionHeading = ({
  number,
  id,
  eyebrow,
  title,
  accent,
  description,
  reducedMotion,
}: SectionHeadingProps) => {
  const titleWords = title.split(" ");

  return (
  <Reveal className="section-heading" reducedMotion={reducedMotion}>
    <div className="section-heading-meta">
      <span>{number}</span>
      <p>{eyebrow}</p>
    </div>
    <h2 id={id} aria-label={`${title}${accent ? ` ${accent}` : ""}`}>
      <span className="split-heading-visual" aria-hidden="true">
        {titleWords.map((word, index) => (
          <span data-narrative-word key={`${word}-${index}`}>{word}</span>
        ))}
        {accent && (
          <em className="tilted-card-text" data-narrative-word>
            {accent}
          </em>
        )}
      </span>
    </h2>
    {description && <p className="section-description">{description}</p>}
    <i aria-hidden="true" />
  </Reveal>
  );
};

export default SectionHeading;
