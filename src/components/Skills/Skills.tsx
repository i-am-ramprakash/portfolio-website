import { useMemo, useState } from 'react';
import { Database, GitBranch, MonitorSmartphone, Search, Server, Sparkles, X } from 'lucide-react';
import { digitalSkills, projects } from '../../data/portfolio';

const icons = [Server, MonitorSmartphone, Database, GitBranch, Sparkles];

export default function Skills() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const groups = useMemo(() => digitalSkills.map(group => ({ ...group, skills: group.skills.filter(skill => skill.toLowerCase().includes(search.toLowerCase())) })).filter(group => group.skills.length), [search]);
  const related = selected ? projects.filter(project => project.technologies.some(tech => tech.toLowerCase().includes(selected.toLowerCase()) || selected.toLowerCase().includes(tech.toLowerCase()))) : [];
  return <section id="skills" className="content-section section-pad" aria-labelledby="skills-title">
    <div className="section-kicker"><span>02</span> SKILL TREE — CAPABILITIES</div>
    <div className="section-heading"><h2 id="skills-title">Tools connected by<br /><em>real product work.</em></h2><p>Explore a branch, then select a node to see where it appears in the project worlds.</p></div>
    <div className="skill-search"><Search /><label className="sr-only" htmlFor="skill-filter">Filter skills</label><input id="skill-filter" value={search} onChange={event => setSearch(event.target.value)} placeholder="Filter the skill tree…" />{search && <button onClick={() => setSearch('')} aria-label="Clear filter"><X /></button>}</div>
    <div className="skill-tree">{groups.map((group, index) => { const Icon = icons[index] ?? Sparkles; return <article className="skill-branch" key={group.category}><header><span><Icon /></span><div><small>BRANCH 0{index + 1}</small><h3>{group.category}</h3></div></header><div className="skill-nodes">{group.skills.map(skill => <button key={skill} className={selected === skill ? 'active' : ''} aria-pressed={selected === skill} onClick={() => setSelected(selected === skill ? null : skill)}><i />{skill}</button>)}</div></article>; })}</div>
    <div className="skill-detail" aria-live="polite"><span>SELECTED NODE</span>{selected ? <><b>{selected}</b><p>{related.length ? `Used in: ${related.map(project => project.title).join(', ')}` : 'A supporting capability used across product and delivery work.'}</p></> : <p>Select any skill node to reveal its project connections.</p>}</div>
  </section>;
}
