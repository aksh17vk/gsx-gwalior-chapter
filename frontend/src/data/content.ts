/** Site copy, links and event dates. */

export type SectionId = 'top' | 'about' | 'whatwedo' | 'events' | 'gallery' | 'join'

export type SectionMeta = {
  id: SectionId
  /** Two-digit index used in the nav, index rules, section map and footer. */
  index: string
  /** Short nav label. */
  label: string
  /** Label inside the index rule, e.g. "WHO WE ARE". */
  ruleLabel: string
}

/** Indexed sections (the hero is 00 and is not listed in navigation). */
export const sections: readonly SectionMeta[] = [
  { id: 'about', index: '01', label: 'About', ruleLabel: 'Who we are' },
  { id: 'whatwedo', index: '02', label: 'What we do', ruleLabel: 'What we do' },
  { id: 'events', index: '03', label: 'Events', ruleLabel: 'Events' },
  { id: 'gallery', index: '04', label: 'Gallery', ruleLabel: 'Gallery' },
  { id: 'join', index: '05', label: 'Join', ruleLabel: 'Join' },
] as const

export const sectionTotal = String(sections.length).padStart(2, '0')

export const site = {
  name: 'GSX Gwalior Chapter',
  shortName: 'GSX Gwalior',
  wordmark: 'GSX Gwalior Chapter',
  campus: 'MITS-DU, Gwalior',
  institution: 'MITS-DU',
  title: 'GSX Gwalior Chapter — MITS-DU',
  description:
    'GSX Gwalior Chapter — the hub for builders, creators, and contributors at MITS-DU Gwalior. We build. We deploy. We contribute.',
  url: 'https://gsx-gwalior.vercel.app/',
  links: {
    linkedin: 'https://www.linkedin.com/company/gsx-gwalior-chapter/',
    instagram: 'https://www.instagram.com/gsxgwaliorchapter',
    /** WhatsApp / Discord invite — supplied by the chapter. The members'-group row is hidden until set. */
    joinGroup: null as string | null,
  },
  /** FAQ ships only with client-approved answers. */
  faq: null as null | { q: string; a: string }[],
} as const

export const hero = {
  indexLine: { index: '00', label: 'MITS-DU · Gwalior' },
  titleTop: 'GSX',
  titleBottom: 'GWALIOR',
  srTitle: 'GSX Gwalior',
  metaLine: 'Student-led tech community · MITS-DU',
  lead: 'The hub for builders, creators, and contributors at MITS-DU Gwalior. We build. We deploy. We contribute.',
  primaryCta: { label: 'Join the chapter', target: 'join' as SectionId },
  secondaryCta: { label: 'Explore events', target: 'events' as SectionId },
  nextUp: { prefix: 'Next up', todayPrefix: 'Today', register: 'Register' },
} as const

export const marqueeTerms = [
  'Design Sprints',
  'CTF Challenges',
  'Networking',
  'Mentorship',
  'Hackathons',
  'Workshops',
  'Tech Talks',
  'Open Source',
] as const

export const about = {
  headingLead: 'Built for the ones who',
  headingWord: 'build.',
  paragraphs: [
    'GSX Gwalior is a student-led technology community at MITS-DU Gwalior, built to bridge the gap between academic learning and real-world engineering. We create a space where students can learn, build, connect, and grow through hands-on experiences.',
    'From open-source contributions, competitive coding, and emerging technologies to real-world projects, hackathons, design, startup ideation, peer learning, and industry interaction, GSX brings together students with different interests and skill levels.',
    "Whether you're a beginner exploring technology, a developer building projects, a creative mind, or someone passionate about community and innovation — GSX Gwalior is a place to turn curiosity into creation and ideas into impact.",
  ],
} as const

export type Stat = { value: number; suffix?: string; display?: string; label: string; note?: string }
export const stats: Stat[] = [
  { value: 60, suffix: '+', label: 'Members' },
  { value: 4, display: '04', label: 'Pillars', note: 'workshops · hackathons · community · industry' },
  { value: 1, display: '03 Oct 2026', label: 'First event' },
]

