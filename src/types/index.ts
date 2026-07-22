export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  link?: string;
  role: string;
  status: string;
  outcome: string;
  challenge: string;
  features: string[];
  architecture: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  responsibilities: string[];
  technologies: string[];
  objective: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
