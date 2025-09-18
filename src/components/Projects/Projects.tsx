import React from 'react';
import FloatingCard from '../3D/FloatingCard';
import ParallaxSection from '../3D/ParallaxSection';
import { motion } from 'framer-motion';
import { Github, Share2, MessageCircle, Twitter, Linkedin, Facebook } from 'lucide-react';
import { projects } from '../../data/portfolio';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { Project } from '../../types'; // Adjust the import path if needed

const Projects: React.FC = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const shareProject = (project: Project, platform: string) => {
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent(`Check out this amazing project: ${project.title} by Ramprakash Sah`);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  return (
    <ParallaxSection
      id="projects" 
      className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900/50"
      speed={0.3}
    >
      <div ref={ref} className="container mx-auto px-6">
        <div className={`text-center mb-16 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Real-world applications that showcase my technical skills and problem-solving abilities
          </p>
        </div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <FloatingCard
              key={project.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-500 hover:shadow-2xl"
              delay={index * 0.2}
              intensity={1.4}
            >
              <div className="relative overflow-hidden">
                <motion.img 
                  src={project.image} 
                  alt={project.title}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              <div className="p-6">
                <motion.h3 
                  whileHover={{ scale: 1.05 }}
                  className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                >
                  {project.title}
                </motion.h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <motion.span
                      key={tech}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <motion.a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    View Code
                  </motion.a>
                  
                  <div className="relative group/share">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </motion.button>
                    
                    {/* Share dropdown */}
                    <div className="absolute bottom-full left-0 right-0 mb-2 opacity-0 group-hover/share:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/share:translate-y-0 pointer-events-none group-hover/share:pointer-events-auto">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 flex gap-2">
                        <motion.button
                          onClick={() => shareProject(project, 'whatsapp')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                          title="Share on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          onClick={() => shareProject(project, 'twitter')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          title="Share on Twitter"
                        >
                          <Twitter className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          onClick={() => shareProject(project, 'linkedin')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          title="Share on LinkedIn"
                        >
                          <Linkedin className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          onClick={() => shareProject(project, 'facebook')}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          title="Share on Facebook"
                        >
                          <Facebook className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FloatingCard>
          ))}
        </div>
      </div>
    </ParallaxSection>
  );
};

export default Projects;