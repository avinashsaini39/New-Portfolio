export const profile = {
  name: 'Avinash Saini',
  role: 'Full-Stack Developer',
  tagline: ['React.js', 'Node.js', 'TypeScript'],
  location: 'Kota, Rajasthan, India',
  phone: '+91-8107707411',
  email: 'avinashsaini39@gmail.com',
  linkedin: 'https://linkedin.com/in/avinash-saini',
  github: 'https://github.com/avinashsaini39',
  resume: '/resume.pdf',
  summary:
    'Full-Stack Developer with 2+ years of experience building SaaS products with React, TypeScript, and Node.js. Currently working on EasySocial.io, a WhatsApp automation and CRM platform, across the React front end and Node.js services. Comfortable taking a feature from UI through API to database.',
}

export const stats = [
  { value: 2, suffix: '+', label: 'years shipping SaaS' },
  { value: 100, suffix: '+', label: 'businesses on EasySocial.io' },
  { value: 95, suffix: '+', label: 'Lighthouse performance' },
  { value: 20, suffix: '+', label: 'checks per SEO audit' },
]

export type Job = {
  role: string
  company: string
  location: string
  period: string
  points: string[]
  stack: string[]
}

export const experience: Job[] = [
  {
    role: 'Frontend Developer',
    company: 'EvolveNext Technologies Pvt. Ltd.',
    location: 'Bengaluru, Karnataka',
    period: 'Apr 2025 – Present',
    points: [
      'Build and maintain features for EasySocial.io, a B2B SaaS platform for WhatsApp automation, CRM, and campaign management used by 100+ businesses.',
      'Created reusable UI components with React.js, TypeScript, MUI, and SCSS shared across product modules, keeping the UI consistent and cutting duplicated code.',
      'Developed chatbot flow automation, audience segmentation, and campaign analytics features across the React front end and Node.js APIs.',
      'Built an internal HR automation service in Node.js: parses leave-request emails with the Gemini API, sends them to managers on Discord with approve/reject buttons, and tracks leave status and employee records.',
      'Built a multi-stage content generation pipeline using LLM APIs to produce SEO articles in bulk.',
    ],
    stack: ['React', 'TypeScript', 'MUI', 'SCSS', 'Node.js', 'Gemini API', 'Discord.js'],
  },
  {
    role: 'MERN Stack Developer',
    company: 'Saumic Craft',
    location: 'Jaipur, Rajasthan',
    period: 'Mar 2024 – Dec 2024',
    points: [
      'Built a CRM platform on the MERN stack with role-based access control for Admin, Manager, and Client users, covering client records and task workflows.',
      'Improved API response times by rewriting slow MongoDB queries and adding indexes.',
    ],
    stack: ['MongoDB', 'Express.js', 'React', 'Node.js'],
  },
  {
    role: 'Frontend Developer Intern',
    company: 'SRV IT Solutions',
    location: 'Kota, Rajasthan',
    period: 'Nov 2023 – Feb 2024',
    points: [
      'Built 10+ responsive pages from Figma designs using React.js, HTML5, CSS3, and JavaScript.',
      'Added lazy loading and code splitting to improve load times, bringing pages to 95+ Lighthouse performance scores.',
    ],
    stack: ['React', 'HTML5', 'CSS3', 'Figma'],
  },
]

export type Project = {
  title: string
  blurb: string
  points: string[]
  stack: string[]
  link?: string
}

export const projects: Project[] = [
  {
    title: 'AI Video Ad Generator',
    blurb:
      'An end-to-end platform for brands to create ad and promotional videos: enter product and brand details, generate a script, review it, then render the final video.',
    points: [
      'Generates ad scripts with LLM APIs using a hook → problem → solution → call-to-action structure, tuned to brand tone, audience, and video length.',
      'Workflow modeled as tracked stages (brief, script, scenes, render) in PostgreSQL via an AdonisJS API, so any step can be edited and regenerated without starting over.',
    ],
    stack: ['React (Vite)', 'AdonisJS', 'PostgreSQL', 'Tailwind CSS'],
  },
  {
    title: 'SEO Analyzer Platform',
    blurb:
      'An SEO audit tool that crawls pages with Playwright, runs 20+ checks, and produces a scored report for each site.',
    points: [
      'Crawl jobs queued with BullMQ + Redis, with retries and priorities so multiple sites are crawled in parallel.',
      'Audit results stored as PostgreSQL JSONB for flexible reporting.',
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Playwright'],
  },
  {
    title: 'Instagram Growth Analyzer',
    blurb:
      'Collects public engagement data (followers, likes, comments) from Instagram profiles and tracks it over time.',
    points: [
      'Classifies accounts as growing, stagnant, or declining based on follower and engagement trends.',
      'Trends and classifications surfaced in a React dashboard.',
    ],
    stack: ['Node.js', 'Playwright', 'React.js'],
  },
]

export const skills: { group: string; items: string[] }[] = [
  { group: 'Languages', items: ['TypeScript', 'JavaScript (ES6+)', 'HTML5', 'CSS3'] },
  { group: 'Frontend', items: ['React.js', 'Vite', 'Next.js', 'Redux', 'MUI', 'Tailwind CSS', 'SCSS'] },
  { group: 'Backend', items: ['Node.js', 'Express.js', 'AdonisJS', 'REST APIs'] },
  { group: 'Databases', items: ['MongoDB', 'PostgreSQL', 'Redis'] },
  { group: 'Cloud & DevOps', items: ['AWS (EC2, S3)', 'Docker', 'Git', 'CI/CD', 'Linux'] },
  { group: 'Automation & AI', items: ['Playwright', 'Puppeteer', 'BullMQ', 'Gemini API', 'Discord.js'] },
  { group: 'Tools', items: ['Jira', 'Figma', 'Postman'] },
]

export const education = [
  {
    degree: 'M.Tech – Computer Science and Engineering',
    school: 'Career Point University, Kota, Rajasthan',
    period: '2022 – 2024',
    score: '89.02%',
  },
]

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]
