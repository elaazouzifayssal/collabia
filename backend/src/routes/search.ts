import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Search users by name, school, interests, or skills
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const { query, school, interests, skills } = req.query;
    const userId = req.user!.userId;

    const users = await prisma.user.findMany({
      where: {
        AND: [
          // Exclude current user
          { id: { not: userId } },
          // Search by name or school
          query
            ? {
                OR: [
                  { name: { contains: query as string, mode: 'insensitive' } },
                  { school: { contains: query as string, mode: 'insensitive' } },
                  { bio: { contains: query as string, mode: 'insensitive' } },
                ],
              }
            : {},
          // Filter by school
          school ? { school: { contains: school as string, mode: 'insensitive' } } : {},
          // Filter by interests (array contains)
          interests
            ? { interests: { hasSome: (interests as string).split(',') } }
            : {},
          // Filter by skills (array contains)
          skills ? { skills: { hasSome: (skills as string).split(',') } } : {},
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        school: true,
        location: true,
        bio: true,
        interests: true,
        skills: true,
        status: true,
        avatar: true,
        schoolVerified: true,
        openToStudyPartner: true,
        openToProjects: true,
        openToAccountability: true,
        openToCofounder: true,
        openToHelpingOthers: true,
        createdAt: true,
        lastActiveAt: true,
      },
      take: 50, // Limit results
    });

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Search posts by title, description, or tags
router.get('/posts', authMiddleware, async (req, res) => {
  try {
    const { query, tags } = req.query;

    const posts = await prisma.post.findMany({
      where: {
        AND: [
          // Search by title or description
          query
            ? {
                OR: [
                  { title: { contains: query as string, mode: 'insensitive' } },
                  { description: { contains: query as string, mode: 'insensitive' } },
                ],
              }
            : {},
          // Filter by tags
          tags ? { tags: { hasSome: (tags as string).split(',') } } : {},
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            school: true,
            avatar: true,
          },
        },
        interests: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    res.json({ posts });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

// Get trending tags (most used tags in posts)
router.get('/trending-tags', authMiddleware, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      select: {
        tags: true,
      },
      take: 100,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Flatten and count tags
    const tagCounts: { [key: string]: number } = {};
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort by count and get top 20
    const trendingTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ trendingTags });
  } catch (error) {
    console.error('Get trending tags error:', error);
    res.status(500).json({ error: 'Failed to get trending tags' });
  }
});

export default router;
