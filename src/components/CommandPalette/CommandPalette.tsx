import { useEffect, useState } from 'react';
import { Search, X, Moon, Sun, ArrowUpRight, Code, User, Briefcase, Mail, FolderGit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../../data/portfolio';
import { Project } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  onSelectProject: (project: Project) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  isDark,
  toggleTheme,
  onSelectProject,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else { setQuery(''); }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    onClose();
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.technologies.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="command-palette-backdrop" onClick={onClose}>
          <motion.div 
            className="command-palette-dialog"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="command-search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Type a command or search projects... (Press Esc to close)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              <button className="close-btn" onClick={onClose} aria-label="Close">
                <X />
              </button>
            </div>

            <div className="command-list">
              {/* Quick Navigation Section */}
              {query === '' && (
                <div className="command-group">
                  <span className="command-group-title">Navigation</span>
                  <button className="command-item" onClick={() => scrollTo('about')}>
                    <User /> Go to About & Profile
                  </button>
                  <button className="command-item" onClick={() => scrollTo('skills')}>
                    <Code /> Go to Capabilities & Stack
                  </button>
                  <button className="command-item" onClick={() => scrollTo('experience')}>
                    <Briefcase /> Go to Career Timeline
                  </button>
                  <button className="command-item" onClick={() => scrollTo('projects')}>
                    <FolderGit2 /> Go to Projects Showcase
                  </button>
                  <button className="command-item" onClick={() => scrollTo('contact')}>
                    <Mail /> Go to Contact
                  </button>
                </div>
              )}

              {/* Actions Section */}
              {query === '' && (
                <div className="command-group">
                  <span className="command-group-title">Preferences</span>
                  <button className="command-item" onClick={() => { toggleTheme(); }}>
                    {isDark ? <Sun /> : <Moon />} Toggle Color Mode ({isDark ? 'Switch to Light' : 'Switch to Dark'})
                  </button>
                </div>
              )}

              {/* Projects Section */}
              <div className="command-group">
                <span className="command-group-title">
                  {query === '' ? 'Featured Projects' : `Projects Matching "${query}"`}
                </span>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <button
                      key={project.id}
                      className="command-item"
                      onClick={() => {
                        onClose();
                        onSelectProject(project);
                      }}
                    >
                      <FolderGit2 style={{ color: 'var(--accent)' }} />
                      <div className="command-item-copy">
                        <b>{project.title}</b>
                        <small>{project.technologies.slice(0, 3).join(', ')}</small>
                      </div>
                      <ArrowUpRight style={{ marginLeft: 'auto', width: 14 }} />
                    </button>
                  ))
                ) : (
                  <div className="command-empty">No matching projects found.</div>
                )}
              </div>
            </div>

            <div className="command-footer">
              <span><b>ESC</b> to exit</span>
              <span><b>↑↓</b> to navigate</span>
              <span><b>ENTER</b> to select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
