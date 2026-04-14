/**
 * Umurava Service
 * Provides mock talent profiles following the Umurava talent schema.
 * Replace with real API calls when Umurava credentials are available.
 */

export interface UmuravaTalent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  skills: string[];
  totalExperienceYears: number;
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    durationMonths: number;
    description: string;
  }[];
  education: {
    degree: string;
    field: string;
    institution: string;
    graduationYear: number;
  }[];
  portfolio: string | null;
  availability: 'immediate' | '2-weeks' | '1-month' | '3-months' | 'not-available';
  linkedIn: string | null;
  github: string | null;
  summary: string | null;
}

export interface TalentFilter {
  skills?: string[];
  minExperienceYears?: number;
  location?: string;
  availability?: string[];
}

const MOCK_TALENTS: UmuravaTalent[] = [
  {
    id: 'umu-001', name: 'Alice Mutoni', email: 'alice.mutoni@email.com', phone: '+250788000001',
    location: 'Kigali', skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'GraphQL'],
    totalExperienceYears: 5,
    experience: [
      { title: 'Senior Frontend Developer', company: 'TechCorp Africa', startDate: '2021-01', endDate: null, durationMonths: 39, description: 'Led React migration, improved performance by 40%' },
      { title: 'Frontend Developer', company: 'StartupRw', startDate: '2019-03', endDate: '2020-12', durationMonths: 21, description: 'Built e-commerce platform from scratch' },
    ],
    education: [{ degree: 'BSc', field: 'Computer Science', institution: 'University of Rwanda', graduationYear: 2019 }],
    portfolio: 'https://alicemutoni.dev', availability: 'immediate', linkedIn: 'linkedin.com/in/alicemutoni', github: 'github.com/alicemutoni',
    summary: 'Passionate frontend engineer with strong TypeScript and React skills.',
  },
  {
    id: 'umu-002', name: 'Bob Nkurunziza', email: 'bob.nk@email.com', phone: '+250788000002',
    location: 'Kigali', skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
    totalExperienceYears: 7,
    experience: [
      { title: 'Backend Engineer', company: 'FinTech Rwanda', startDate: '2020-06', endDate: null, durationMonths: 46, description: 'Designed microservices handling 100k+ daily transactions' },
      { title: 'Software Developer', company: 'Andela', startDate: '2017-01', endDate: '2020-05', durationMonths: 40, description: 'Full stack development for US clients' },
    ],
    education: [{ degree: 'BSc', field: 'Software Engineering', institution: 'KIST', graduationYear: 2016 }],
    portfolio: null, availability: '2-weeks', linkedIn: 'linkedin.com/in/bobnk', github: 'github.com/bobnk',
    summary: 'Backend specialist with deep Python expertise and cloud architecture experience.',
  },
  {
    id: 'umu-003', name: 'Claire Uwase', email: 'claire.uwase@email.com', phone: null,
    location: 'Nairobi', skills: ['React', 'Vue.js', 'JavaScript', 'CSS', 'Figma'],
    totalExperienceYears: 3,
    experience: [
      { title: 'UI/UX Developer', company: 'DesignHub Kenya', startDate: '2022-01', endDate: null, durationMonths: 27, description: 'Built design systems and React component libraries' },
      { title: 'Junior Developer', company: 'Freelance', startDate: '2021-01', endDate: '2021-12', durationMonths: 12, description: 'WordPress and React projects' },
    ],
    education: [{ degree: 'Diploma', field: 'Web Design', institution: 'Kenya Institute of Technology', graduationYear: 2020 }],
    portfolio: 'https://claireuwase.design', availability: '1-month', linkedIn: null, github: 'github.com/claireuwase',
    summary: 'Creative UI/UX developer blending design and engineering.',
  },
  {
    id: 'umu-004', name: 'David Habimana', email: 'david.h@email.com', phone: '+250788000004',
    location: 'Kigali', skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes', 'PostgreSQL'],
    totalExperienceYears: 8,
    experience: [
      { title: 'Lead Backend Engineer', company: 'MTN Rwanda', startDate: '2019-03', endDate: null, durationMonths: 61, description: 'Architected payment gateway processing 500k+ transactions/day' },
      { title: 'Java Developer', company: 'ICT Chamber', startDate: '2016-06', endDate: '2019-02', durationMonths: 32, description: 'Enterprise software solutions' },
    ],
    education: [{ degree: 'MSc', field: 'Computer Science', institution: 'Carnegie Mellon Africa', graduationYear: 2016 }],
    portfolio: null, availability: '3-months', linkedIn: 'linkedin.com/in/davidh', github: null,
    summary: 'Senior Java engineer with expertise in large-scale distributed systems.',
  },
  {
    id: 'umu-005', name: 'Eva Ingabire', email: 'eva.ingabire@email.com', phone: '+250788000005',
    location: 'Kigali', skills: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Node.js', 'Prisma'],
    totalExperienceYears: 4,
    experience: [
      { title: 'Full Stack Developer', company: 'Irembo', startDate: '2021-09', endDate: null, durationMonths: 31, description: 'Built government e-services platform serving 2M citizens' },
      { title: 'Frontend Developer', company: 'Klab Africa', startDate: '2020-01', endDate: '2021-08', durationMonths: 19, description: 'Mentored developers and built internal tools' },
    ],
    education: [{ degree: 'BSc', field: 'Information Technology', institution: 'UR College of Science & Technology', graduationYear: 2019 }],
    portfolio: 'https://evaingabire.dev', availability: 'immediate', linkedIn: 'linkedin.com/in/evaingabire', github: 'github.com/evaingabire',
    summary: 'Full stack developer specializing in Next.js and modern web apps.',
  },
  {
    id: 'umu-006', name: 'Frank Mugisha', email: 'frank.mugisha@email.com', phone: null,
    location: 'Kampala', skills: ['Android', 'Kotlin', 'Java', 'Firebase', 'REST APIs'],
    totalExperienceYears: 5,
    experience: [
      { title: 'Mobile Developer', company: 'SafeBoda', startDate: '2020-04', endDate: null, durationMonths: 48, description: 'Developed ride-hailing app with 1M+ downloads' },
      { title: 'Android Developer', company: 'Outbox Uganda', startDate: '2019-01', endDate: '2020-03', durationMonths: 14, description: 'Built fintech mobile apps' },
    ],
    education: [{ degree: 'BSc', field: 'Computer Engineering', institution: 'Makerere University', graduationYear: 2018 }],
    portfolio: null, availability: '2-weeks', linkedIn: 'linkedin.com/in/frankmugisha', github: 'github.com/frankmugisha',
    summary: 'Mobile engineer focused on high-performance Android applications.',
  },
  {
    id: 'umu-007', name: 'Grace Nyiransabimana', email: 'grace.n@email.com', phone: '+250788000007',
    location: 'Kigali', skills: ['Data Science', 'Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Tableau'],
    totalExperienceYears: 4,
    experience: [
      { title: 'Data Scientist', company: 'Rwanda Development Board', startDate: '2021-07', endDate: null, durationMonths: 33, description: 'ML models for economic forecasting and policy analysis' },
      { title: 'Data Analyst', company: 'BPR Atlas Mara', startDate: '2020-01', endDate: '2021-06', durationMonths: 17, description: 'Credit risk analysis and dashboards' },
    ],
    education: [{ degree: 'MSc', field: 'Data Science', institution: 'African Institute for Mathematical Sciences', graduationYear: 2019 }],
    portfolio: 'https://grace-ds.github.io', availability: '1-month', linkedIn: 'linkedin.com/in/gracen', github: 'github.com/gracen',
    summary: 'Data scientist bridging ML and business intelligence for impact-driven organizations.',
  },
  {
    id: 'umu-008', name: 'Henry Nzabonimana', email: 'henry.nz@email.com', phone: '+250788000008',
    location: 'Kigali', skills: ['DevOps', 'AWS', 'Terraform', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    totalExperienceYears: 6,
    experience: [
      { title: 'DevOps Engineer', company: 'Airtel Rwanda', startDate: '2020-02', endDate: null, durationMonths: 50, description: 'Managed cloud infrastructure for 5M subscribers' },
      { title: 'Systems Administrator', company: 'RwandAir', startDate: '2018-01', endDate: '2020-01', durationMonths: 24, description: 'Server management and network administration' },
    ],
    education: [{ degree: 'BSc', field: 'Network Engineering', institution: 'INES Ruhengeri', graduationYear: 2017 }],
    portfolio: null, availability: '2-weeks', linkedIn: 'linkedin.com/in/henrynz', github: 'github.com/henrynz',
    summary: 'Cloud infrastructure specialist with AWS certifications and Kubernetes expertise.',
  },
  {
    id: 'umu-009', name: 'Irene Mukamana', email: 'irene.m@email.com', phone: null,
    location: 'Dar es Salaam', skills: ['React Native', 'TypeScript', 'Redux', 'Node.js', 'Firebase'],
    totalExperienceYears: 3,
    experience: [
      { title: 'React Native Developer', company: 'Jumo Tanzania', startDate: '2022-03', endDate: null, durationMonths: 25, description: 'Cross-platform fintech app for microloans' },
      { title: 'Junior Mobile Developer', company: 'Freelance', startDate: '2021-01', endDate: '2022-02', durationMonths: 13, description: 'Various React Native projects' },
    ],
    education: [{ degree: 'BSc', field: 'Computer Science', institution: 'University of Dar es Salaam', graduationYear: 2020 }],
    portfolio: 'https://irenem.dev', availability: 'immediate', linkedIn: null, github: 'github.com/irenem',
    summary: 'Mobile developer passionate about building inclusive financial tools.',
  },
  {
    id: 'umu-010', name: 'James Kagabo', email: 'james.k@email.com', phone: '+250788000010',
    location: 'Kigali', skills: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'Redis', 'RabbitMQ'],
    totalExperienceYears: 5,
    experience: [
      { title: 'Backend Developer', company: 'Umwalimu SACCO', startDate: '2021-01', endDate: null, durationMonths: 39, description: 'Built core banking APIs processing millions in daily transactions' },
      { title: 'Node.js Developer', company: 'Digital Umuganda', startDate: '2019-06', endDate: '2020-12', durationMonths: 18, description: 'Built community civic engagement platforms' },
    ],
    education: [{ degree: 'BSc', field: 'Software Engineering', institution: 'University of Rwanda', graduationYear: 2019 }],
    portfolio: null, availability: '2-weeks', linkedIn: 'linkedin.com/in/jamesk', github: 'github.com/jamesk',
    summary: 'Backend engineer specializing in financial systems and message queues.',
  },
  {
    id: 'umu-011', name: 'Karen Uwimana', email: 'karen.uw@email.com', phone: '+250788000011',
    location: 'Kigali', skills: ['Product Management', 'Agile', 'Jira', 'Figma', 'SQL', 'User Research'],
    totalExperienceYears: 6,
    experience: [
      { title: 'Product Manager', company: 'Equity Bank Rwanda', startDate: '2020-09', endDate: null, durationMonths: 43, description: 'Led digital banking product with 300k active users' },
      { title: 'Business Analyst', company: 'Access Bank', startDate: '2018-01', endDate: '2020-08', durationMonths: 31, description: 'Requirements gathering and process optimization' },
    ],
    education: [{ degree: 'MBA', field: 'Technology Management', institution: 'University of Rwanda Business School', graduationYear: 2018 }],
    portfolio: null, availability: '3-months', linkedIn: 'linkedin.com/in/karenuw', github: null,
    summary: 'Product manager with deep banking domain knowledge and strong user focus.',
  },
  {
    id: 'umu-012', name: 'Leon Manzi', email: 'leon.manzi@email.com', phone: null,
    location: 'Kigali', skills: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'TypeScript'],
    totalExperienceYears: 2,
    experience: [
      { title: 'Full Stack Developer', company: 'Norrsken Kigali', startDate: '2023-01', endDate: null, durationMonths: 15, description: 'Built startup incubator management platform' },
    ],
    education: [{ degree: 'BSc', field: 'Computer Science', institution: 'ALU Rwanda', graduationYear: 2022 }],
    portfolio: 'https://leonmanzi.dev', availability: 'immediate', linkedIn: 'linkedin.com/in/leonmanzi', github: 'github.com/leonmanzi',
    summary: 'Recent graduate with strong project portfolio and fast learning curve.',
  },
  {
    id: 'umu-013', name: 'Marie Umutoni', email: 'marie.um@email.com', phone: '+250788000013',
    location: 'Kigali', skills: ['iOS', 'Swift', 'Objective-C', 'Xcode', 'Firebase', 'REST APIs'],
    totalExperienceYears: 5,
    experience: [
      { title: 'iOS Developer', company: 'Bank of Kigali', startDate: '2020-05', endDate: null, durationMonths: 47, description: 'BK App serving 500k+ customers' },
      { title: 'iOS Developer', company: 'Freelance', startDate: '2019-01', endDate: '2020-04', durationMonths: 15, description: 'iOS apps for local SMEs' },
    ],
    education: [{ degree: 'BSc', field: 'Information Systems', institution: 'INES Ruhengeri', graduationYear: 2018 }],
    portfolio: null, availability: '1-month', linkedIn: 'linkedin.com/in/marieumutoni', github: 'github.com/marieumutoni',
    summary: 'iOS specialist with banking domain expertise.',
  },
  {
    id: 'umu-014', name: 'Nathan Bizimana', email: 'nathan.biz@email.com', phone: '+250788000014',
    location: 'Kigali', skills: ['Cybersecurity', 'Penetration Testing', 'SIEM', 'Python', 'Networking', 'SOC'],
    totalExperienceYears: 7,
    experience: [
      { title: 'Cybersecurity Analyst', company: 'National Bank of Rwanda', startDate: '2019-09', endDate: null, durationMonths: 55, description: 'Secured critical financial infrastructure, zero major incidents' },
      { title: 'IT Security Officer', company: 'Rwanda Information Society Authority', startDate: '2017-01', endDate: '2019-08', durationMonths: 31, description: 'National cybersecurity policy implementation' },
    ],
    education: [{ degree: 'BSc', field: 'Information Security', institution: 'Carnegie Mellon Africa', graduationYear: 2016 }],
    portfolio: null, availability: '3-months', linkedIn: 'linkedin.com/in/nathanbiz', github: null,
    summary: 'Cybersecurity professional with experience in financial sector protection.',
  },
  {
    id: 'umu-015', name: 'Olive Nishimwe', email: 'olive.n@email.com', phone: null,
    location: 'Kigali', skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'User Research', 'Prototyping', 'CSS'],
    totalExperienceYears: 4,
    experience: [
      { title: 'UX Designer', company: 'mPharma Rwanda', startDate: '2021-06', endDate: null, durationMonths: 34, description: 'Redesigned pharmacy platform improving conversion by 35%' },
      { title: 'Junior UX Designer', company: 'Klab Africa', startDate: '2020-01', endDate: '2021-05', durationMonths: 16, description: 'UX research and wireframing' },
    ],
    education: [{ degree: 'BA', field: 'Industrial Design', institution: 'IPRC Kigali', graduationYear: 2019 }],
    portfolio: 'https://olivenishimwe.design', availability: 'immediate', linkedIn: 'linkedin.com/in/olivenishimwe', github: null,
    summary: 'User-centered designer with a track record of measurable UX improvements.',
  },
];

export async function getTalents(filters: TalentFilter = {}): Promise<UmuravaTalent[]> {
  let results = [...MOCK_TALENTS];

  if (filters.skills && filters.skills.length > 0) {
    results = results.filter(t =>
      filters.skills!.some(s =>
        t.skills.some(ts => ts.toLowerCase().includes(s.toLowerCase()))
      )
    );
  }

  if (filters.minExperienceYears !== undefined) {
    results = results.filter(t => t.totalExperienceYears >= filters.minExperienceYears!);
  }

  if (filters.location) {
    results = results.filter(t =>
      t.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  if (filters.availability && filters.availability.length > 0) {
    results = results.filter(t => filters.availability!.includes(t.availability));
  }

  return results;
}

export async function getTalentById(id: string): Promise<UmuravaTalent | null> {
  return MOCK_TALENTS.find(t => t.id === id) || null;
}
