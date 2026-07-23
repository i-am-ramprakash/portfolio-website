import Marquee from "react-fast-marquee";
import {
  FaReact,
  FaNodeJs,
  FaPython,
  FaGitAlt,
  FaDocker,
} from "react-icons/fa6";
import {
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiNextdotjs,
  SiThreedotjs,
  SiGraphql,
  SiPostgresql,
} from "react-icons/si";

const techList = [
  { name: "React", icon: <FaReact /> },
  { name: "TypeScript", icon: <SiTypescript /> },
  { name: "Next.js", icon: <SiNextdotjs /> },
  { name: "Three.js", icon: <SiThreedotjs /> },
  { name: "Node.js", icon: <FaNodeJs /> },
  { name: "JavaScript", icon: <SiJavascript /> },
  { name: "Tailwind CSS", icon: <SiTailwindcss /> },
  { name: "Python", icon: <FaPython /> },
  { name: "GraphQL", icon: <SiGraphql /> },
  { name: "PostgreSQL", icon: <SiPostgresql /> },
  { name: "Git", icon: <FaGitAlt /> },
  { name: "Docker", icon: <FaDocker /> },
];

const TechStack = () => {
  return (
    <div className="techstack-section" style={{ padding: "80px 0", background: "transparent" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "50px", color: "#ffffff", fontWeight: 500, margin: 0 }}>
          My <span style={{ color: "#ff5e00" }}>Tech Stack</span>
        </h2>
      </div>

      <Marquee gradient={false} speed={50} pauseOnHover>
        {techList.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px 28px",
              margin: "0 15px",
              background: "rgba(18, 18, 22, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 94, 0, 0.25)",
              borderRadius: "100px",
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: 500,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span style={{ color: "#ff5e00", fontSize: "26px", display: "flex", alignItems: "center" }}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default TechStack;
