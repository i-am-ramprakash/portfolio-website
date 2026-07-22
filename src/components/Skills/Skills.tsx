import { digitalSkills } from '../../data/portfolio';

export default function Skills() {
  return <section id="skills" className="content-section section-pad skills-section">
    <div className="section-kicker"><span>02</span> CAPABILITIES / STACK</div>
    <div className="section-heading"><h2>Tools I use to<br/><em>make ideas real.</em></h2><p>A practical stack spanning the whole product lifecycle—from interface and API to data, infrastructure, and intelligent systems.</p></div>
    <div className="skill-console">
      <div className="console-top"><span/><span/><span/><b>ram@portfolio: ~/capabilities</b></div>
      <div className="skill-rows">
        {digitalSkills.map((group, index) => <div className="skill-row" key={group.category}>
          <div><span>0{index + 1}</span><h3>{group.category}</h3></div>
          <div>{group.skills.map(skill => <i key={skill}>{skill}</i>)}</div>
        </div>)}
      </div>
    </div>
  </section>;
}
