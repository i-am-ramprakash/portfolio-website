import { Project, Experience, Skill } from '../types';

export const projects: Project[] = [
  {
    id: '1',
    title: "Alzheimer's Disease Detection from MRI",
    description: "AI-powered medical diagnosis system using CNN with TensorFlow for early detection of Alzheimer's disease from brain MRI scans.",
    image: "https://images.pexels.com/photos/7089/people-coffee-tea-meeting.jpg?auto=compress&cs=tinysrgb&w=600",
    technologies: ['Python', 'TensorFlow', 'CNN', 'OpenCV'],
  },
  {
    id: '2',
    title: "Secure Cloud Storage Using Blockchain",
    description: "Decentralized cloud storage solution with blockchain technology, AES encryption, and SHA-512 integrity verification.",
    image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=600",
    technologies: ['Blockchain', 'AES', 'SHA-512', 'Node.js'],
  },
  {
    id: '3',
    title: "Java/J2EE Enterprise Web Application",
    description: "Full-stack enterprise web application built during Wipro internship with Spring Boot, Hibernate, and RESTful services.",
    image: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=600",
    technologies: ['Java', 'Spring Boot', 'Hibernate', 'REST API'],
  },
];

export const experiences: Experience[] = [
  {
    id: '1',
    title: 'Assistant System Engineer',
    company: 'Tata Consultancy Services (TCS)',
    location: 'Mumbai, India',
    period: '',
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
    period: '',
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