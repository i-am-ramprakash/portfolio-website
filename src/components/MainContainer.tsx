import {
  ArrowRight,
  ArrowUp,
  Briefcase,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  Gamepad2,
  Github,
  Linkedin,
  Mail,
  Menu,
  Moon,
  Search,
  Send,
  Server,
  Sparkles,
  Sun,
  Wrench,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { digitalSkills, experiences, projects } from "../data/portfolio";
import { useTheme } from "../hooks/useTheme";
import { sendEmail } from "../services/emailService";

const navItems = [
  { id: "about", label: "Profile", index: "01" },
  { id: "skills", label: "Skills", index: "02" },
  { id: "experience", label: "Career", index: "03" },
  { id: "work", label: "Work", index: "04" },
  { id: "contact", label: "Contact", index: "05" },
];

const skillIcons = [Server, Code2, Database, Wrench, Gamepad2];
const projectFilters = ["All", "Web", "Mobile", "Backend", "AI"];

const filterProject = (filter: string, technologies: string[]) => {
  if (filter === "All") return true;
  const values = technologies.join(" ").toLowerCase();
  if (filter === "Web") return /react|typescript|javascript|tailwind|html5/.test(values);
  if (filter === "Mobile") return /kotlin|android|jetpack/.test(values);
  if (filter === "Backend") return /java|spring|node|express|hibernate|blockchain/.test(values);
  return /python|tensorflow|cnn|gemini/.test(values);
};

const MainContainer = () => {
  const { isDark, toggleTheme } = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const [skillQuery, setSkillQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("Java");
  const [projectFilter, setProjectFilter] = useState("All");
  const [motionOff, setMotionOff] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [company, setCompany] = useState("");
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    const sections = ["top", ...navItems.map(({ id }) => id)]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.2, 0.6] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  const filteredSkills = useMemo(
    () =>
      digitalSkills.map((group) => ({
        ...group,
        skills: group.skills.filter((skill) =>
          skill.toLowerCase().includes(skillQuery.trim().toLowerCase()),
        ),
      })),
    [skillQuery],
  );

  const visibleProjects = projects.filter((project) =>
    filterProject(projectFilter, project.technologies),
  );

  const selectedCategory =
    digitalSkills.find((group) => group.skills.includes(selectedSkill))?.category ??
    "Engineering";

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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: motionOff ? "auto" : "smooth" });
    setNavOpen(false);
  };

  return (
    <div className={`site-shell ${motionOff ? "motion-off" : ""}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="noise" aria-hidden="true" />

      <header className="hud-wrap">
        <div className="hud">
          <button className="brand" type="button" onClick={() => scrollTo("top")} aria-label="Go to top">
            <span className="brand-mark" aria-hidden="true">
              <span>RP</span>
            </span>
            <span>
              <b>RAM PRAKASH</b>
              <small>FULL-STACK SYSTEMS ENGINEER</small>
            </span>
          </button>

          <nav className={`zone-nav ${navOpen ? "nav-open" : ""}`} aria-label="Primary navigation">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={activeSection === item.id ? "active" : ""}
                onClick={() => scrollTo(item.id)}
                aria-current={activeSection === item.id ? "location" : undefined}
              >
                <span>{item.index}</span>
                <b>{item.label}</b>
              </button>
            ))}
          </nav>

          <div className="hud-actions">
            <button
              className="icon-btn"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
              title={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
              {isDark ? <Sun /> : <Moon />}
            </button>
            <button
              className="icon-btn desktop-control"
              type="button"
              onClick={() => setMotionOff((value) => !value)}
              aria-pressed={motionOff}
              aria-label={`${motionOff ? "Enable" : "Reduce"} motion`}
              title={`${motionOff ? "Enable" : "Reduce"} motion`}
            >
              <Sparkles className={motionOff ? "muted-icon" : ""} />
            </button>
            <button
              className="icon-btn menu-btn"
              type="button"
              aria-expanded={navOpen}
              aria-controls="mobile-navigation"
              aria-label={navOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setNavOpen((value) => !value)}
            >
              {navOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <div className="hud-status" aria-hidden="true">
          <span>AVAILABLE FOR PRODUCT ENGINEERING</span>
          <div>
            <i style={{ width: `${((navItems.findIndex((item) => item.id === activeSection) + 1) / navItems.length) * 100}%` }} />
          </div>
          <span>KATHMANDU · NPT</span>
        </div>
      </header>

      <main id="main-content">
        <section className="hero section-pad" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="live-dot" aria-hidden="true" />
              BUILDING RELIABLE PRODUCTS ACROSS WEB, MOBILE & BACKEND
            </p>
            <p className="hero-code" aria-hidden="true">
              &lt;engineer profile="full-stack" /&gt;
            </p>
            <h1 id="hero-title">
              Systems that scale.
              <br />
              Experiences that <span>connect.</span>
            </h1>
            <p className="hero-role">JAVA · SPRING BOOT · REACT · TYPESCRIPT · INTERACTIVE PRODUCTS</p>
            <p className="hero-lead">
              I’m Ram Prakash, a full-stack systems engineer turning complex workflows into secure,
              responsive products—from enterprise services to real-time consumer experiences.
            </p>
            <div className="hero-cta">
              <button className="primary-btn" type="button" onClick={() => scrollTo("work")}>
                Explore selected work <ArrowRight />
              </button>
              <button className="secondary-btn" type="button" onClick={() => scrollTo("contact")}>
                Start a conversation <Mail />
              </button>
            </div>
            <div className="hero-links" aria-label="Professional profiles">
              <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer">
                <Github /> GitHub <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a
                href="https://np.linkedin.com/in/ramprakash-sah-b368a5179"
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin /> LinkedIn <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>

          <div className="hero-world" aria-hidden="true">
            <div className="world-grid" />
            <div className="orbit orbit-one">
              <i>BACKEND</i>
              <i>PRODUCT</i>
            </div>
            <div className="orbit orbit-two">
              <i>WEB</i>
              <i>MOBILE</i>
            </div>
            <div className="core">
              <span>RP</span>
              <small>ENGINEERING</small>
            </div>
            <div className="world-panel panel-top">
              <span>PRIMARY STACK</span>
              <b>Java + React</b>
            </div>
            <div className="world-panel panel-bottom">
              <span>CURRENT FOCUS</span>
              <b>Product systems</b>
            </div>
            <span className="coordinate">27.7172° N · 85.3240° E</span>
          </div>
        </section>

        <section className="section-pad content-section" id="about" aria-labelledby="about-title">
          <p className="section-kicker">
            <span>01</span> PROFILE / OPERATING PRINCIPLES
          </p>
          <div className="section-heading">
            <div>
              <h2 id="about-title">
                Engineering with <em>range.</em>
              </h2>
              <p>
                Enterprise foundations, product thinking, and a bias toward clear, dependable
                experiences.
              </p>
            </div>
          </div>
          <div className="profile-grid">
            <article className="profile-card profile-bio">
              <div className="profile-id">
                <span aria-hidden="true">RP</span>
                <div>
                  <b>Ram Prakash Sah</b>
                  <small>FULL-STACK & SYSTEMS ENGINEER</small>
                </div>
              </div>
              <p>
                I build high-performance web applications, Spring Boot services, multi-vendor
                platforms, Android experiences, and secure real-time systems. My background at TCS
                and Mentor Friends combines enterprise discipline with hands-on product delivery.
              </p>
            </article>
            <div className="profile-stats" aria-label="Profile highlights">
              <div>
                <span>EXPERIENCE</span>
                <b>Enterprise + product teams</b>
              </div>
              <div>
                <span>DELIVERY</span>
                <b>Backend to interface</b>
              </div>
              <div>
                <span>LOCATION</span>
                <b>Kathmandu, Nepal</b>
              </div>
              <div>
                <span>STATUS</span>
                <b>Open to conversations</b>
              </div>
            </div>
            {[
              [Server, "Reliable systems", "Maintainable services, clear boundaries, and secure data workflows."],
              [Code2, "Product interfaces", "Responsive experiences designed around real user tasks."],
              [Sparkles, "Interactive craft", "Motion and feedback used with purpose and restraint."],
              [Wrench, "End-to-end ownership", "From requirements and architecture through QA and delivery."],
            ].map(([Icon, title, description]) => {
              const PillarIcon = Icon as typeof Server;
              return (
                <article className="profile-pillar" key={title as string}>
                  <PillarIcon aria-hidden="true" />
                  <h3>{title as string}</h3>
                  <p>{description as string}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section-pad content-section" id="skills" aria-labelledby="skills-title">
          <p className="section-kicker">
            <span>02</span> CAPABILITIES / TECHNICAL MATRIX
          </p>
          <div className="section-heading">
            <div>
              <h2 id="skills-title">
                A practical <em>toolkit.</em>
              </h2>
              <p>Search or explore the technologies I use to move products from idea to delivery.</p>
            </div>
          </div>
          <label className="skill-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search skills</span>
            <input
              type="search"
              value={skillQuery}
              onChange={(event) => setSkillQuery(event.target.value)}
              placeholder="Search Java, React, WebRTC..."
            />
            {skillQuery && (
              <button type="button" onClick={() => setSkillQuery("")} aria-label="Clear skill search">
                <X />
              </button>
            )}
          </label>
          <div className="skill-tree">
            {filteredSkills.map((group, index) => {
              const BranchIcon = skillIcons[index] ?? Code2;
              if (group.skills.length === 0) return null;
              return (
                <article className="skill-branch" key={group.category}>
                  <header>
                    <span>
                      <BranchIcon aria-hidden="true" />
                    </span>
                    <div>
                      <small>BRANCH {String(index + 1).padStart(2, "0")}</small>
                      <h3>{group.category}</h3>
                    </div>
                  </header>
                  <div className="skill-nodes">
                    {group.skills.map((skill) => (
                      <button
                        type="button"
                        key={skill}
                        className={selectedSkill === skill ? "active" : ""}
                        aria-pressed={selectedSkill === skill}
                        onClick={() => setSelectedSkill(skill)}
                      >
                        <i aria-hidden="true" />
                        {skill}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="skill-detail" aria-live="polite">
            <span>SELECTED NODE</span>
            <b>{selectedSkill}</b>
            <p>{selectedCategory} capability used in production-oriented product work.</p>
          </div>
        </section>

        <section className="section-pad content-section" id="experience" aria-labelledby="experience-title">
          <p className="section-kicker">
            <span>03</span> CAREER / MISSION LOG
          </p>
          <div className="section-heading">
            <div>
              <h2 id="experience-title">
                Experience in <em>motion.</em>
              </h2>
              <p>Current-first chronology, focused on ownership and delivered capabilities.</p>
            </div>
          </div>
          <div className="mission-line">
            {[...experiences].reverse().map((experience, index) => (
              <article className="mission-card" key={experience.id}>
                <div className="mission-index">
                  <span>MISSION {String(index + 1).padStart(2, "0")}</span>
                  <i>{index === 0 ? "CURRENT" : "COMPLETED"}</i>
                </div>
                <div className="mission-heading">
                  <span className="mission-icon">
                    <Briefcase aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{experience.title}</h3>
                    <b>{experience.company}</b>
                    <small>
                      {experience.location} · {experience.period}
                    </small>
                  </div>
                </div>
                <div className="mission-objective">
                  <span>OBJECTIVE</span>
                  <p>{experience.objective}</p>
                </div>
                <ul>
                  {experience.responsibilities.slice(0, 3).map((responsibility) => (
                    <li key={responsibility}>{responsibility}</li>
                  ))}
                </ul>
                <div className="tags">
                  {experience.technologies.map((technology) => (
                    <span key={technology}>{technology}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-pad content-section" id="work" aria-labelledby="work-title">
          <p className="section-kicker">
            <span>04</span> SELECTED WORK / PRODUCT WORLDS
          </p>
          <div className="section-heading project-heading">
            <div>
              <h2 id="work-title">
                Built across <em>domains.</em>
              </h2>
              <p>Selected products with the challenge, architecture, role, and outcome made visible.</p>
            </div>
            <div className="world-count" aria-label={`${projects.length} selected projects`}>
              <b>{projects.length}</b>
              <span>
                SELECTED
                <br />
                PROJECTS
              </span>
            </div>
          </div>
          <div className="filter-bar" aria-label="Filter projects">
            {projectFilters.map((filter) => (
              <button
                type="button"
                key={filter}
                className={projectFilter === filter ? "active" : ""}
                aria-pressed={projectFilter === filter}
                onClick={() => setProjectFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="world-grid-list">
            {visibleProjects.map((project, index) => (
              <article className="world-card" key={project.id}>
                <a
                  className="world-visual"
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View ${project.title} source code (opens in a new tab)`}
                >
                  <img
                    src={project.image}
                    alt=""
                    width="1200"
                    height="675"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="world-number">WORLD {String(index + 1).padStart(2, "0")}</span>
                  <span className="world-open">
                    VIEW SOURCE <ExternalLink />
                  </span>
                </a>
                <div className="world-info">
                  <span className="world-status">
                    <i aria-hidden="true" />
                    {project.status}
                  </span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="world-outcome">
                    <span>OUTCOME</span>
                    {project.outcome}
                  </div>
                  <div className="tags">
                    {project.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                  <details className="project-details">
                    <summary>Explore case study</summary>
                    <div className="case-grid">
                      <div>
                        <span>ROLE</span>
                        <p>{project.role}</p>
                      </div>
                      <div>
                        <span>CHALLENGE</span>
                        <p>{project.challenge}</p>
                      </div>
                      <div className="wide">
                        <span>ARCHITECTURE</span>
                        <p>{project.architecture}</p>
                      </div>
                    </div>
                    <ul className="feature-list">
                      {project.features.map((feature) => (
                        <li key={feature}>
                          <CheckCircle2 aria-hidden="true" /> {feature}
                        </li>
                      ))}
                    </ul>
                  </details>
                  <div className="project-actions">
                    <a href={project.link} target="_blank" rel="noreferrer">
                      View repository <ExternalLink />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-pad quest" aria-labelledby="quest-title">
          <div className="quest-panel">
            <div>
              <span>NEXT MISSION</span>
              <h2 id="quest-title">
                Have a complex product problem? <em>Let’s map it.</em>
              </h2>
            </div>
            <p>
              I’m interested in full-stack and product-engineering work where sound systems thinking
              and thoughtful UX both matter.
            </p>
          </div>
        </section>

        <section className="section-pad contact-section" id="contact" aria-labelledby="contact-title">
          <div className="contact-grid">
            <div className="contact-copy">
              <p className="portal-signal">
                <i aria-hidden="true" /> COMMUNICATION PORTAL ONLINE
              </p>
              <h2 id="contact-title">
                Start a <em>conversation.</em>
              </h2>
              <p>
                Share the product, role, or problem you have in mind. I’ll reply through the email
                address you provide.
              </p>
              <div className="contact-direct">
                <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer">
                  <Github />
                  <span>
                    <small>CODE & PROJECTS</small>
                    github.com/i-am-ramprakash
                  </span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <a
                  href="https://np.linkedin.com/in/ramprakash-sah-b368a5179"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin /> LinkedIn
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-head">
                <span>SECURE MESSAGE FORM</span>
                <i>RESPONSE VIA EMAIL</i>
              </div>
              <input
                className="honeypot"
                type="text"
                name="company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <fieldset>
                <legend>QUICK START</legend>
                <div className="preset-chips">
                  {["Discuss a role", "Build a product", "Collaborate on a project"].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() =>
                        setFormData((current) => ({
                          ...current,
                          message: `${preset}: `,
                        }))
                      }
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label>
                <span>YOUR NAME</span>
                <input
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                />
              </label>
              <label>
                <span>EMAIL ADDRESS</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                />
              </label>
              <label>
                <span>
                  MESSAGE <i>{formData.message.length}/1000</i>
                </span>
                <textarea
                  required
                  rows={6}
                  minLength={20}
                  maxLength={1000}
                  value={formData.message}
                  onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                />
              </label>
              <button className="primary-btn" type="submit" disabled={formState === "sending"}>
                {formState === "sending" ? "Sending…" : "Send message"} <Send />
              </button>
              <div className="form-feedback" aria-live="polite">
                {formState === "success" && (
                  <p className="success">
                    <CheckCircle2 /> Message sent. Thank you—I’ll be in touch.
                  </p>
                )}
                {formState === "error" && (
                  <p className="error">
                    Message could not be sent. Please try again or connect on LinkedIn.
                  </p>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <b>
            RAM PRAKASH <span>SAH</span>
          </b>
          <p>Full-stack systems engineer</p>
        </div>
        <div className="footer-progress" aria-hidden="true">
          <span>BUILD</span>
          <div>
            <i style={{ width: "100%" }} />
          </div>
          <span>STABLE</span>
        </div>
        <div className="footer-links">
          <a href="https://github.com/i-am-ramprakash" target="_blank" rel="noreferrer">
            <Github /> GitHub
          </a>
          <a
            href="https://np.linkedin.com/in/ramprakash-sah-b368a5179"
            target="_blank"
            rel="noreferrer"
          >
            <Linkedin /> LinkedIn
          </a>
        </div>
        <button className="back-top" type="button" onClick={() => scrollTo("top")}>
          Back to top <ArrowUp />
        </button>
        <small>© {new Date().getFullYear()} Ram Prakash Sah. Designed and built with intent.</small>
      </footer>
    </div>
  );
};

export default MainContainer;
