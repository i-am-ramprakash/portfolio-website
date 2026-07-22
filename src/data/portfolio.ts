import { Project, Experience, Skill } from '../types';

export const projects: Project[] = [
  {
    id: '1',
    title: "Alzheimer's Disease Detection from MRI",
    description: "AI-powered medical diagnosis system using CNN with TensorFlow for early detection of Alzheimer's disease from brain MRI scans.",
    image: "/projects/alzheimers-mri.jpg",
    technologies: ['Python', 'TensorFlow', 'CNN', 'OpenCV'],
    link: 'https://github.com/i-am-ramprakash/Alzheimer-s-Disease-Detection-from-MRI',
    role: 'Machine Learning Engineer',
    status: 'Research prototype',
    outcome: 'Created an end-to-end MRI classification workflow for experimentation, from image preparation through model inference.',
  },
  {
    id: '2',
    title: "Secure Cloud Storage Using Blockchain",
    description: "Decentralized cloud storage solution with blockchain technology, AES encryption, and SHA-512 integrity verification.",
    image: "/projects/blockchain-storage.jpg",
    technologies: ['Blockchain', 'AES', 'SHA-512', 'Node.js'],
    link: 'https://github.com/i-am-ramprakash/Enhancing-Security-of-Data-in-Cloud-Storage-using-Decentralized-Block-chain',
    role: 'Full-Stack & Security Developer',
    status: 'Academic prototype',
    outcome: 'Combined client-side encryption, integrity verification, and decentralized storage concepts in one working system.',
  },
  {
    id: '3',
    title: "Java/J2EE Enterprise Web Application",
    description: "Full-stack enterprise web application built during Wipro internship with Spring Boot, Hibernate, and RESTful services.",
    image: "/projects/airline-booking.jpg",
    technologies: ['Java', 'Spring Boot', 'Hibernate', 'REST API'],
    link: 'https://github.com/i-am-ramprakash/Airline-Booking-System',
    role: 'Java Full-Stack Developer',
    status: 'Enterprise training project',
    outcome: 'Modeled a complete booking workflow with maintainable service boundaries, persistence, and RESTful integrations.',
  },
  {
    id: '4',
    title: "Space Ludo — Android Sci-Fi Board Game",
    description: "Sci-fi themed Ludo board game featuring Jetpack Compose native shell, HTML5 Canvas game rendering, power-ups system, and real-time Firebase multiplayer.",
    image: "/projects/space-ludo.jpg",
    technologies: ['Kotlin', 'Jetpack Compose', 'HTML5/Canvas', 'JavaScript', 'Firebase'],
    link: 'https://github.com/i-am-ramprakash/kids-fun-ludo',
    role: 'Android & Game Engine Developer',
    status: 'Completed application',
    outcome: 'Engineered a hybrid Android WebView/Canvas game system featuring custom haptics, multiple game modes, AI opponents, and real-time multiplayer.',
  },
  {
    id: '5',
    title: "DeutschSpaß — German Language Platform",
    description: "CEFR-aligned Goethe exam preparation platform with structured unit roadmaps, timed mock exams, Spaced Repetition (SRS) vocabulary review, and gamification.",
    image: "/projects/german-learning.jpg",
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Supabase'],
    link: 'https://github.com/i-am-ramprakash/German-Language-Learning-App-UI',
    role: 'Frontend Architect & UI Developer',
    status: 'Full-stack web platform',
    outcome: 'Designed and built an institutional paper-inspired learning system with automated curriculum ingestion, exam readiness tracking, and speech synthesis.',
  },
  {
    id: '6',
    title: "MuTu — LDR Relationship Companion",
    description: "Private, zero-knowledge encrypted companion app for long-distance couples with WebRTC video calling, Gemini AI love assistant, memory wall, and live event sync.",
    image: "/projects/ldr-app.jpg",
    technologies: ['React', 'TypeScript', 'Express', 'Firebase Firestore', 'WebRTC', 'Gemini AI'],
    link: 'https://github.com/i-am-ramprakash/mutu-for-couple',
    role: 'Full-Stack Developer & Security Architect',
    status: 'Live web service',
    outcome: 'Created a secure LDR app with client-side zero-knowledge encryption, Gemini AI relationship insights, WebRTC video calling, and instant WebSocket media synchronization.',
  },
];

export const experiences: Experience[] = [
  {
    id: '1',
    title: 'Assistant System Engineer',
    company: 'Tata Consultancy Services (TCS)',
    location: 'Mumbai, India',
    period: 'Mar 2023 – Dec 2024',
    responsibilities: [
      'Feature enhancement for banking software systems',
      'Business requirements analysis and solution design',
      'Application development and quality assurance',
      'Database maintenance and optimization',
    ],
  },
  {
    id: '2',
    title: 'Full-Stack Developer',
    company: 'Mentor Friends Pvt. Ltd.',
    location: 'Kathmandu, Nepal',
    period: 'Mar 2025 – Present',
    responsibilities: [
      'Developed multi-vendor marketplace using FreeSchema',
      'Built dynamic UI components and dashboards',
      'Integrated event systems and role-based workflows',
      'Implemented seller collaboration features',
    ],
  },
];

export const skills: Skill[] = [
  { id: '1', name: 'Frontend Development', icon: 'Monitor', category: 'frontend' },
  { id: '2', name: 'Backend Development', icon: 'Server', category: 'backend' },
  { id: '3', name: 'UI/UX Design', icon: 'Palette', category: 'design' },
  { id: '4', name: 'Database Management', icon: 'Database', category: 'database' },
  { id: '5', name: 'Cloud & DevOps', icon: 'Cloud', category: 'devops' },
  { id: '6', name: 'Data Visualization', icon: 'BarChart3', category: 'data' },
  { id: '7', name: '3D Graphics', icon: 'Box', category: 'graphics' },
  { id: '8', name: 'API Development', icon: 'Zap', category: 'api' },
];

export const digitalSkills = [
  {
    category: 'Frontend',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Angular'],
  },
  {
    category: 'Backend',
    skills: ['Node.js', 'Java', 'Spring Boot', 'Python', 'Express.js'],
  },
  {
    category: 'Database',
    skills: ['MySQL', 'MongoDB', 'PostgreSQL', 'Redis'],
  },
  {
    category: 'Tools & Technologies',
    skills: ['Git', 'Docker', 'AWS', 'Firebase', 'Webpack', 'Vite'],
  },
  {
    category: 'Data Science',
    skills: ['Pandas', 'NumPy', 'TensorFlow', 'Scikit-learn', 'Jupyter'],
  },
  {
    category: 'Design',
    skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
  },
];
