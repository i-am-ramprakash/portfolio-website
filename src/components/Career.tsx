import "./styles/Career.css";
import { experiences } from "../data/portfolio";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {experiences.map((exp) => (
            <div className="career-info-box" key={exp.id}>
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{exp.title}</h4>
                  <h5>{exp.company}</h5>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{exp.location}</span>
                </div>
                <h3 style={{ fontSize: "24px" }}>{exp.period}</h3>
              </div>
              <div>
                <p style={{ width: "100%", marginBottom: "10px" }}>{exp.objective}</p>
                <ul style={{ paddingLeft: "18px", margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                  {exp.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
