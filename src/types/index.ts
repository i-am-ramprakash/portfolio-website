export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  link?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  responsibilities: string[];
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
</parameter>