export type Feature = { id: string; index: string; title: string; description: string }
export const features: Feature[] = [
  {
    id: 'technical',
    index: '01',
    title: 'Technical Excellence',
    description:
      'Competitive programming, hackathons, dev sprints — we push technical limits and celebrate engineering craft.',
  },
  {
    id: 'community',
    index: '02',
    title: 'Community First',
    description:
      'A tight-knit family of curious minds. We mentor, collaborate, and grow together across all branches and years.',
  },
  {
    id: 'ship',
    index: '03',
    title: 'Ship Real Things',
    description: 'We build products, not just projects. Members leave with portfolios, not just certificates.',
  },
  {
    id: 'industry',
    index: '04',
    title: 'Industry Connect',
    description: 'Guest talks, internship networks, and partnerships that bridge campus with the real tech world.',
  },
]

export const whatWeDo = {
  heading: 'Building the future,',
  headingAccent: 'together.',
  subtitle:
    'From hands-on workshops to competitive hackathons, everything at GSX is crafted to turn curiosity into real-world engineering capability.',
  storyPrefix: 'you can',
  /** All seven verbs, original order. */
  verbs: ['design.', 'prototype.', 'solve.', 'build.', 'develop.', 'cook.', 'ship.'] as const,
  /** verb index -> pillar index */
  verbToPillar: [0, 0, 1, 1, 2, 3, 3] as const,
  stepLabel: 'Step',
} as const

export type Pillar = {
  id: string
  index: string
  title: string
  description: string
  tags: string[]
  icon: 'terminal' | 'rocket' | 'users' | 'handshake'
  /** Verbs shown in the mobile sticky sub-heading for this pillar. */
  verbs: string[]
}
export const pillars: Pillar[] = [
  {
    id: 'workshops',
    index: '01',
    icon: 'terminal',
    title: 'Workshops & Bootcamps',
    description:
      'Intensive, hands-on sessions on Git, GitHub, AI/ML, web development, and emerging tech — led by peers and industry professionals to bridge the gap between theory and practice.',
    tags: ['Git & GitHub', 'Agentic AI', 'Web Development'],
    verbs: ['design.', 'prototype.'],
  },
  {
    id: 'hackathons',
    index: '02',
    icon: 'rocket',
    title: 'Hackathons & Dev Sprints',
    description:
      '48-hour build marathons and competitive coding events where teams ideate, prototype, and ship real products — pushing creative and technical boundaries under pressure.',
    tags: ['48h Sprints', 'Rapid Prototyping', 'Product Shipping'],
    verbs: ['solve.', 'build.'],
  },
  {
    id: 'community',
    index: '03',
    icon: 'users',
    title: 'Community & Mentorship',
    description:
      'A tight-knit network of builders across all branches and years. We run peer mentoring circles, study groups, and open office hours to help every member level up.',
    tags: ['Peer Circles', 'Study Groups', 'Office Hours'],
    verbs: ['develop.'],
  },
  {
    id: 'industry',
    index: '04',
    icon: 'handshake',
    title: 'Industry & Open Source',
    description:
      'Guest talks from tech leaders, internship pipelines, and collaborative open-source projects that give members real-world experience and industry-ready portfolios.',
    tags: ['Open Source PRs', 'Tech Talks', 'Career Pipelines'],
    verbs: ['cook.', 'ship.'],
  },
]

export type Event = {
  slug: string
  title: string
  badge: string
  description: string
  /** ISO 8601 with the IST offset. */
  start: string
  end: string
  venue: string
  venueShort: string
  registerUrl: string
  recapUrl: string
  serial: string
  tags: string[]
}
export const events: Event[] = [
  {
    slug: 'gsx-commit-1-0',
    title: 'GSX Commit 1.0',
    badge: 'Inaugural event',
    description:
      'The inaugural event of GSX Gwalior, featuring hands-on sessions on Git, GitHub, and Agentic AI — learn the tools and workflows used by modern builders to build and ship projects together.',
    start: '2026-10-03T10:00:00+05:30',
    end: '2026-10-03T13:00:00+05:30',
    venue: 'MITS-DU, Gwalior',
    venueShort: 'MITS-DU',
    registerUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSf98MjrMb0FOey76Ttg51WTkQ3xWWkgU8Qxj4LBFt4spo92pA/viewform?usp=header',
    recapUrl: 'https://www.instagram.com/gsxgwaliorchapter',
    serial: 'GSX-26-001',
    tags: ['Git & GitHub', 'Agentic AI', 'Hands-on'],
  },
]

