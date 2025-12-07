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

  // Structured interest data for seeding
  const structuredInterests: Record<string, {
    book?: { title: string; totalPages: number; pagesRead: number; status: string };
    skill?: { name: string; level: string; notes?: string };
    game?: { name: string; rank?: string; frequency?: string };
  }> = {
    'sarah.python@collabia.ma': {
      book: { title: 'Zero to One', totalPages: 224, pagesRead: 150, status: 'reading' },
      skill: { name: 'Machine Learning', level: 'intermediate', notes: 'Working through Coursera ML course' },
      game: { name: 'Valorant', rank: 'Gold 2', frequency: 'weekly' },
    },
    'youssef.java@collabia.ma': {
      book: { title: 'Zero to One', totalPages: 224, pagesRead: 80, status: 'reading' },
      skill: { name: 'System Design', level: 'beginner', notes: 'Preparing for interviews' },
      game: { name: 'League of Legends', rank: 'Platinum', frequency: 'daily' },
    },
    'fatima.art@collabia.ma': {
      book: { title: 'The Design of Everyday Things', totalPages: 368, pagesRead: 368, status: 'completed' },
      skill: { name: 'Motion Design', level: 'advanced' },
      game: { name: 'Valorant', rank: 'Silver 3', frequency: 'occasionally' },
    },
    'mehdi.python@collabia.ma': {
      book: { title: 'Deep Learning', totalPages: 800, pagesRead: 250, status: 'reading' },
      skill: { name: 'Machine Learning', level: 'advanced', notes: 'Building real ML projects' },
      game: { name: 'CS:GO', rank: 'DMG', frequency: 'weekly' },
    },
    'leila.uiux@collabia.ma': {
      book: { title: 'The Design of Everyday Things', totalPages: 368, pagesRead: 200, status: 'reading' },
      skill: { name: 'Figma Advanced', level: 'intermediate' },
      game: { name: 'Valorant', rank: 'Bronze', frequency: 'occasionally' },
    },
    'omar.java@collabia.ma': {
      book: { title: 'Zero to One', totalPages: 224, pagesRead: 224, status: 'completed' },
      skill: { name: 'Kubernetes', level: 'beginner', notes: 'Learning K8s fundamentals' },
      game: { name: 'FIFA 24', rank: 'Div 4', frequency: 'daily' },
    },
    'imane.art@collabia.ma': {
      book: { title: 'Steal Like an Artist', totalPages: 160, pagesRead: 100, status: 'paused' },
      skill: { name: 'Blender 3D', level: 'intermediate' },
      game: { name: 'Valorant', rank: 'Gold 1', frequency: 'weekly' },
    },
    'amine.python@collabia.ma': {
      book: { title: 'The Lean Startup', totalPages: 336, pagesRead: 180, status: 'reading' },
      skill: { name: 'Machine Learning', level: 'beginner', notes: 'Just getting started with ML' },
      game: { name: 'League of Legends', rank: 'Diamond', frequency: 'daily' },
    },
    'sophia.java@collabia.ma': {
      book: { title: 'The Lean Startup', totalPages: 336, pagesRead: 336, status: 'completed' },
      skill: { name: 'Flutter', level: 'intermediate' },
      game: { name: 'Genshin Impact', frequency: 'occasionally' },
    },
    'yasmine.uiux@collabia.ma': {
      book: { title: 'Hooked', totalPages: 256, pagesRead: 50, status: 'reading' },
      skill: { name: 'User Research', level: 'advanced', notes: 'Leading UX research projects' },
      game: { name: 'League of Legends', rank: 'Silver', frequency: 'weekly' },
    },
  };

  // Create or update fake users
  for (const userData of fakeUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    let userId: string;

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: userData,
      });
      userId = newUser.id;
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
      userId = existingUser.id;
      console.log(`↻ Updated user with discovery fields: ${userData.name}`);
    }

    // Add structured interests for this user
    const interests = structuredInterests[userData.email];
    if (interests) {
      // Create structured book
      if (interests.book) {
        const existingBook = await prisma.currentBook.findUnique({
          where: { userId },
        });
        if (!existingBook) {
          await prisma.currentBook.create({
            data: {
              userId,
              title: interests.book.title,
              totalPages: interests.book.totalPages,
              pagesRead: interests.book.pagesRead,
              status: interests.book.status,
            },
          });
          console.log(`  📖 Added structured book for ${userData.name}`);
        }
      }

      // Create structured skill
      if (interests.skill) {
        const existingSkill = await prisma.currentSkill.findUnique({
          where: { userId },
        });
        if (!existingSkill) {
          await prisma.currentSkill.create({
            data: {
              userId,
              name: interests.skill.name,
              level: interests.skill.level,
              notes: interests.skill.notes || null,
            },
          });
          console.log(`  🎯 Added structured skill for ${userData.name}`);
        }
      }

      // Create structured game
      if (interests.game) {
        const existingGame = await prisma.currentGame.findUnique({
          where: { userId },
        });
        if (!existingGame) {
          await prisma.currentGame.create({
            data: {
              userId,
              name: interests.game.name,
              rank: interests.game.rank || null,
              frequency: interests.game.frequency || null,
            },
          });
          console.log(`  🎮 Added structured game for ${userData.name}`);
        }
      }
    }
  }

  // ============================================
  // SEED POSTS LINKED TO INTERESTS
  // ============================================
  console.log('\n📝 Creating posts linked to interests...');

  // Posts about "Zero to One" book
  const zeroToOnePosts = [
    {
      email: 'sarah.python@collabia.ma',
      title: 'Chapter 7 of Zero to One blew my mind!',
      description: 'The concept of "secrets" - things that are true but that most people don\'t know or agree with. This is exactly how I\'m thinking about my AI study assistant. What secrets have you discovered?',
      tags: ['Zero to One', 'Startups', 'Books'],
      interestType: 'book',
      interestValue: 'Zero to One',
      progressSnapshot: 150,
    },
    {
      email: 'youssef.java@collabia.ma',
      title: 'Looking for Zero to One reading buddy',
      description: 'Just started this book and loving it! Anyone else reading it? Would love to discuss chapters together and share insights.',
      tags: ['Zero to One', 'Book Club', 'Startups'],
      interestType: 'book',
      interestValue: 'Zero to One',
      progressSnapshot: 80,
    },
    {
      email: 'omar.java@collabia.ma',
      title: 'Finished Zero to One - Key takeaways',
      description: 'Finally finished! My top 3 takeaways: 1) Competition is for losers 2) Start small and monopolize 3) Sales matter as much as product. Happy to discuss with anyone reading it!',
      tags: ['Zero to One', 'Book Review', 'Entrepreneurship'],
      interestType: 'book',
      interestValue: 'Zero to One',
      progressSnapshot: 224,
    },
  ];

  // Posts about "Machine Learning" skill
  const mlPosts = [
    {
      email: 'sarah.python@collabia.ma',
      title: 'Need ML study partner for Andrew Ng course',
      description: 'Going through the Coursera ML specialization. Looking for someone to work through the assignments together and discuss concepts.',
      tags: ['Machine Learning', 'Study Partner', 'Coursera'],
      interestType: 'skill',
      interestValue: 'Machine Learning',
    },
    {
      email: 'mehdi.python@collabia.ma',
      title: 'Building a crop prediction model - need feedback',
      description: 'Working on an ML model for predicting crop yields. Using TensorFlow and historical weather data. Would love to connect with other ML practitioners for code review.',
      tags: ['Machine Learning', 'TensorFlow', 'Agriculture'],
      interestType: 'skill',
      interestValue: 'Machine Learning',
    },
    {
      email: 'amine.python@collabia.ma',
      title: 'ML beginner - resources recommendations?',
      description: 'Just starting my ML journey! What resources helped you the most? Books, courses, projects?',
      tags: ['Machine Learning', 'Learning', 'Resources'],
      interestType: 'skill',
      interestValue: 'Machine Learning',
    },
  ];

  // Posts about "Valorant" game
  const valorantPosts = [
    {
      email: 'fatima.art@collabia.ma',
      title: 'Valorant team for casual games?',
      description: 'Looking for chill people to play Valorant with on weekends. Silver/Gold rank, just want to have fun and improve together!',
      tags: ['Valorant', 'Gaming', 'Team'],
      interestType: 'game',
      interestValue: 'Valorant',
    },
    {
      email: 'leila.uiux@collabia.ma',
      title: 'Any Valorant players who also do design?',
      description: 'Would be cool to find people who play Valorant AND work in design/tech. Gaming + networking = perfect combo!',
      tags: ['Valorant', 'Design', 'Networking'],
      interestType: 'game',
      interestValue: 'Valorant',
    },
    {
      email: 'imane.art@collabia.ma',
      title: 'Valorant fan art project collaboration',
      description: 'I\'m creating a series of Valorant agent illustrations. Looking for other artists to collaborate on a community art project!',
      tags: ['Valorant', 'Art', 'Collaboration'],
      interestType: 'game',
      interestValue: 'Valorant',
    },
  ];

  // Posts about "League of Legends" game
  const lolPosts = [
    {
      email: 'youssef.java@collabia.ma',
      title: 'LoL ranked grind - LF duo partner',
      description: 'Plat player looking for a duo partner to climb to Diamond. I main ADC, prefer a support duo. Serious but fun vibes only!',
      tags: ['League of Legends', 'Ranked', 'Duo'],
      interestType: 'game',
      interestValue: 'League of Legends',
    },
    {
      email: 'amine.python@collabia.ma',
      title: 'Diamond player offering coaching',
      description: 'Happy to help lower elo players improve! Can do VOD reviews or live coaching. DM me your op.gg and we can set something up.',
      tags: ['League of Legends', 'Coaching', 'Improvement'],
      interestType: 'game',
      interestValue: 'League of Legends',
    },
  ];

  // Posts about "The Design of Everyday Things" book
  const designBookPosts = [
    {
      email: 'fatima.art@collabia.ma',
      title: 'Just finished Design of Everyday Things!',
      description: 'This book changed how I see the world. Now I notice bad door handles everywhere! Anyone else read it and want to discuss UX principles?',
      tags: ['Design', 'UX', 'Books'],
      interestType: 'book',
      interestValue: 'The Design of Everyday Things',
      progressSnapshot: 368,
    },
    {
      email: 'leila.uiux@collabia.ma',
      title: 'Applying Norman\'s principles to my project',
      description: 'Reading Design of Everyday Things and trying to apply affordances and signifiers to my design mentorship platform. Would love feedback!',
      tags: ['Design', 'UX', 'Product'],
      interestType: 'book',
      interestValue: 'The Design of Everyday Things',
      progressSnapshot: 200,
    },
  ];

  const allPosts = [
    ...zeroToOnePosts,
    ...mlPosts,
    ...valorantPosts,
    ...lolPosts,
    ...designBookPosts,
  ];

  for (const postData of allPosts) {
    const user = await prisma.user.findUnique({
      where: { email: postData.email },
    });

    if (user) {
      // Check if post already exists (by title and author)
      const existingPost = await prisma.post.findFirst({
        where: {
          authorId: user.id,
          title: postData.title,
        },
      });

      if (!existingPost) {
        await prisma.post.create({
          data: {
            title: postData.title,
            description: postData.description,
            tags: postData.tags,
            authorId: user.id,
            interestType: postData.interestType,
            interestValue: postData.interestValue,
            progressSnapshot: postData.progressSnapshot || null,
          },
        });
        console.log(`  ✓ Created post: "${postData.title.substring(0, 40)}..."`);
      } else {
        console.log(`  ↻ Post already exists: "${postData.title.substring(0, 40)}..."`);
      }
    }
  }

  // ============================================
  // SEED INTEREST POSTS (NEW SYSTEM)
  // ============================================
  console.log('\n💬 Creating interest posts (new system)...');

  const interestPostsData = [
    // Posts about "Zero to One" book
    {
      email: 'sarah.python@collabia.ma',
      type: 'book',
      interestValue: 'Zero to One',
      content: 'Just finished Chapter 7 and the concept of "secrets" is mind-blowing! Things that are true but most people don\'t know or agree with. This is exactly how I\'m approaching my AI study assistant startup. What secrets have you discovered in your journey?',
      progressSnapshot: 150,
    },
    {
      email: 'youssef.java@collabia.ma',
      type: 'book',
      interestValue: 'Zero to One',
      content: 'Starting this book and already hooked! The first chapter about progress being 0 to 1 (creating something new) vs 1 to n (copying) really resonated. Anyone want to be reading buddies?',
      progressSnapshot: 80,
    },
    {
      email: 'omar.java@collabia.ma',
      type: 'book',
      interestValue: 'Zero to One',
      content: 'Finished Zero to One! My top 3 takeaways:\n\n1. Competition is for losers - find your monopoly\n2. Start small and dominate a niche\n3. Sales matter as much as product\n\nHappy to discuss with anyone reading it!',
      progressSnapshot: 224,
    },

    // Posts about "Machine Learning" skill
    {
      email: 'sarah.python@collabia.ma',
      type: 'skill',
      interestValue: 'Machine Learning',
      content: 'Week 3 of Andrew Ng\'s ML course and neural networks are finally clicking! Anyone else going through this? Would love a study buddy to discuss the math behind backpropagation.',
    },
    {
      email: 'mehdi.python@collabia.ma',
      type: 'skill',
      interestValue: 'Machine Learning',
      content: 'Just deployed my first ML model to production! It\'s a crop yield prediction system using TensorFlow. The journey from Jupyter notebook to production was wild. Happy to share learnings!',
    },
    {
      email: 'amine.python@collabia.ma',
      type: 'skill',
      interestValue: 'Machine Learning',
      content: 'Starting my ML journey today! Any recommendations for a complete beginner? Should I start with Python basics or dive straight into sklearn?',
    },

    // Posts about "Valorant" game
    {
      email: 'fatima.art@collabia.ma',
      type: 'game',
      interestValue: 'Valorant',
      content: 'Looking for chill people to play Valorant with on weekends! I\'m Silver/Gold rank, just want to have fun and maybe improve together. No toxic vibes please! 🎮',
    },
    {
      email: 'leila.uiux@collabia.ma',
      type: 'game',
      interestValue: 'Valorant',
      content: 'Any Valorant players here who also work in design/tech? Would be cool to find people for gaming + networking sessions. Best of both worlds!',
    },
    {
      email: 'imane.art@collabia.ma',
      type: 'game',
      interestValue: 'Valorant',
      content: 'Working on a Valorant agent illustration series! Looking for other artists to collaborate on a community art project. DM if interested! 🎨',
    },
    {
      email: 'sarah.python@collabia.ma',
      type: 'game',
      interestValue: 'Valorant',
      content: 'Gold 2 and stuck! Any tips for ranking up as a solo queue player? I main Sage and Killjoy. The grind is real 😅',
    },

    // Posts about "League of Legends" game
    {
      email: 'youssef.java@collabia.ma',
      type: 'game',
      interestValue: 'League of Legends',
      content: 'Plat ADC main looking for a support duo to climb to Diamond! Prefer someone who can play engage supports. Let\'s grind together!',
    },
    {
      email: 'amine.python@collabia.ma',
      type: 'game',
      interestValue: 'League of Legends',
      content: 'Diamond player here! Happy to do free VOD reviews for anyone trying to improve. Just send me your op.gg and a replay file. Love helping people climb!',
    },
    {
      email: 'yasmine.uiux@collabia.ma',
      type: 'game',
      interestValue: 'League of Legends',
      content: 'New to LoL and honestly overwhelmed by all the champions! Any recommendations for beginner-friendly champions? I like playing support.',
    },

    // Posts about "The Design of Everyday Things" book
    {
      email: 'fatima.art@collabia.ma',
      type: 'book',
      interestValue: 'The Design of Everyday Things',
      content: 'This book changed how I see the world! Now I notice bad door handles EVERYWHERE. The concept of affordances is so powerful. Anyone else experiencing this "design awakening"?',
      progressSnapshot: 368,
    },
    {
      email: 'leila.uiux@collabia.ma',
      type: 'book',
      interestValue: 'The Design of Everyday Things',
      content: 'Reading Norman\'s book and trying to apply affordances and signifiers to my design mentorship platform. The chapter on mapping is especially relevant. Would love feedback on my designs!',
      progressSnapshot: 200,
    },

    // Posts about "The Lean Startup" book
    {
      email: 'amine.python@collabia.ma',
      type: 'book',
      interestValue: 'The Lean Startup',
      content: 'The Build-Measure-Learn loop is so simple yet so hard to implement properly. Anyone else struggling with the "measure" part? How do you decide which metrics actually matter?',
      progressSnapshot: 180,
    },
    {
      email: 'sophia.java@collabia.ma',
      type: 'book',
      interestValue: 'The Lean Startup',
      content: 'Just finished The Lean Startup! The pivot or persevere framework helped me make a tough decision about my mobile app. Sometimes you need to kill your darlings. Highly recommend this book!',
      progressSnapshot: 336,
    },
  ];

  for (const postData of interestPostsData) {
    const user = await prisma.user.findUnique({
      where: { email: postData.email },
    });

    if (user) {
      // Check if interest post already exists (by content and author)
      const existingPost = await prisma.interestPost.findFirst({
        where: {
          userId: user.id,
          content: postData.content,
        },
      });

      if (!existingPost) {
        const newPost = await prisma.interestPost.create({
          data: {
            userId: user.id,
            type: postData.type,
            interestValue: postData.interestValue,
            content: postData.content,
            progressSnapshot: postData.progressSnapshot || null,
          },
        });

        // Add some likes to make it look realistic
        const otherUsers = await prisma.user.findMany({
          where: {
            id: { not: user.id },
          },
          take: Math.floor(Math.random() * 4) + 1, // 1-4 random likes
        });

        for (const liker of otherUsers) {
          await prisma.interestLike.create({
            data: {
              postId: newPost.id,
              userId: liker.id,
            },
          });
        }

        console.log(`  ✓ Created interest post: "${postData.content.substring(0, 40)}..."`);
      } else {
        console.log(`  ↻ Interest post already exists: "${postData.content.substring(0, 40)}..."`);
      }
    }
  }

  // Add some comments to interest posts
  console.log('\n💭 Adding comments to interest posts...');

  const interestComments = [
    {
      postContent: 'Just finished Chapter 7',
      commenterEmail: 'youssef.java@collabia.ma',
      comment: 'I\'m on Chapter 5! The part about monopolies is fascinating. Let\'s catch up when I get to Chapter 7!',
    },
    {
      postContent: 'Just finished Chapter 7',
      commenterEmail: 'omar.java@collabia.ma',
      comment: 'The secrets chapter is definitely the best part. Have you applied any of these concepts to your startup yet?',
    },
    {
      postContent: 'Looking for chill people to play Valorant',
      commenterEmail: 'leila.uiux@collabia.ma',
      comment: 'I\'m down! I\'m Bronze but trying to improve. Weekend gaming sounds perfect!',
    },
    {
      postContent: 'Looking for chill people to play Valorant',
      commenterEmail: 'imane.art@collabia.ma',
      comment: 'Count me in! I main Jett. Let\'s create a Discord group?',
    },
    {
      postContent: 'Diamond player here! Happy to do free VOD reviews',
      commenterEmail: 'yasmine.uiux@collabia.ma',
      comment: 'This is so kind! I\'ll send you my op.gg. Really struggling to get out of Silver 😅',
    },
    {
      postContent: 'Week 3 of Andrew Ng\'s ML course',
      commenterEmail: 'mehdi.python@collabia.ma',
      comment: 'Neural networks are tricky at first! The key is understanding the chain rule for backprop. Happy to help if you get stuck!',
    },
  ];

  for (const commentData of interestComments) {
    const post = await prisma.interestPost.findFirst({
      where: {
        content: { contains: commentData.postContent },
      },
    });

    const commenter = await prisma.user.findUnique({
      where: { email: commentData.commenterEmail },
    });

    if (post && commenter) {
      const existingComment = await prisma.interestComment.findFirst({
        where: {
          postId: post.id,
          userId: commenter.id,
          content: commentData.comment,
        },
      });

      if (!existingComment) {
        await prisma.interestComment.create({
          data: {
            postId: post.id,
            userId: commenter.id,
            content: commentData.comment,
          },
        });
        console.log(`  ✓ Added comment to post`);
      }
    }
  }

  console.log('\n✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
