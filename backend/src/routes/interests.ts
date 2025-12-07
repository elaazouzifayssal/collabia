import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// GET CURRENT INTERESTS
// ============================================

// GET /api/interests/current - Get user's current structured interests
router.get('/current', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [currentBook, currentSkill, currentGame] = await Promise.all([
      prisma.currentBook.findUnique({ where: { userId } }),
      prisma.currentSkill.findUnique({ where: { userId } }),
      prisma.currentGame.findUnique({ where: { userId } }),
    ]);

    res.json({
      currentBook,
      currentSkill,
      currentGame,
    });
  } catch (error) {
    console.error('Get current interests error:', error);
    res.status(500).json({ error: 'Failed to get current interests' });
  }
});

// ============================================
// BOOK OPERATIONS
// ============================================

// PUT /api/interests/book - Update current book (auto-archives old one)
router.put('/book', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, totalPages, pagesRead = 0, status = 'reading' } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Book title is required' });
    }

    // Check if there's an existing book to archive
    const existingBook = await prisma.currentBook.findUnique({
      where: { userId },
    });

    if (existingBook) {
      // Archive the old book
      await prisma.bookHistory.create({
        data: {
          userId,
          title: existingBook.title,
          totalPages: existingBook.totalPages,
          pagesRead: existingBook.pagesRead,
          status: existingBook.status === 'completed' ? 'completed' : 'paused',
          startedAt: existingBook.startDate,
        },
      });

      // Delete the old current book
      await prisma.currentBook.delete({ where: { userId } });
    }

    // Create new current book
    const newBook = await prisma.currentBook.create({
      data: {
        userId,
        title: title.trim(),
        totalPages: totalPages || null,
        pagesRead: pagesRead || 0,
        status: status || 'reading',
      },
    });

    res.json({
      message: 'Current book updated',
      currentBook: newBook,
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// PATCH /api/interests/book/progress - Update book progress
router.patch('/book/progress', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { pagesRead, status } = req.body;

    const existingBook = await prisma.currentBook.findUnique({
      where: { userId },
    });

    if (!existingBook) {
      return res.status(404).json({ error: 'No current book found' });
    }

    const updateData: any = {};
    if (pagesRead !== undefined) updateData.pagesRead = pagesRead;
    if (status !== undefined) updateData.status = status;

    // If completed, auto-archive
    if (status === 'completed') {
      await prisma.bookHistory.create({
        data: {
          userId,
          title: existingBook.title,
          totalPages: existingBook.totalPages,
          pagesRead: pagesRead || existingBook.pagesRead,
          status: 'completed',
          startedAt: existingBook.startDate,
        },
      });

      await prisma.currentBook.delete({ where: { userId } });

      return res.json({
        message: 'Book completed and archived',
        currentBook: null,
      });
    }

    const updatedBook = await prisma.currentBook.update({
      where: { userId },
      data: updateData,
    });

    res.json({
      message: 'Book progress updated',
      currentBook: updatedBook,
    });
  } catch (error) {
    console.error('Update book progress error:', error);
    res.status(500).json({ error: 'Failed to update book progress' });
  }
});

// DELETE /api/interests/book - Clear current book (optionally archive)
router.delete('/book', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { archive = true } = req.query;

    const existingBook = await prisma.currentBook.findUnique({
      where: { userId },
    });

    if (!existingBook) {
      return res.status(404).json({ error: 'No current book found' });
    }

    if (archive === 'true' || archive === true) {
      await prisma.bookHistory.create({
        data: {
          userId,
          title: existingBook.title,
          totalPages: existingBook.totalPages,
          pagesRead: existingBook.pagesRead,
          status: 'paused',
          startedAt: existingBook.startDate,
        },
      });
    }

    await prisma.currentBook.delete({ where: { userId } });

    res.json({ message: 'Current book cleared' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Failed to clear book' });
  }
});

// ============================================
// SKILL OPERATIONS
// ============================================

