import React from 'react';
import FloatingCard from '../3D/FloatingCard';
import ParallaxSection from '../3D/ParallaxSection';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { experiences } from '../../data/portfolio';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const Experience: React.FC = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.3 });

  return (
    <ParallaxSection
      id="experience" 
      className="py-20 md:py-32"
      speed={0.25}
    >
      <div ref={ref} className="container mx-auto px-6">
        <div className={`text-center mb-16 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Professional Experience
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            My journey through the tech industry and the roles that shaped my expertise
          </p>
        </div>

        <div className="space-y-8">
          {experiences.map((experience, index) => (
            <FloatingCard
              key={experience.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-500 hover:shadow-xl"
              delay={index * 0.2}
              intensity={1.2}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                <div className="flex-1">
                  <motion.h3 
                    whileHover={{ scale: 1.05 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2"
                  >
                    {experience.title}
                  </motion.h3>
                  <motion.p 
                    whileHover={{ scale: 1.02 }}
                    className="text-xl font-semibold text-primary-600 dark:text-primary-400 mb-2"
                  >
                    {experience.company}
                  </motion.p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{experience.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{experience.period}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0">
                  <motion.div 
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    className="p-3 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 transition-transform duration-300"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.div>
                </div>
              </div>

              <div className="space-y-3">
                {experience.responsibilities.map((responsibility, respIndex) => (
                  <div 
                    key={respIndex}
                    className="flex items-start gap-3 group/item"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.5 }}
                      className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 mt-2 transition-transform duration-200"
                    />
                    <motion.p 
                      whileHover={{ x: 5 }}
                      className="text-gray-700 dark:text-gray-300 leading-relaxed group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors"
                    >
                      {responsibility}
                    </motion.p>
                  </div>
                ))}
              </div>
            </FloatingCard>
          ))}
        </div>
      </div>
    </ParallaxSection>
  );
};

export default Experience;