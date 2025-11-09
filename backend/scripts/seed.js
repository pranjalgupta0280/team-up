const seedUsers = [
  // College: iitr.com
  {
    name: 'Alice Johnson',
    email: 'alice@iitr.com',
    password: 'password123',
    year: 3,
    branch: 'Computer Science',
    skills: ['JavaScript', 'React', 'Node.js'],
    roles: ['Fullstack', 'Frontend'],
    bio: 'Passionate fullstack developer from IITR',
    collegeDomain: 'iitr.com',
    isVerified: true
  },
  {
    name: 'Bob Smith',
    email: 'bob@iitr.com', 
    password: 'password123',
    year: 2,
    branch: 'Information Technology',
    skills: ['Python', 'Machine Learning'],
    roles: ['ML Engineer'],
    bio: 'ML enthusiast from IITR',
    collegeDomain: 'iitr.com',
    isVerified: true
  },

  // College: iiit.com
  {
    name: 'Carol Davis',
    email: 'carol@iiit.com',
    password: 'password123',
    year: 4,
    branch: 'Design',
    skills: ['UI/UX Design', 'Figma'],
    roles: ['Designer'],
    bio: 'UI/UX designer from IIIT',
    collegeDomain: 'iiit.com',
    isVerified: true
  },
  {
    name: 'David Wilson',
    email: 'david@iiit.com',
    password: 'password123', 
    year: 3,
    branch: 'Computer Science',
    skills: ['Java', 'Spring Boot', 'SQL'],
    roles: ['Backend'],
    bio: 'Backend specialist from IIIT',
    collegeDomain: 'iiit.com',
    isVerified: true
  },

  // College: mit.com
  {
    name: 'Eva Brown',
    email: 'eva@mit.com',
    password: 'password123',
    year: 1,
    branch: 'Electrical Engineering', 
    skills: ['C++', 'Embedded Systems'],
    roles: ['Developer'],
    bio: 'Embedded systems enthusiast from MIT',
    collegeDomain: 'mit.com',
    isVerified: true
  }
];

const seedPosts = [
  // Posts from iitr.com college
  {
    title: 'Need ML Engineer for Hackathon - IITR',
    description: 'Looking for ML engineer from IITR for upcoming hackathon.',
    competitionType: 'hackathon',
    requiredRoles: [{ role: 'ML Engineer', count: 1 }],
    requiredSkills: ['Python', 'Machine Learning'],
    collegeDomain: 'iitr.com',
    expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  
  // Posts from iiit.com college  
  {
    title: 'Frontend Developer Needed - IIIT',
    description: 'Seeking frontend developer from IIIT for web project.',
    competitionType: 'project',
    requiredRoles: [{ role: 'Frontend', count: 2 }],
    requiredSkills: ['React', 'JavaScript'],
    collegeDomain: 'iiit.com',
    expireAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },

  // Posts from mit.com college
  {
    title: 'Hardware Project Team - MIT', 
    description: 'Forming team for embedded systems project at MIT.',
    competitionType: 'project',
    requiredRoles: [{ role: 'Developer', count: 3 }],
    requiredSkills: ['C++', 'Embedded Systems'],
    collegeDomain: 'mit.com',
    expireAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  }
];