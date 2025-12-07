import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const DAILY_SWIPE_LIMIT = 30;
const DENY_LIST_DAYS = 30;

// Helper to create conversation when mutual interest
async function createConversationForMutualInterest(user1Id: string, user2Id: string) {
  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: user1Id } } },
        { participants: { some: { userId: user2Id } } },
      ],
    },
  });

  if (existingConversation) {
    return existingConversation;
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: user1Id }, { userId: user2Id }],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return conversation;
}

// GET /api/swipes/users - Get swipeable users (smart recommendations)
router.get('/users', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    // Get current user to use for recommendations
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        interests: true,
        skills: true,
        location: true,
        openToCofounder: true,
        openToProjects: true,
        openToStudyPartner: true,
        openToAccountability: true,
        openToHelpingOthers: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get users already swiped (and not expired for left swipes)
    const swipedUsers = await prisma.swipe.findMany({
      where: {
        swiperId: currentUserId,
        OR: [
          { direction: { in: ['right', 'superlike'] } }, // permanent
          {
            direction: 'left',
            expiresAt: { gt: new Date() }, // not expired yet
          },
        ],
      },
      select: { swipedId: true },
    });

    const swipedUserIds = swipedUsers.map((s) => s.swipedId);

    // Get all eligible users
    const users = await prisma.user.findMany({
      where: {
        id: {
          notIn: [currentUserId, ...swipedUserIds],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        school: true,
        bio: true,
        interests: true,
        skills: true,
        openToCofounder: true,
        openToProjects: true,
        openToStudyPartner: true,
        openToAccountability: true,
        openToHelpingOthers: true,
        lastActiveAt: true,
        schoolVerified: true,
        // New discovery fields
        currentBook: true,
        currentGame: true,
        currentSkill: true,
        whatImBuilding: true,
        lookingFor: true,
      },
    });

    // Score and sort users by relevance
    const scoredUsers = users.map((user) => {
      let score = 0;

      // Shared interests/skills (highest priority)
      const currentInterests = [...(currentUser.interests || []), ...(currentUser.skills || [])];
      const userInterests = [...(user.interests || []), ...(user.skills || [])];
      const sharedInterests = currentInterests.filter((i) =>
        userInterests.some((ui) => ui.toLowerCase() === i.toLowerCase())
      );
      score += sharedInterests.length * 20;

      // Same location (high priority)
      if (user.location && currentUser.location) {
        if (user.location.toLowerCase() === currentUser.location.toLowerCase()) {
          score += 30;
        }
      }

      // Looking for same thing
      if (currentUser.openToCofounder && user.openToCofounder) score += 25;
      if (currentUser.openToProjects && user.openToProjects) score += 20;
      if (currentUser.openToStudyPartner && user.openToStudyPartner) score += 15;
      if (currentUser.openToAccountability && user.openToAccountability) score += 15;
      if (currentUser.openToHelpingOthers && user.openToHelpingOthers) score += 10;

      // Recent activity (bonus)
      const hoursSinceActive = (Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceActive < 24) score += 15;
      else if (hoursSinceActive < 72) score += 10;
      else if (hoursSinceActive < 168) score += 5;

      // Verified school (small bonus)
      if (user.schoolVerified) score += 5;

      return { ...user, score };
    });

    // Sort by score descending
    scoredUsers.sort((a, b) => b.score - a.score);

    // Return without the score field
    const result = scoredUsers.map(({ score, ...user }) => user);

    res.json(result);
  } catch (error) {
    console.error('Get swipeable users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// POST /api/swipes - Record a swipe (creates one-way interest for right/superlike)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const { swipedId, direction } = req.body;

    if (!swipedId || !direction) {
      return res.status(400).json({ error: 'swipedId and direction are required' });
    }

    if (!['left', 'right', 'superlike'].includes(direction)) {
      return res.status(400).json({ error: 'direction must be left, right, or superlike' });
    }

    // Check daily swipe limit
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaySwipes = await prisma.swipe.count({
      where: {
        swiperId: currentUserId,
        createdAt: { gte: startOfDay },
      },
    });

    if (todaySwipes >= DAILY_SWIPE_LIMIT) {
      return res.status(429).json({ error: 'Daily swipe limit reached' });
    }

    // Calculate expiration for left swipes
    let expiresAt = null;
    if (direction === 'left') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + DENY_LIST_DAYS);
    }

    // Create or update swipe record
    const swipe = await prisma.swipe.upsert({
      where: {
        swiperId_swipedId: {
          swiperId: currentUserId,
          swipedId,
        },
      },
      update: {
        direction,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        swiperId: currentUserId,
        swipedId,
        direction,
        expiresAt,
      },
    });

    let interest = null;

    // For right/superlike, create a pending interest (2-step system)
    if (direction === 'right' || direction === 'superlike') {
      interest = await prisma.swipeInterest.upsert({
        where: {
          senderId_receiverId: {
            senderId: currentUserId,
            receiverId: swipedId,
          },
        },
        update: {
          isSuperLike: direction === 'superlike',
          status: 'pending',
          updatedAt: new Date(),
        },
        create: {
          senderId: currentUserId,
          receiverId: swipedId,
          isSuperLike: direction === 'superlike',
          status: 'pending',
        },
      });
    }

    res.json({
      swipe,
      interest,
      status: interest ? 'pending' : 'skipped'
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Failed to record swipe' });
  }
});

