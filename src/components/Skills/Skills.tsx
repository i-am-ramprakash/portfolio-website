import { digitalSkills } from '../../data/portfolio';

export default function Skills() {
  return (
    <section id="skills" className="content-section section-pad skills-section">
      <div className="section-kicker">
        <span>02</span> CAPABILITIES / STACK
      </div>

      <div className="section-heading">
        <h2>
          Technologies I use to<br />
          <em>bring ideas to life.</em>
        </h2>
        <p>
          A practical engineering stack spanning web interfaces, mobile games, backend APIs, databases, and AI models.
        </p>
      </div>

      <div className="skill-console">
        <div className="console-top">
          <span />
          <span />
          <span />
          <b>ramprakash@dev-station: ~/capabilities</b>
        </div>
        <div className="skill-rows">
          {digitalSkills.map((group, index) => (
            <div className="skill-row" key={group.category}>
              <div>
                <span>0{index + 1}</span>
                <h3>{group.category}</h3>
              </div>
              <div>
                {group.skills.map(skill => (
                  <i key={skill}>{skill}</i>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
