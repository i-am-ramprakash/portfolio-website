import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Menu,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { lazy, Suspense, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { digitalSkills, experiences, projects } from "../data/portfolio";
import { sendEmail } from "../services/emailService";
import type { CharacterZone } from "./Character/ProceduralCharacter";

const ProceduralCharacter = lazy(() => import("./Character/ProceduralCharacter"));

const navigation = [
  { id: "about", label: "About" },
  { id: "capabilities", label: "What I do" },
  { id: "career", label: "Career" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

const services = [
  {
    title: "Backend engineering",
    subtitle: "Reliable services and data workflows",
    copy: "Secure REST APIs, Spring Boot applications, persistence layers, authentication, role-aware systems, and maintainable service boundaries.",
    skills: ["Java", "Spring Boot", "REST APIs", "Hibernate/JPA", "PostgreSQL", "RBAC"],
  },
  {
    title: "Frontend & product UI",
    subtitle: "Responsive interfaces built around real tasks",
    copy: "Typed React experiences, Angular applications, dashboards, design systems, and accessible interfaces that remain clear under real product complexity.",
    skills: ["React", "TypeScript", "Angular", "Tailwind CSS", "Responsive UI", "Accessibility"],
  },
  {
    title: "Interactive products",
    subtitle: "Real-time, mobile, and playful systems",
    copy: "Android shells, Canvas game engines, WebRTC communication, synchronized multiplayer, and interaction systems that make products feel alive.",
    skills: ["Kotlin", "Jetpack Compose", "WebRTC", "Canvas", "Firebase", "Gamification"],
  },
];

const MainContainer = () => {
  const [activeZone, setActiveZone] = useState<CharacterZone>("hero");
  const [navOpen, setNavOpen] = useState(false);
  const [expandedService, setExpandedService] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [company, setCompany] = useState("");
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-character-zone]");
    const visibleSections = new Map<HTMLElement, number>();
    let lastObservedScrollY = window.scrollY;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target as HTMLElement;
          if (entry.isIntersecting) visibleSections.set(section, entry.intersectionRatio);
          else visibleSections.delete(section);
        });

        const scrollingDown = window.scrollY >= lastObservedScrollY;
        lastObservedScrollY = window.scrollY;
        const viewportCenter = window.innerHeight / 2;
        let bestSection: HTMLElement | null = null;
        let bestScore = Number.POSITIVE_INFINITY;

        visibleSections.forEach((_, section) => {
          const rect = section.getBoundingClientRect();
          const midpointDistance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
          const directionPenalty = scrollingDown
            ? rect.top < 0
              ? 80
              : 0
            : rect.bottom > window.innerHeight
              ? 80
              : 0;
          const score = midpointDistance + directionPenalty;
          if (score < bestScore) {
            bestScore = score;
            bestSection = section;
          }
        });

        const zone = bestSection?.getAttribute("data-character-zone") as CharacterZone | null;
        if (zone) setActiveZone(zone);
      },
      {
        rootMargin: "0px",
        threshold: Array.from({ length: 21 }, (_, index) => index * 0.05),
      },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let frame = 0;
    let targetX = -100;
    let targetY = -100;
    const moveCursor = () => {
      cursor.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      frame = 0;
    };
    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(moveCursor);
    };
    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const isInteractive = Boolean(
        target && typeof target.closest === "function" && target.closest("a, button, input, textarea, summary"),
      );
      cursor.classList.toggle("cursor-active", isInteractive);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  const techStack = useMemo(
    () => [...new Set(digitalSkills.flatMap((group) => group.skills))].slice(0, 24),
    [],
  );

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    setNavOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (company) {
      setFormState("success");
      return;
    }
    setFormState("sending");
    const sent = await sendEmail(formData);
    setFormState(sent ? "success" : "error");
    if (sent) setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className={`portfolio-shell ${reducedMotion ? "reduced-motion" : ""}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="ambient-glow ambient-glow-one" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-two" aria-hidden="true" />
      <div className="page-grain" aria-hidden="true" />
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />

      <Suspense
        fallback={
          <div className="character-stage character-loading" aria-hidden="true">
            <div className="character-fallback">
              <span className="fallback-antenna" />
              <span className="fallback-face">
                <i />
                <i />
              </span>
              <span className="fallback-body" />
            </div>
          </div>
        }
      >
        <ProceduralCharacter activeZone={activeZone} reducedMotion={reducedMotion} />
      </Suspense>

      <header className="site-header">
        <button className="site-brand" type="button" onClick={() => scrollTo("home")} aria-label="Go home">
          <span>RP</span>
          <b>RAM PRAKASH</b>
        </button>
        <a
          className="header-connect"
          href="https://github.com/i-am-ramprakash"
          target="_blank"
          rel="noreferrer"
        >
          github.com/i-am-ramprakash <ArrowUpRight />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <nav className={`site-nav ${navOpen ? "nav-open" : ""}`} aria-label="Primary navigation">
          {navigation.map((item) => (
            <button
              type="button"
              key={item.id}
              className={activeZone === (item.id === "capabilities" ? "capabilities" : item.id) ? "active" : ""}
              onClick={() => scrollTo(item.id)}
            >
              <span>{item.label}</span>
              <span aria-hidden="true">{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setNavOpen((value) => !value)}
          aria-expanded={navOpen}
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
        >
          {navOpen ? <X /> : <Menu />}
        </button>
      </header>

      <aside className="social-rail" aria-label="Social profiles">
        <span>CONNECT</span>
        <i aria-hidden="true" />
        <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer" aria-label="GitHub">
          <Github />
        </a>
        <a
          href="https://np.linkedin.com/in/ramprakash-sah-b368a5179"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
        >
          <Linkedin />
        </a>
      </aside>

      <main id="main-content">
        <section id="home" className="landing-section" data-character-zone="hero" aria-labelledby="hero-title">
          <div className="landing-copy landing-name">
            <p className="section-label">HELLO! I&apos;M</p>
            <h1 id="hero-title">
              RAM
              <br />
              <span>PRAKASH</span>
            </h1>
          </div>
          <div className="landing-copy landing-role">
            <p>A CREATIVE</p>
            <h2>
              <span>DEVELOPER</span>
              <br />& ENGINEER
            </h2>
            <div className="hero-actions">
              <button type="button" onClick={() => scrollTo("work")}>
                View my work <ArrowRight />
              </button>
              <button type="button" onClick={() => scrollTo("contact")}>
                Contact me <Mail />
              </button>
            </div>
          </div>
          <button className="scroll-cue" type="button" onClick={() => scrollTo("about")}>
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown />
          </button>
        </section>

        <section id="about" className="about-section page-section" data-character-zone="about" aria-labelledby="about-title">
          <div className="section-number">01 / ABOUT</div>
          <div className="about-card reveal-card">
            <p className="eyebrow">FULL-STACK · SYSTEMS · PRODUCT</p>
            <h2 id="about-title">
              I turn complex systems into <span>clear products.</span>
            </h2>
            <p>
              I’m Ram Prakash Sah, a full-stack systems engineer with experience across enterprise
              banking software, multi-vendor platforms, Android products, real-time communication,
              and interactive applications.
            </p>
            <p>
              My work connects robust Java and Spring Boot foundations with thoughtful React and
              TypeScript interfaces—because reliable engineering and good experience design belong
              together.
            </p>
            <div className="about-facts">
              <div>
                <span>BASED IN</span>
                <b>Kathmandu, Nepal</b>
              </div>
              <div>
                <span>CURRENTLY</span>
                <b>Full-Stack Developer</b>
              </div>
              <div>
                <span>FOCUS</span>
                <b>Product engineering</b>
              </div>
            </div>
          </div>
        </section>

        <section
          id="capabilities"
          className="capabilities-section page-section"
          data-character-zone="capabilities"
          aria-labelledby="capabilities-title"
        >
          <div className="section-number">02 / CAPABILITIES</div>
          <div className="capabilities-heading">
            <p>WHAT</p>
            <h2 id="capabilities-title">
              I <span>DO</span>
            </h2>
          </div>
          <div className="service-stack">
            {services.map((service, index) => {
              const expanded = expandedService === index;
              return (
                <article className={`service-card ${expanded ? "expanded" : ""}`} key={service.title}>
                  <button
                    type="button"
                    onClick={() => setExpandedService(index)}
                    aria-expanded={expanded}
                    aria-controls={`service-panel-${index}`}
                  >
                    <span className="service-index">0{index + 1}</span>
                    <span>
                      <b>{service.title}</b>
                      <small>{service.subtitle}</small>
                    </span>
                    <span className="service-plus" aria-hidden="true">
                      {expanded ? "—" : "+"}
                    </span>
                  </button>
                  <div id={`service-panel-${index}`} className="service-panel">
                    <p>{service.copy}</p>
                    <div>
                      {service.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="career" className="career-section page-section" data-character-zone="career" aria-labelledby="career-title">
          <div className="section-number">03 / EXPERIENCE</div>
          <header className="career-heading">
            <p>MY CAREER &</p>
            <h2 id="career-title">EXPERIENCE</h2>
          </header>
          <div className="career-list">
            {[...experiences].reverse().map((experience, index) => (
              <article className="career-entry" key={experience.id}>
                <span className="career-count">0{index + 1}</span>
                <div className="career-role">
                  <span>{experience.period}</span>
                  <h3>{experience.title}</h3>
                  <b>{experience.company}</b>
                  <small>{experience.location}</small>
                </div>
                <div className="career-description">
                  <p>{experience.objective}</p>
                  <ul>
                    {experience.responsibilities.slice(0, 3).map((responsibility) => (
                      <li key={responsibility}>{responsibility}</li>
                    ))}
                  </ul>
                  <div className="tag-list">
                    {experience.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="work" className="work-section page-section" data-character-zone="work" aria-labelledby="work-title">
          <div className="section-number">04 / SELECTED WORK</div>
          <header className="work-heading">
            <p>A SELECTION OF</p>
            <h2 id="work-title">
              THINGS I&apos;VE <span>BUILT</span>
            </h2>
          </header>
          <div className="project-list">
            {projects.map((project, index) => (
              <article className="project-card" key={project.id}>
                <a
                  className="project-image"
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${project.title} repository in a new tab`}
                >
                  <img
                    src={project.image}
                    alt=""
                    width="1200"
                    height="800"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>VIEW PROJECT</span>
                  <ArrowUpRight />
                </a>
                <div className="project-copy">
                  <div className="project-meta">
                    <span>0{index + 1}</span>
                    <small>{project.status}</small>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-outcome">
                    <span>OUTCOME</span>
                    <p>{project.outcome}</p>
                  </div>
                  <details>
                    <summary>Case study details</summary>
                    <div className="project-detail-grid">
                      <div>
                        <span>ROLE</span>
                        <p>{project.role}</p>
                      </div>
                      <div>
                        <span>CHALLENGE</span>
                        <p>{project.challenge}</p>
                      </div>
                      <div>
                        <span>ARCHITECTURE</span>
                        <p>{project.architecture}</p>
                      </div>
                    </div>
                    <ul>
                      {project.features.map((feature) => (
                        <li key={feature}>
                          <CheckCircle2 /> {feature}
                        </li>
                      ))}
                    </ul>
                  </details>
                  <div className="tag-list">
                    {project.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                  <a className="project-link" href={project.link} target="_blank" rel="noreferrer">
                    View repository <ExternalLink />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="tech-section" data-character-zone="toolkit" aria-labelledby="tech-title">
          <div className="section-number">05 / TOOLKIT</div>
          <h2 id="tech-title">
            TECHNOLOGIES I USE TO <span>SHIP</span>
          </h2>
          <div className="tech-marquee" aria-label={techStack.join(", ")}>
            <div>
              {[...techStack, ...techStack].map((technology, index) => (
                <span key={`${technology}-${index}`}>
                  <Code2 /> {technology}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section page-section" data-character-zone="contact" aria-labelledby="contact-title">
          <div className="section-number">06 / CONTACT</div>
          <div className="contact-intro">
            <p>HAVE A PROJECT, ROLE, OR IDEA?</p>
            <h2 id="contact-title">
              LET&apos;S MAKE
              <br />
              SOMETHING <span>WORK.</span>
            </h2>
            <div className="contact-links">
              <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer">
                <Github /> GitHub <ArrowUpRight />
              </a>
              <a
                href="https://np.linkedin.com/in/ramprakash-sah-b368a5179"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin /> LinkedIn <ArrowUpRight />
              </a>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-title">
              <Sparkles />
              <span>
                <b>Send a message</b>
                <small>I’ll reply to the email you provide.</small>
              </span>
            </div>
            <input
              className="honeypot"
              type="text"
              name="b_hp_check"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              tabIndex={-1}
              autoComplete="new-password"
              aria-hidden="true"
              style={{ display: "none" }}
            />
            <label>
              <span>Your name</span>
              <input
                required
                autoComplete="name"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="How should I address you?"
              />
            </label>
            <label>
              <span>Email address</span>
              <input
                required
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                placeholder="you@example.com"
              />
            </label>
            <label>
              <span>
                Message <i>{formData.message.length}/1000</i>
              </span>
              <textarea
                required
                minLength={20}
                maxLength={1000}
                rows={6}
                value={formData.message}
                onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                placeholder="Tell me about the opportunity or problem..."
              />
            </label>
            <button type="submit" disabled={formState === "sending"}>
              {formState === "sending" ? "Sending…" : "Send message"} <Send />
            </button>
            <div className="form-feedback" aria-live="polite">
              {formState === "success" && <p className="success">Message sent. Thank you.</p>}
              {formState === "error" && (
                <p className="error">The message could not be sent. Please try LinkedIn instead.</p>
              )}
            </div>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <b>RAM PRAKASH SAH</b>
          <span>FULL-STACK SYSTEMS ENGINEER</span>
        </div>
        <p>
          Original implementation by Ram Prakash Sah. Interaction direction inspired by{" "}
          <a href="https://github.com/MoncyDev/Portfolio-Website" target="_blank" rel="noreferrer">
            Moncy Yohannan
          </a>
          .
        </p>
        <button type="button" onClick={() => scrollTo("home")}>
          Back to top <ArrowUp />
        </button>
      </footer>
    </div>
  );
};

export default MainContainer;