// GET /api/swipes/count - Get today's swipe count
router.get('/count', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const count = await prisma.swipe.count({
      where: {
        swiperId: currentUserId,
        createdAt: { gte: startOfDay },
      },
    });

    res.json({ count, limit: DAILY_SWIPE_LIMIT });
  } catch (error) {
    console.error('Get swipe count error:', error);
    res.status(500).json({ error: 'Failed to get swipe count' });
  }
});

// GET /api/swipes/matches - Get all matches for current user
router.get('/matches', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get the other user's details for each match
    const matchUserIds = matches.map((m) =>
      m.user1Id === currentUserId ? m.user2Id : m.user1Id
    );

    const users = await prisma.user.findMany({
      where: { id: { in: matchUserIds } },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        school: true,
        bio: true,
        interests: true,
        skills: true,
        openToCofounder: true,
        openToProjects: true,
        openToStudyPartner: true,
        openToAccountability: true,
        openToHelpingOthers: true,
        lastActiveAt: true,
      },
    });

    const usersMap = new Map(users.map((u) => [u.id, u]));

    const result = matches.map((match) => {
      const otherUserId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;
      return {
        matchId: match.id,
        matchedAt: match.createdAt,
        user: usersMap.get(otherUserId),
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

// GET /api/swipes/interests/received - Get people who are interested in me (pending)
router.get('/interests/received', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    const receivedInterests = await prisma.swipeInterest.findMany({
      where: {
        receiverId: currentUserId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get sender details
    const senderIds = receivedInterests.map((i) => i.senderId);

    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        school: true,
        bio: true,
        interests: true,
        skills: true,
        openToCofounder: true,
        openToProjects: true,
        openToStudyPartner: true,
        openToAccountability: true,
        openToHelpingOthers: true,
        lastActiveAt: true,
        schoolVerified: true,
      },
    });

    const sendersMap = new Map(senders.map((u) => [u.id, u]));

    const result = receivedInterests.map((interest) => ({
      interestId: interest.id,
      isSuperLike: interest.isSuperLike,
      createdAt: interest.createdAt,
      user: sendersMap.get(interest.senderId),
    }));

    res.json(result);
  } catch (error) {
    console.error('Get received interests error:', error);
    res.status(500).json({ error: 'Failed to get received interests' });
  }
});

// GET /api/swipes/interests/sent - Get my pending interests (people I'm waiting on)
router.get('/interests/sent', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    const sentInterests = await prisma.swipeInterest.findMany({
      where: {
        senderId: currentUserId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get receiver details
    const receiverIds = sentInterests.map((i) => i.receiverId);

    const receivers = await prisma.user.findMany({
      where: { id: { in: receiverIds } },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const receiversMap = new Map(receivers.map((u) => [u.id, u]));

    const result = sentInterests.map((interest) => ({
      interestId: interest.id,
      isSuperLike: interest.isSuperLike,
      createdAt: interest.createdAt,
      receiverId: interest.receiverId,
      user: receiversMap.get(interest.receiverId),
    }));

    res.json(result);
  } catch (error) {
    console.error('Get sent interests error:', error);
    res.status(500).json({ error: 'Failed to get sent interests' });
  }
});

// GET /api/swipes/interests/count - Get count of pending received interests (for badge)
// NOTE: This route MUST come before /interests/:id/respond to avoid matching 'count' as an id
router.get('/interests/count', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    const count = await prisma.swipeInterest.count({
      where: {
        receiverId: currentUserId,
        status: 'pending',
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Get interests count error:', error);
    res.status(500).json({ error: 'Failed to get interests count' });
  }
});

// POST /api/swipes/interests/:id/respond - Accept or decline an interest
router.post('/interests/:id/respond', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const interestId = req.params.id;
    const { action } = req.body;

    if (!action || !['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'action must be accept or decline' });
    }

    // Get the interest and verify receiver is current user
    const interest = await prisma.swipeInterest.findUnique({
      where: { id: interestId },
    });

    if (!interest) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    if (interest.receiverId !== currentUserId) {
      return res.status(403).json({ error: 'You can only respond to interests sent to you' });
    }

    if (interest.status !== 'pending') {
      return res.status(400).json({ error: 'Interest has already been responded to' });
    }

    const newStatus = action === 'accept' ? 'mutual' : 'declined';

    const updatedInterest = await prisma.swipeInterest.update({
      where: { id: interestId },
      data: {
        status: newStatus,
        respondedAt: new Date(),
      },
    });

    let conversation = null;

    // If accepted, create conversation
    if (action === 'accept') {
      conversation = await createConversationForMutualInterest(
        interest.senderId,
        currentUserId
      );

      // Also create a Match record for backwards compatibility
      const [user1, user2] = [interest.senderId, currentUserId].sort();
      await prisma.match.upsert({
        where: {
          user1Id_user2Id: { user1Id: user1, user2Id: user2 },
        },
        update: {},
        create: {
          user1Id: user1,
          user2Id: user2,
        },
      });
    }

    // Get the other user's details
    const otherUser = await prisma.user.findUnique({
      where: { id: interest.senderId },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        school: true,
        bio: true,
        interests: true,
        skills: true,
      },
    });

    res.json({
      interest: updatedInterest,
      conversation,
      otherUser,
    });
  } catch (error) {
    console.error('Respond to interest error:', error);
    res.status(500).json({ error: 'Failed to respond to interest' });
  }
});

// GET /api/swipes/interest-status/:userId - Check if I've already sent interest to a user
router.get('/interest-status/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const targetUserId = req.params.userId;

    const interest = await prisma.swipeInterest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: currentUserId,
          receiverId: targetUserId,
        },
      },
    });

    res.json({
      hasSentInterest: !!interest,
      status: interest?.status || null,
      isSuperLike: interest?.isSuperLike || false,
    });
  } catch (error) {
    console.error('Get interest status error:', error);
    res.status(500).json({ error: 'Failed to get interest status' });
  }
});