// PUT /api/interests/skill - Update current skill (auto-archives old one)
router.put('/skill', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, level = 'beginner', notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    // Check if there's an existing skill to archive
    const existingSkill = await prisma.currentSkill.findUnique({
      where: { userId },
    });

    if (existingSkill) {
      // Archive the old skill
      await prisma.skillHistory.create({
        data: {
          userId,
          name: existingSkill.name,
          levelReached: existingSkill.level,
          notes: existingSkill.notes,
          startedAt: existingSkill.startDate,
        },
      });

      // Delete the old current skill
      await prisma.currentSkill.delete({ where: { userId } });
    }

    // Create new current skill
    const newSkill = await prisma.currentSkill.create({
      data: {
        userId,
        name: name.trim(),
        level: level || 'beginner',
        notes: notes?.trim() || null,
      },
    });

    res.json({
      message: 'Current skill updated',
      currentSkill: newSkill,
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// PATCH /api/interests/skill/level - Update skill level
router.patch('/skill/level', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { level, notes } = req.body;

    const existingSkill = await prisma.currentSkill.findUnique({
      where: { userId },
    });

    if (!existingSkill) {
      return res.status(404).json({ error: 'No current skill found' });
    }

    const updateData: any = {};
    if (level !== undefined) updateData.level = level;
    if (notes !== undefined) updateData.notes = notes;

    const updatedSkill = await prisma.currentSkill.update({
      where: { userId },
      data: updateData,
    });

    res.json({
      message: 'Skill updated',
      currentSkill: updatedSkill,
    });
  } catch (error) {
    console.error('Update skill level error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
});

// DELETE /api/interests/skill - Clear current skill
router.delete('/skill', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { archive = true } = req.query;

    const existingSkill = await prisma.currentSkill.findUnique({
      where: { userId },
    });

    if (!existingSkill) {
      return res.status(404).json({ error: 'No current skill found' });
    }

    if (archive === 'true' || archive === true) {
      await prisma.skillHistory.create({
        data: {
          userId,
          name: existingSkill.name,
          levelReached: existingSkill.level,
          notes: existingSkill.notes,
          startedAt: existingSkill.startDate,
        },
      });
    }

    await prisma.currentSkill.delete({ where: { userId } });

    res.json({ message: 'Current skill cleared' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Failed to clear skill' });
  }
});

// ============================================
// GAME OPERATIONS
// ============================================

// PUT /api/interests/game - Update current game (auto-archives old one)
router.put('/game', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, rank, frequency } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Game name is required' });
    }

    // Check if there's an existing game to archive
    const existingGame = await prisma.currentGame.findUnique({
      where: { userId },
    });

    if (existingGame) {
      // Archive the old game
      await prisma.gameHistory.create({
        data: {
          userId,
          name: existingGame.name,
          rank: existingGame.rank,
          playedFrom: existingGame.startDate,
        },
      });

      // Delete the old current game
      await prisma.currentGame.delete({ where: { userId } });
    }

    // Create new current game
    const newGame = await prisma.currentGame.create({
      data: {
        userId,
        name: name.trim(),
        rank: rank?.trim() || null,
        frequency: frequency || null,
      },
    });

    res.json({
      message: 'Current game updated',
      currentGame: newGame,
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// PATCH /api/interests/game - Update game details
router.patch('/game', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { rank, frequency } = req.body;

    const existingGame = await prisma.currentGame.findUnique({
      where: { userId },
    });

    if (!existingGame) {
      return res.status(404).json({ error: 'No current game found' });
    }

    const updateData: any = {};
    if (rank !== undefined) updateData.rank = rank;
    if (frequency !== undefined) updateData.frequency = frequency;

    const updatedGame = await prisma.currentGame.update({
      where: { userId },
      data: updateData,
    });

    res.json({
      message: 'Game updated',
      currentGame: updatedGame,
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// DELETE /api/interests/game - Clear current game
router.delete('/game', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { archive = true } = req.query;

    const existingGame = await prisma.currentGame.findUnique({
      where: { userId },
    });

    if (!existingGame) {
      return res.status(404).json({ error: 'No current game found' });
    }

    if (archive === 'true' || archive === true) {
      await prisma.gameHistory.create({
        data: {
          userId,
          name: existingGame.name,
          rank: existingGame.rank,
          playedFrom: existingGame.startDate,
        },
      });
    }

    await prisma.currentGame.delete({ where: { userId } });

    res.json({ message: 'Current game cleared' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Failed to clear game' });
  }
});

// ============================================
// HISTORY
// ============================================

// GET /api/interests/history - Get all history
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const [bookHistory, skillHistory, gameHistory] = await Promise.all([
      prisma.bookHistory.findMany({
        where: { userId },
        orderBy: { finishedAt: 'desc' },
        take: limit,
      }),
      prisma.skillHistory.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: limit,
      }),
      prisma.gameHistory.findMany({
        where: { userId },
        orderBy: { playedTo: 'desc' },
        take: limit,
      }),
    ]);

    res.json({
      bookHistory,
      skillHistory,
      gameHistory,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// GET /api/interests/history/:type - Get specific history type
router.get('/history/:type', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { type } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    let history;

    switch (type) {
      case 'books':
        history = await prisma.bookHistory.findMany({
          where: { userId },
          orderBy: { finishedAt: 'desc' },
          take: limit,
        });
        break;
      case 'skills':
        history = await prisma.skillHistory.findMany({
          where: { userId },
          orderBy: { completedAt: 'desc' },
          take: limit,
        });
        break;
      case 'games':
        history = await prisma.gameHistory.findMany({
          where: { userId },
          orderBy: { playedTo: 'desc' },
          take: limit,
        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid history type. Use books, skills, or games.' });
    }

    res.json({ history });
  } catch (error) {
    console.error('Get specific history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// PATCH /api/interests/history/book/:id/rating - Add rating to completed book
router.patch('/history/book/:id/rating', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const bookHistoryItem = await prisma.bookHistory.findFirst({
      where: { id, userId },
    });

    if (!bookHistoryItem) {
      return res.status(404).json({ error: 'Book not found in history' });
    }

    const updated = await prisma.bookHistory.update({
      where: { id },
      data: { rating },
    });

    res.json({
      message: 'Rating updated',
      book: updated,
    });
  } catch (error) {
    console.error('Update book rating error:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
});

// ============================================
// USER INTERESTS (for other users' profiles)
// ============================================

// GET /api/interests/user/:userId - Get another user's interests
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const [currentBook, currentSkill, currentGame, bookHistory, skillHistory, gameHistory] = await Promise.all([
      prisma.currentBook.findUnique({ where: { userId } }),
      prisma.currentSkill.findUnique({ where: { userId } }),
      prisma.currentGame.findUnique({ where: { userId } }),
      prisma.bookHistory.findMany({
        where: { userId },
        orderBy: { finishedAt: 'desc' },
        take: 5,
      }),
      prisma.skillHistory.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
      prisma.gameHistory.findMany({
        where: { userId },
        orderBy: { playedTo: 'desc' },
        take: 5,
      }),
    ]);

    res.json({
      current: {
        book: currentBook,
        skill: currentSkill,
        game: currentGame,
      },
      history: {
        books: bookHistory,
        skills: skillHistory,
        games: gameHistory,
      },
    });
  } catch (error) {
    console.error('Get user interests error:', error);
    res.status(500).json({ error: 'Failed to get user interests' });
  }
});

export default router;
