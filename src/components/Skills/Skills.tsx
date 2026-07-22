import { useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import { digitalSkills } from '../../data/portfolio';

export default function Skills() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const handleSkillClick = (skill: string) => {
    if (selectedSkill === skill) {
      setSelectedSkill(null);
    } else {
      setSelectedSkill(skill);
      // Also scroll to projects section to see projects using this tech
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredGroups = digitalSkills.map(group => {
    const matchingSkills = group.skills.filter(s =>
      s.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...group, skills: matchingSkills };
  }).filter(group => group.skills.length > 0);

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
          Type to search any technology or click a skill badge to filter corresponding projects.
        </p>
      </div>

      {/* Interactive Skill Search Bar */}
      <div className="skill-search-wrapper">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Filter skills (e.g., React, Kotlin, Spring Boot, Firebase...)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-btn" onClick={() => setSearchTerm('')}>
            <X />
          </button>
        )}
      </div>

      <div className="skill-console">
        <div className="console-top">
          <span />
          <span />
          <span />
          <b>ramprakash@dev-station: ~/capabilities {searchTerm ? `(filtered: "${searchTerm}")` : ''}</b>
        </div>

        <div className="skill-rows">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group, index) => (
              <div className="skill-row" key={group.category}>
                <div>
                  <span>0{index + 1}</span>
                  <h3>{group.category}</h3>
                </div>
                <div>
                  {group.skills.map(skill => {
                    const isSelected = selectedSkill === skill;
                    return (
                      <i 
                        key={skill} 
                        onClick={() => handleSkillClick(skill)}
                        className={isSelected ? 'selected-skill' : ''}
                        title="Click to jump to related projects"
                        style={{ cursor: 'pointer' }}
                      >
                        {isSelected && <Check style={{ width: 12, marginRight: 4, display: 'inline' }} />}
                        {skill}
                      </i>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="skill-empty-state">
              No skills found matching "{searchTerm}".
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