export const eventsCopy = {
  headingUpcoming: 'Next up.',
  headingPast: 'Latest event.',
  chipPast: 'Past event',
  chipToday: 'Today',
  register: 'Register now',
  addToCalendar: 'Add to calendar',
  recap: 'See the recap',
  admit: 'Admit one',
  qrRegister: 'Scan to register',
  qrRecap: 'Scan for the recap',
  moreEvents: 'More events are announced on Instagram first',
} as const

export const gallery = {
  label: 'Gallery',
  title: 'GSX COMMIT 1.0 GLIMPSES',
  lead: 'A look back at the moments, people, and ideas that brought our first chapter event to life.',
  photos: [
    { src: '/gallery/commit-1/01.jpeg', alt: 'Opening ceremony' },
    { src: '/gallery/commit-1/02.jpeg', alt: 'Guest facilitation (Dr. Mir Shahnawaz Ahmad)' },
    { src: '/gallery/commit-1/03.jpeg', alt: 'Guest facilitation (Dr. Arun Kumar)' },
    { src: '/gallery/commit-1/04.jpeg', alt: 'Guest facilitation (Dr. Vibha Tiwari)' },
    { src: '/gallery/commit-1/05.jpeg', alt: 'Guest facilitation (Dr. Neelam Arya)' },
    { src: '/gallery/commit-1/06.jpeg', alt: 'Core team announcement' },
    { src: '/gallery/commit-1/07.jpeg', alt: 'Ganesh vandana' },
    { src: '/gallery/commit-1/08.jpeg', alt: 'What is GSX?' },
    { src: '/gallery/commit-1/09.jpeg', alt: 'AI Agents & Agentic AI Workshop' },
    { src: '/gallery/commit-1/10.jpeg', alt: 'Git & GitHub Workshop' },
    { src: '/gallery/commit-1/11.jpeg', alt: 'Jamming session' },
    { src: '/gallery/commit-1/12.jpeg', alt: 'Team GSX-GWL' },
  ],
} as const

export const join = {
  heading: 'Join the community',
  closingLine: 'Open to every branch and year.',
  steps: {
    register: {
      title: 'Register for GSX Commit 1.0',
      description: 'Hands-on Git, GitHub & Agentic AI · 3 Oct, 10:00 IST',
      pastDescription: 'Watch for the next event — announced on Instagram first.',
      link: 'Register',
    },
    follow: {
      title: 'Follow the channels',
      description: 'Events and updates are posted on LinkedIn and Instagram first.',
    },
    show: {
      title: 'Show up and build',
      description: 'First session is 3 October at MITS-DU. No prior experience needed — bring curiosity.',
    },
    group: {
      title: "Join the members' group",
      description: 'Announcements, help and build partners, all in one place.',
      link: 'Open invite',
    },
  },
  stub: {
    label: 'Member · GSX Gwalior',
    title: 'Join the chapter',
    line: 'Open to all branches and years at MITS-DU.',
    ctaGroup: 'Join the chapter',
    ctaRegister: 'Register for Commit 1.0',
    followLinkedin: 'Follow on LinkedIn',
    followInstagram: 'Follow on Instagram',
    serial: 'GSX-26-YOU',
    qrRegister: 'Scan to register',
    qrGroup: 'Scan to join',
  },
} as const

export const footer = {
  wordmark: 'GSX',
  tagline: 'We build. We ship. We grow.',
  line: 'Student-led tech community at MITS-DU, Gwalior.',
  sectionsLabel: 'Sections',
  followLabel: 'Follow',
  stamp: 'Gwalior · MITS-DU · Est. 2026',
  copyright: (year: number) => `© ${year} GSX Gwalior Chapter — MITS-DU. All rights reserved.`,
  backToTop: 'Back to top',
} as const