// GET /api/swipes/new-matches - Get accepted interests that sender hasn't seen yet (new matches!)
router.get('/new-matches', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    // Find interests where I'm the sender, status is mutual, and I haven't seen it yet
    const newMatches = await prisma.swipeInterest.findMany({
      where: {
        senderId: currentUserId,
        status: 'mutual',
        seenBySender: false,
      },
      orderBy: { respondedAt: 'desc' },
    });

    // Get the other users' details
    const receiverIds = newMatches.map((m) => m.receiverId);

    const receivers = await prisma.user.findMany({
      where: { id: { in: receiverIds } },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        school: true,
        bio: true,
        interests: true,
        skills: true,
        openToCofounder: true,
        openToProjects: true,
        openToStudyPartner: true,
        openToAccountability: true,
        openToHelpingOthers: true,
      },
    });

    const receiversMap = new Map(receivers.map((u) => [u.id, u]));

    const result = newMatches.map((match) => ({
      interestId: match.id,
      matchedAt: match.respondedAt,
      user: receiversMap.get(match.receiverId),
    }));

    res.json(result);
  } catch (error) {
    console.error('Get new matches error:', error);
    res.status(500).json({ error: 'Failed to get new matches' });
  }
});

// GET /api/swipes/new-matches/count - Get count of unseen accepted interests (for badge)
router.get('/new-matches/count', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    const count = await prisma.swipeInterest.count({
      where: {
        senderId: currentUserId,
        status: 'mutual',
        seenBySender: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Get new matches count error:', error);
    res.status(500).json({ error: 'Failed to get new matches count' });
  }
});

// POST /api/swipes/new-matches/:id/mark-seen - Mark a new match as seen
router.post('/new-matches/:id/mark-seen', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const interestId = req.params.id;

    // Verify this interest belongs to the current user as sender
    const interest = await prisma.swipeInterest.findUnique({
      where: { id: interestId },
    });

    if (!interest) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (interest.senderId !== currentUserId) {
      return res.status(403).json({ error: 'You can only mark your own matches as seen' });
    }

    const updated = await prisma.swipeInterest.update({
      where: { id: interestId },
      data: { seenBySender: true },
    });

    res.json({ success: true, interest: updated });
  } catch (error) {
    console.error('Mark match seen error:', error);
    res.status(500).json({ error: 'Failed to mark match as seen' });
  }
});

