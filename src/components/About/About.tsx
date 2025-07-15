// import React, { useRef } from 'react';
import FloatingCard from '../3D/FloatingCard';
import ParallaxSection from '../3D/ParallaxSection';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const About: React.FC = () => {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.3 });

  return (
    <ParallaxSection
      id="about" 
      className="py-20 md:py-32 relative"
      speed={0.3}
    >
      <div ref={ref} className="container mx-auto px-6">
        <div className={`text-center mb-16 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About Me
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            My passion lies in creating beautiful, functional, and user-centered digital solutions
          </p>
        </div>
        
        <FloatingCard 
          className={`bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 dark:border-gray-700 grid md:grid-cols-5 gap-12 items-center transition-all duration-700 delay-200 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          delay={0.2}
          intensity={1.2}
        >
          <div className="md:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-float"></div>
              <img 
                src="Myanime.gif" 
                alt="Ramprakash Sah Portrait" 
                className="relative w-48 h-48 md:w-full md:h-auto mx-auto rounded-full md:rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>
          
          <div className="md:col-span-3 space-y-6">
            <div className="prose prose-lg text-gray-700 dark:text-gray-300">
              <p className="text-lg leading-relaxed">
                Hello! I'm <span className="font-semibold text-primary-600 dark:text-primary-400">Ramprakash Sah</span>, 
                a multidisciplinary developer and designer with a keen eye for detail and a love for solving complex problems. 
                With over 3+ years of experience in the industry, I specialize in bringing ideas to life through clean code and intuitive design.
              </p>
              
              <p className="text-lg leading-relaxed">
                My approach is collaborative and user-focused. I believe the best products are built not just with technical expertise, 
                but with a deep understanding of the end-user's needs. From initial concept to final deployment, I am dedicated to 
                crafting experiences that are not only visually appealing but also accessible and highly performant.
              </p>
              
              <p className="text-lg leading-relaxed">
                When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, 
                or hiking in the mountains seeking inspiration for my next creative endeavor.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {['Problem Solver', 'Creative Thinker', 'Team Player', 'Tech Enthusiast'].map((trait, index) => (
                <span 
                  key={trait}
                  className={`px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium transition-all duration-300 delay-${index * 100}`}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </FloatingCard>
      </div>
    </ParallaxSection>
  );
};

export default About;