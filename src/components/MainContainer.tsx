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
  Pause,
  Play,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { digitalSkills, experiences, projects } from "../data/portfolio";
import { sendEmail } from "../services/emailService";
import ProceduralCharacter, {
  type CharacterZone,
} from "./Character/ProceduralCharacter";

const navigation = [
  { id: "about", label: "About" },
  { id: "capabilities", label: "What I do" },
  { id: "career", label: "Career" },
  { id: "work", label: "Work" },
  { id: "toolkit", label: "Toolkit" },
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
  const [expandedService, setExpandedService] = useState<number | null>(0);
  const [characterPaused, setCharacterPaused] = useState(false);
  const [characterSignal, setCharacterSignal] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [company, setCompany] = useState("");
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const cursorRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-character-zone]")];
    let currentZone: CharacterZone = "hero";
    let candidateZone: CharacterZone = "hero";
    let candidateTimer = 0;
    let frame = 0;

    const scoreSection = (section: HTMLElement) => {
      const rect = section.getBoundingClientRect();
      const activationLine = window.innerHeight * 0.48;
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      return visible
        ? Math.abs(Math.min(Math.max(activationLine, rect.top), rect.bottom) - activationLine) +
            Math.abs(rect.top + rect.height / 2 - activationLine) * 0.12
        : Number.POSITIVE_INFINITY;
    };

    const updateActiveSection = () => {
      frame = 0;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(
        scrollableHeight > 0
          ? Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1)
          : 0,
      );
      const ranked = sections
        .map((section) => ({ section, score: scoreSection(section) }))
        .sort((a, b) => a.score - b.score);
      const best = ranked[0];
      if (!best || !Number.isFinite(best.score)) return;

      const nextZone = best.section.getAttribute("data-character-zone") as CharacterZone;
      const currentSection = sections.find(
        (section) => section.getAttribute("data-character-zone") === currentZone,
      );
      const currentScore = currentSection ? scoreSection(currentSection) : Number.POSITIVE_INFINITY;
      const clearlyDominant = best.score + 48 < currentScore;
      if (nextZone === currentZone || !clearlyDominant) {
        candidateZone = currentZone;
        window.clearTimeout(candidateTimer);
        return;
      }
      if (nextZone === candidateZone) return;

      candidateZone = nextZone;
      window.clearTimeout(candidateTimer);
      candidateTimer = window.setTimeout(() => {
        const candidate = sections.find(
          (section) => section.getAttribute("data-character-zone") === candidateZone,
        );
        if (!candidate) return;
        const candidateScore = scoreSection(candidate);
        const active = sections.find(
          (section) => section.getAttribute("data-character-zone") === currentZone,
        );
        const activeScore = active ? scoreSection(active) : Number.POSITIVE_INFINITY;
        if (candidateScore + 32 < activeScore) {
          currentZone = candidateZone;
          setActiveZone(currentZone);
        }
        candidateZone = currentZone;
      }, 120);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };
    updateActiveSection();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(candidateTimer);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
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
    if (!navOpen) return () => {
      document.body.style.overflow = "";
    };

    const nav = navRef.current;
    const focusable = nav
      ? [...nav.querySelectorAll<HTMLElement>("button, a[href]")]
      : [];
    focusable[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavOpen(false);
        menuToggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navOpen]);

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
    if (sent) {
      setFormData({ name: "", email: "", message: "" });
      setCharacterSignal((signal) => signal + 1);
    }
  };

  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (formState !== "idle" && formState !== "sending") setFormState("idle");
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

      <ProceduralCharacter
        activeZone={activeZone}
        reducedMotion={reducedMotion}
        motionPaused={characterPaused}
        celebrationSignal={characterSignal}
      />

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
        <nav
          ref={navRef}
          id="primary-navigation"
          className={`site-nav ${navOpen ? "nav-open" : ""}`}
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <button
              type="button"
              key={item.id}
              className={activeZone === (item.id === "capabilities" ? "capabilities" : item.id) ? "active" : ""}
              aria-current={activeZone === item.id ? "page" : undefined}
              onClick={() => scrollTo(item.id)}
            >
              <span>{item.label}</span>
              <span aria-hidden="true">{item.label}</span>
            </button>
          ))}
        </nav>
        <button
          ref={menuToggleRef}
          type="button"
          className="menu-toggle"
          onClick={() => setNavOpen((value) => !value)}
          aria-expanded={navOpen}
          aria-controls="primary-navigation"
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
        >
          {navOpen ? <X /> : <Menu />}
        </button>
        <div className="page-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${scrollProgress})` }} />
        </div>
      </header>

      <aside
        className={`social-rail ${activeZone === "contact" ? "social-rail-muted" : ""}`}
        aria-label="Social profiles"
      >
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
      <button
        type="button"
        className="motion-toggle"
        onClick={() => setCharacterPaused((paused) => !paused)}
        aria-pressed={characterPaused}
        aria-label={characterPaused ? "Resume character animation" : "Pause character animation"}
      >
        {characterPaused ? <Play /> : <Pause />}
        <span>{characterPaused ? "Resume character" : "Pause character"}</span>
      </button>

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
          <div className="about-layout reveal-card">
            <div className="about-copy">
              <p className="eyebrow">FULL-STACK · SYSTEMS · PRODUCT</p>
              <h2 id="about-title" data-character-target="about">
                I turn complex systems into <span>clear products.</span>
              </h2>
              <div className="about-story">
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
              </div>
            </div>
            <aside className="about-facts" aria-label="Profile facts">
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
            </aside>
          </div>
        </section>

        <section
          id="capabilities"
          className="capabilities-section page-section"
          data-character-zone="capabilities"
          aria-labelledby="capabilities-title"
        >
          <div className="section-number">02 / CAPABILITIES</div>
          <div className="capabilities-content">
            <header className="capabilities-heading">
              <p>WHAT</p>
              <h2 id="capabilities-title" data-character-target="capabilities">
                I <span>DO</span>
              </h2>
            </header>
            <div className="service-stack">
              {services.map((service, index) => {
                const expanded = expandedService === index;
                return (
                  <article className={`service-card ${expanded ? "expanded" : ""}`} key={service.title}>
                    <button
                      type="button"
                      onClick={() => setExpandedService(expanded ? null : index)}
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
          </div>
        </section>

        <section id="career" className="career-section page-section" data-character-zone="career" aria-labelledby="career-title">
          <div className="section-number">03 / EXPERIENCE</div>
          <header className="career-heading">
            <p>MY CAREER &</p>
            <h2 id="career-title" data-character-target="career">EXPERIENCE</h2>
          </header>
          <div className="career-list">
            {[...experiences].reverse().map((experience, index) => (
              <article className="career-entry" key={experience.id}>
                <div className="career-marker" aria-hidden="true">
                  <span className="career-count">0{index + 1}</span>
                  <i />
                </div>
                <div className="career-card">
                  <header className="career-role">
                    <span>{experience.period}</span>
                    <h3>{experience.title}</h3>
                    <b>{experience.company}</b>
                    <small>{experience.location}</small>
                  </header>
                  <p>{experience.objective}</p>
                  <details>
                    <summary>Responsibilities and technology</summary>
                    <ul>
                      {experience.responsibilities.map((responsibility) => (
                        <li key={responsibility}>{responsibility}</li>
                      ))}
                    </ul>
                    <div className="tag-list">
                      {experience.technologies.map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </div>
                  </details>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="work" className="work-section page-section" data-character-zone="work" aria-labelledby="work-title">
          <div className="section-number">04 / SELECTED WORK</div>
          <header className="work-heading">
            <p>A SELECTION OF</p>
            <h2 id="work-title" data-character-target="work">
              THINGS I&apos;VE <span>BUILT</span>
            </h2>
          </header>
          <div className="project-list">
            {projects.map((project, index) => (
              <article
                className={`project-card ${index === 0 ? "project-featured" : ""}`}
                key={project.id}
              >
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
                    <summary>
                      <span>View case study</span>
                      <ArrowDown />
                    </summary>
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

        <section id="toolkit" className="tech-section" data-character-zone="toolkit" aria-labelledby="tech-title">
          <div className="tech-inner">
            <div className="section-number">05 / TOOLKIT</div>
            <h2 id="tech-title">
              TECHNOLOGIES I USE TO <span>SHIP</span>
            </h2>
            <div className="toolkit-groups" data-character-target="toolkit">
              {digitalSkills.map((group, index) => (
                <article className="toolkit-group" key={group.category}>
                  <header>
                    <span>0{index + 1}</span>
                    <Code2 />
                    <h3>{group.category}</h3>
                  </header>
                  <div>
                    {group.skills.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section page-section" data-character-zone="contact" aria-labelledby="contact-title">
          <div className="section-number">06 / CONTACT</div>
          <div className="contact-content">
            <div className="contact-intro">
              <p>HAVE A PROJECT, ROLE, OR IDEA?</p>
              <h2 id="contact-title" data-character-target="contact">
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
              <div className="form-fields">
                <label>
                  <span>Your name</span>
                  <input
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(event) => updateFormField("name", event.target.value)}
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
                    onChange={(event) => updateFormField("email", event.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <label>
                <span>
                  Message <i>{formData.message.length}/1000</i>
                </span>
                <textarea
                  required
                  minLength={20}
                  maxLength={1000}
                  rows={5}
                  value={formData.message}
                  onChange={(event) => updateFormField("message", event.target.value)}
                  placeholder="Tell me about the opportunity or problem..."
                />
              </label>
              <button
                type="submit"
                disabled={formState === "sending"}
                aria-busy={formState === "sending"}
              >
                {formState === "sending" ? "Sending…" : "Send message"} <Send />
              </button>
              <div className="form-feedback" aria-live="polite">
                {formState === "success" && <p className="success">Message sent. Thank you.</p>}
                {formState === "error" && (
                  <p className="error">The message could not be sent. Please try LinkedIn instead.</p>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <b>RAM PRAKASH SAH</b>
          <span>FULL-STACK SYSTEMS ENGINEER</span>
        </div>
        <p>
          &copy; {new Date().getFullYear()} Ram Prakash Sah. All rights reserved. Based in Kathmandu, Nepal.
          <br />
          Built with React, TypeScript & Three.js.
        </p>
        <button type="button" onClick={() => scrollTo("home")}>
          Back to top <ArrowUp />
        </button>
      </footer>
    </div>
  );
};

export default MainContainer;
