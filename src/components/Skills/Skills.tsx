import React from 'react';
import * as LucideIcons from 'lucide-react';
import FloatingCard from '../3D/FloatingCard';
import ParallaxSection from '../3D/ParallaxSection';
import Carousel3D from '../3D/Carousel3D';
import { motion } from 'framer-motion';
import { skills, digitalSkills } from '../../data/portfolio';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const Skills: React.FC = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.2 });

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-12 h-12" /> : <LucideIcons.Code className="w-12 h-12" />;
  };

  const renderSkillCard = (skill: any, index: number, isActive: boolean) => (
    <FloatingCard
      className={`group bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-500 hover:shadow-2xl transform-gpu h-full w-full ${
        isActive ? 'ring-2 ring-primary-500 shadow-2xl' : ''
      }`}
      delay={0}
      intensity={isActive ? 2 : 1}
    >
      <motion.div
        whileHover={{ 
          scale: 1.2, 
          rotateY: 15,
          rotateX: 5
        }}
        className="text-primary-600 dark:text-primary-400 mb-6 transition-transform duration-300 flex justify-center"
      >
        {getIcon(skill.icon)}
      </motion.div>
      <motion.h3 
        whileHover={{ scale: 1.05 }}
        className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
      >
        {skill.name}
      </motion.h3>
      <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
        {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)} Expertise
      </p>
    </FloatingCard>
  );

  const renderTechCard = (category: any, index: number, isActive: boolean) => (
    <FloatingCard
      className={`bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-2xl group h-full w-full ${
        isActive ? 'ring-2 ring-primary-500 shadow-2xl' : ''
      }`}
      delay={0}
      intensity={isActive ? 2 : 1}
    >
      <motion.h4 
        whileHover={{ scale: 1.05 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-6 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-center"
      >
        {category.category}
      </motion.h4>
      <div className="flex flex-wrap gap-3 justify-center">
        {category.skills.map((skill: string) => (
          <motion.span
            key={skill}
            whileHover={{ scale: 1.1, y: -2 }}
            className="px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium hover:from-primary-200 hover:to-secondary-200 dark:hover:from-primary-800 dark:hover:to-secondary-800 transition-all duration-200 shadow-sm"
          >
            {skill}
          </motion.span>
        ))}
      </div>
      <div className="mt-6 text-center">
        <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto"></div>
      </div>
    </FloatingCard>
  );

  return (
    <ParallaxSection
      id="skills" 
      className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900/50 overflow-hidden"
      speed={0.4}
    >
      <div ref={ref} className="container mx-auto px-6">
        {/* Core Skills Section */}
        <div className={`text-center mb-20 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            My Skillset
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
            Navigate through my core competencies in an interactive 3D experience
          </p>
          
          <div className={`transition-all duration-700 delay-200 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Carousel3D
              items={skills}
              renderItem={renderSkillCard}
              autoPlay={true}
              autoPlayInterval={5000}
              className="mb-20"
            />
          </div>
        </div>

        {/* Technical Expertise Section */}
        <div className={`text-center transition-all duration-700 delay-500 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Technical Expertise
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            Explore my technical stack across different domains and technologies
          </p>
          
          <div className={`transition-all duration-700 delay-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Carousel3D
              items={digitalSkills}
              renderItem={renderTechCard}
              autoPlay={true}
              autoPlayInterval={6000}
            />
          </div>
        </div>

        {/* Interactive Instructions */}
        <div className={`text-center mt-16 transition-all duration-700 delay-1000 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-white/20 dark:border-gray-700/50">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              💡 <strong>Interactive Tips:</strong> Click on any card to focus, hover to explore, or let the carousel auto-rotate to see all skills!
            </p>
          </div>
        </div>
      </div>
    </ParallaxSection>
  );
};

export default Skills;