// POST /api/swipes/new-matches/mark-all-seen - Mark all new matches as seen
router.post('/new-matches/mark-all-seen', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    await prisma.swipeInterest.updateMany({
      where: {
        senderId: currentUserId,
        status: 'mutual',
        seenBySender: false,
      },
      data: { seenBySender: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all matches seen error:', error);
    res.status(500).json({ error: 'Failed to mark matches as seen' });
  }
});

// ============================================
// SAME INTERESTS DISCOVERY ENDPOINTS
// ============================================

// GET /api/swipes/same-interests - Get users grouped by same interests (books, games, skills)
router.get('/same-interests', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;

    // Get current user's interests
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        currentBook: true,
        currentGame: true,
        currentSkill: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result: {
      sameBook: { value: string; users: any[] } | null;
      sameGame: { value: string; users: any[] } | null;
      sameSkill: { value: string; users: any[] } | null;
    } = {
      sameBook: null,
      sameGame: null,
      sameSkill: null,
    };

    const userSelect = {
      id: true,
      name: true,
      email: true,
      location: true,
      school: true,
      bio: true,
      interests: true,
      skills: true,
      currentBook: true,
      currentGame: true,
      currentSkill: true,
      whatImBuilding: true,
      lookingFor: true,
      lastActiveAt: true,
      schoolVerified: true,
    };

    // Find users with same book
    if (currentUser.currentBook && currentUser.currentBook.trim() !== '') {
      const sameBookUsers = await prisma.user.findMany({
        where: {
          id: { not: currentUserId },
          currentBook: {
            equals: currentUser.currentBook,
            mode: 'insensitive',
          },
        },
        select: userSelect,
        take: 20,
        orderBy: { lastActiveAt: 'desc' },
      });

      if (sameBookUsers.length > 0) {
        result.sameBook = {
          value: currentUser.currentBook,
          users: sameBookUsers,
        };
      }
    }

    // Find users with same game
    if (currentUser.currentGame && currentUser.currentGame.trim() !== '') {
      const sameGameUsers = await prisma.user.findMany({
        where: {
          id: { not: currentUserId },
          currentGame: {
            equals: currentUser.currentGame,
            mode: 'insensitive',
          },
        },
        select: userSelect,
        take: 20,
        orderBy: { lastActiveAt: 'desc' },
      });

      if (sameGameUsers.length > 0) {
        result.sameGame = {
          value: currentUser.currentGame,
          users: sameGameUsers,
        };
      }
    }

    // Find users with same skill they're learning
    if (currentUser.currentSkill && currentUser.currentSkill.trim() !== '') {
      const sameSkillUsers = await prisma.user.findMany({
        where: {
          id: { not: currentUserId },
          currentSkill: {
            equals: currentUser.currentSkill,
            mode: 'insensitive',
          },
        },
        select: userSelect,
        take: 20,
        orderBy: { lastActiveAt: 'desc' },
      });

      if (sameSkillUsers.length > 0) {
        result.sameSkill = {
          value: currentUser.currentSkill,
          users: sameSkillUsers,
        };
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Get same interests error:', error);
    res.status(500).json({ error: 'Failed to get same interests' });
  }
});

// GET /api/swipes/same-interests/:type - Get users with same interest by type (book, game, skill)
router.get('/same-interests/:type', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.userId;
    const { type } = req.params;

    if (!['book', 'game', 'skill'].includes(type)) {
      return res.status(400).json({ error: 'Type must be book, game, or skill' });
    }

    const fieldMap: Record<string, string> = {
      book: 'currentBook',
      game: 'currentGame',
      skill: 'currentSkill',
    };

    const field = fieldMap[type];

    // Get current user's value for this type
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { [field]: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentValue = (currentUser as any)[field];

    if (!currentValue || currentValue.trim() === '') {
      return res.json({ value: null, users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        [field]: {
          equals: currentValue,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        school: true,
        bio: true,
        interests: true,
        skills: true,
        currentBook: true,
        currentGame: true,
        currentSkill: true,
        whatImBuilding: true,
        lookingFor: true,
        lastActiveAt: true,
        schoolVerified: true,
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    res.json({
      value: currentValue,
      users,
    });
  } catch (error) {
    console.error('Get same interests by type error:', error);
    res.status(500).json({ error: 'Failed to get users with same interest' });
  }
});

export default router;
