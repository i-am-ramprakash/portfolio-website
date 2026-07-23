import "./styles/Work.css";
import WorkImage from "./WorkImage";
import { projects } from "../data/portfolio";

const Work = () => {
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map((proj, index) => (
            <div className="work-box" key={proj.id}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>
                  <div>
                    <h4>{proj.title}</h4>
                    <p>{proj.role}</p>
                  </div>
                </div>
                <h4>Technologies</h4>
                <p>{proj.technologies.join(", ")}</p>
                <p style={{ marginTop: "8px", fontSize: "13px", color: "#cbd5e1" }}>{proj.description}</p>
              </div>
              <WorkImage image={proj.image} alt={proj.title} link={proj.link} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
