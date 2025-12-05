import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/users/me - Get current user profile (protected)
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// PATCH /api/users/me - Update current user profile (protected)
router.patch('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      name,
      username,
      location,
      bio,
      school,
      interests,
      skills,
      openToStudyPartner,
      openToProjects,
      openToAccountability,
      openToCofounder,
      openToHelpingOthers,
      status, // legacy
    } = req.body;

    // Validate bio length
    if (bio && bio.length > 150) {
      return res.status(400).json({ error: 'Bio must be 150 characters or less' });
    }

    // Check if username is already taken
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser && existingUser.id !== req.user!.userId) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Build update data object (only include fields that were provided)
    const updateData: any = {
      lastActiveAt: new Date(), // Update activity timestamp
    };

    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;
    if (school !== undefined) updateData.school = school;
    if (interests !== undefined) updateData.interests = interests;
    if (skills !== undefined) updateData.skills = skills;
    if (openToStudyPartner !== undefined) updateData.openToStudyPartner = openToStudyPartner;
    if (openToProjects !== undefined) updateData.openToProjects = openToProjects;
    if (openToAccountability !== undefined) updateData.openToAccountability = openToAccountability;
    if (openToCofounder !== undefined) updateData.openToCofounder = openToCofounder;
    if (openToHelpingOthers !== undefined) updateData.openToHelpingOthers = openToHelpingOthers;
    if (status !== undefined) updateData.status = status; // legacy

    // Update user
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/:id - Get user by ID with recent posts (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        avatar: true,
        location: true,
        bio: true,
        school: true,
        interests: true,
        skills: true,
        openToStudyPartner: true,
        openToProjects: true,
        openToAccountability: true,
        openToCofounder: true,
        openToHelpingOthers: true,
        lastActiveAt: true,
        collaborationsStarted: true,
        schoolVerified: true,
        status: true, // legacy
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's recent posts (last 5)
    const recentPosts = await prisma.post.findMany({
      where: { authorId: id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        tags: true,
        createdAt: true,
        interests: {
          select: {
            id: true,
          },
        },
      },
    });

    res.json({
      user,
      recentPosts: recentPosts.map(post => ({
        ...post,
        interestCount: post.interests.length,
      })),
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// POST /api/users/verify-school - Request school verification (protected)
router.post('/verify-school', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { schoolEmail } = req.body;

    if (!schoolEmail) {
      return res.status(400).json({ error: 'School email is required' });
    }

    // Validate email is from an educational domain
    const validDomains = ['.ac.ma', '.edu', '.edu.ma', '@um5.ac.ma', '@um5r.ac.ma', '@emi.ac.ma'];
    const isValidEducationalEmail = validDomains.some(domain => schoolEmail.toLowerCase().includes(domain));

    if (!isValidEducationalEmail) {
      return res.status(400).json({
        error: 'Please use a valid educational email address (.ac.ma, .edu, etc.)'
      });
    }

    // In a real app, you'd send a verification email here
    // For now, we'll auto-verify educational emails
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        schoolEmail,
        schoolVerified: true,
        verifiedAt: new Date(),
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'School verified successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Verify school error:', error);
    res.status(500).json({ error: 'Failed to verify school' });
  }
});

export default router;
