import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash password for fake users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Fake profiles with specific skills, interests, and discovery fields
  // NOTE: Some users share the same book/game/skill to test "Same Interests" feature
  const fakeUsers = [
    {
      email: 'sarah.python@collabia.ma',
      name: 'Sarah El Amrani',
      password: hashedPassword,
      school: 'ENSAM Casablanca',
      location: 'Casablanca',
      bio: 'Building AI-powered SaaS products',
      skills: ['Python', 'Machine Learning', 'Django'],
      interests: ['SAAS', 'Startups', 'AI'],
      openToCofounder: true,
      openToProjects: true,
      schoolVerified: true,
      // Discovery fields
      currentBook: 'Zero to One',
      currentGame: 'Valorant',
      currentSkill: 'Machine Learning',
      whatImBuilding: 'AI-powered study assistant for Moroccan students',
      lookingFor: 'cofounder',
    },
    {
      email: 'youssef.java@collabia.ma',
      name: 'Youssef Benali',
      password: hashedPassword,
      school: 'INPT Rabat',
      location: 'Rabat',
      bio: 'Full-stack developer passionate about startups',
      skills: ['Java', 'Spring Boot', 'React'],
      interests: ['Startups', 'Web Development', 'Entrepreneurship'],
      openToProjects: true,
      openToStudyPartner: true,
      schoolVerified: true,
      // Discovery fields - same book as Sarah!
      currentBook: 'Zero to One',
      currentGame: 'League of Legends',
      currentSkill: 'System Design',
      whatImBuilding: 'E-commerce platform for local artisans',
      lookingFor: 'team',
    },
    {
      email: 'fatima.art@collabia.ma',
      name: 'Fatima Zahra',
      password: hashedPassword,
      school: 'ESAV Marrakech',
      location: 'Marrakech',
      bio: 'UI/UX designer & digital artist',
      skills: ['Art', 'Figma', 'Illustration'],
      interests: ['UI/UX', 'Design', 'Startups'],
      openToHelpingOthers: true,
      openToProjects: true,
      schoolVerified: true,
      // Discovery fields - same game as Sarah!
      currentBook: 'The Design of Everyday Things',
      currentGame: 'Valorant',
      currentSkill: 'Motion Design',
      whatImBuilding: 'Design system for Moroccan startups',
      lookingFor: 'freelance',
    },
    {
      email: 'mehdi.python@collabia.ma',
      name: 'Mehdi Idrissi',
      password: hashedPassword,
      school: 'ENSAM Casablanca',
      location: 'Casablanca',
      bio: 'Data scientist building SaaS tools',
      skills: ['Python', 'Data Science', 'TensorFlow'],
      interests: ['SAAS', 'AI', 'Machine Learning'],
      openToCofounder: true,
      schoolVerified: true,
      // Discovery fields - same skill as Sarah!
      currentBook: 'Deep Learning',
      currentGame: 'CS:GO',
      currentSkill: 'Machine Learning',
      whatImBuilding: 'Predictive analytics for agriculture',
      lookingFor: 'cofounder',
    },
    {
      email: 'leila.uiux@collabia.ma',
      name: 'Leila Mansouri',
      password: hashedPassword,
      school: 'ENSA Tangier',
      location: 'Tangier',
      bio: 'Product designer for tech startups',
      skills: ['Art', 'UI/UX', 'Product Design'],
      interests: ['UI/UX', 'Startups', 'Design Thinking'],
      openToProjects: true,
      openToHelpingOthers: true,
      schoolVerified: true,
      // Discovery fields
      currentBook: 'The Design of Everyday Things',
      currentGame: 'Valorant',
      currentSkill: 'Figma Advanced',
      whatImBuilding: 'Design mentorship platform',
      lookingFor: 'learn',
    },
    {
      email: 'omar.java@collabia.ma',
      name: 'Omar Alaoui',
      password: hashedPassword,
      school: 'EMSI Casablanca',
      location: 'Casablanca',
      bio: 'Backend engineer, startup enthusiast',
      skills: ['Java', 'Python', 'Microservices'],
      interests: ['Startups', 'SAAS', 'Tech'],
      openToCofounder: true,
      openToProjects: true,
      schoolVerified: false,
      // Discovery fields - same book as Sarah & Youssef!
      currentBook: 'Zero to One',
      currentGame: 'FIFA 24',
      currentSkill: 'Kubernetes',
      whatImBuilding: 'DevOps automation tool for startups',
      lookingFor: 'team',
    },
    {
      email: 'imane.art@collabia.ma',
      name: 'Imane Benjelloun',
      password: hashedPassword,
      school: 'ESAV Marrakech',
      location: 'Marrakech',
      bio: 'Creative director & visual artist',
      skills: ['Art', 'Graphic Design', 'Branding'],
      interests: ['UI/UX', 'Art', 'Creativity'],
      openToHelpingOthers: true,
      schoolVerified: true,
      // Discovery fields
      currentBook: 'Steal Like an Artist',
      currentGame: 'Valorant',
      currentSkill: 'Blender 3D',
      whatImBuilding: 'NFT art collection',
      lookingFor: 'freelance',
    },
    {
      email: 'amine.python@collabia.ma',
      name: 'Amine Chakir',
      password: hashedPassword,
      school: 'INPT Rabat',
      location: 'Rabat',
      bio: 'Full-stack dev, SaaS builder',
      skills: ['Python', 'JavaScript', 'FastAPI'],
      interests: ['SAAS', 'Startups', 'Web3'],
      openToCofounder: true,
      openToProjects: true,
      schoolVerified: true,
      // Discovery fields - same skill as Sarah & Mehdi!
      currentBook: 'The Lean Startup',
      currentGame: 'League of Legends',
      currentSkill: 'Machine Learning',
      whatImBuilding: 'AI chatbot for customer support',
      lookingFor: 'cofounder',
    },
    {
      email: 'sophia.java@collabia.ma',
      name: 'Sophia Rami',
      password: hashedPassword,
      school: 'ENSAM Casablanca',
      location: 'Casablanca',
      bio: 'Software engineer, startup co-founder',
      skills: ['Java', 'Kotlin', 'Android'],
      interests: ['Startups', 'Mobile Dev', 'Entrepreneurship'],
      openToCofounder: true,
      schoolVerified: true,
      // Discovery fields
      currentBook: 'The Lean Startup',
      currentGame: 'Genshin Impact',
      currentSkill: 'Flutter',
      whatImBuilding: 'Mobile app for freelancers',
      lookingFor: 'team',
    },
    {
      email: 'yasmine.uiux@collabia.ma',
      name: 'Yasmine Tazi',
      password: hashedPassword,
      school: 'ENSA Fes',
      location: 'Fes',
      bio: 'UX researcher & product designer',
      skills: ['Art', 'UI/UX', 'User Research'],
      interests: ['UI/UX', 'SAAS', 'Product Design'],
      openToProjects: true,
      openToStudyPartner: true,
      schoolVerified: true,
      // Discovery fields - same game as Youssef & Amine!
      currentBook: 'Hooked',
      currentGame: 'League of Legends',
      currentSkill: 'User Research',
      whatImBuilding: 'UX case study platform',
      lookingFor: 'learn',
    },
  ];

  // Create or update fake users
  for (const userData of fakeUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: userData,
      });
      console.log(`✓ Created user: ${userData.name}`);
    } else {
      // Update existing user with new discovery fields
      await prisma.user.update({
        where: { email: userData.email },
        data: {
          currentBook: userData.currentBook,
          currentGame: userData.currentGame,
          currentSkill: userData.currentSkill,
          whatImBuilding: userData.whatImBuilding,
          lookingFor: userData.lookingFor,
        },
      });
      console.log(`↻ Updated user with discovery fields: ${userData.name}`);
    }
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
