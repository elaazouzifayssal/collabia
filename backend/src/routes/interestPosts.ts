import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// CREATE INTEREST POST
// ============================================

// POST /api/interest-posts - Create a new interest post
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, interestValue, content, progressSnapshot } = req.body;
    const userId = req.user!.userId;

    // Validation
    if (!type || !['book', 'skill', 'game'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be book, skill, or game' });
    }

    if (!interestValue || typeof interestValue !== 'string' || interestValue.trim().length === 0) {
      return res.status(400).json({ error: 'Interest value is required' });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({ error: 'Content must be 1000 characters or less' });
    }

    const post = await prisma.interestPost.create({
      data: {
        userId,
        type,
        interestValue: interestValue.trim(),
        content: content.trim(),
        progressSnapshot: type === 'book' && progressSnapshot ? progressSnapshot : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            school: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        ...post,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        isLiked: false,
      },
    });
  } catch (error) {
    console.error('Create interest post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ============================================
// GET SAME-INTEREST FEED (posts from shared interests)
// ============================================

// GET /api/interest-posts/feed - Get posts from interests user shares with others
// NOTE: This route MUST come before /:type/:value to avoid conflict
router.get('/feed', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string | undefined;

    // Get current user's interests (both structured and legacy)
    const [currentUser, currentBook, currentSkill, currentGame] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          currentBook: true,
          currentGame: true,
          currentSkill: true,
        },
      }),
      prisma.currentBook.findUnique({ where: { userId } }),
      prisma.currentSkill.findUnique({ where: { userId } }),
      prisma.currentGame.findUnique({ where: { userId } }),
    ]);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build list of user's current interests
    const bookTitle = currentBook?.title || currentUser.currentBook;
    const skillName = currentSkill?.name || currentUser.currentSkill;
    const gameName = currentGame?.name || currentUser.currentGame;

    // Build OR conditions for matching posts
    const orConditions: any[] = [];

    if (bookTitle && bookTitle.trim() !== '') {
      orConditions.push({
        type: 'book',
        interestValue: { equals: bookTitle, mode: 'insensitive' },
      });
    }

    if (skillName && skillName.trim() !== '') {
      orConditions.push({
        type: 'skill',
        interestValue: { equals: skillName, mode: 'insensitive' },
      });
    }

    if (gameName && gameName.trim() !== '') {
      orConditions.push({
        type: 'game',
        interestValue: { equals: gameName, mode: 'insensitive' },
      });
    }

    // If user has no interests, return empty feed
    if (orConditions.length === 0) {
      return res.json({
        posts: [],
        hasMore: false,
        nextCursor: null,
        myInterests: { book: null, skill: null, game: null },
      });
    }

    // Fetch posts that match any of user's interests
    const posts = await prisma.interestPost.findMany({
      where: {
        OR: orConditions,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            school: true,
            location: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

    const formattedPosts = postsToReturn.map((post) => ({
      id: post.id,
      userId: post.userId,
      user: post.user,
      type: post.type,
      interestValue: post.interestValue,
      progressSnapshot: post.progressSnapshot,
      content: post.content,
      createdAt: post.createdAt,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isLiked: post.likes.length > 0,
    }));

    res.json({
      posts: formattedPosts,
      hasMore,
      nextCursor: hasMore ? postsToReturn[postsToReturn.length - 1].id : null,
      myInterests: {
        book: bookTitle || null,
        skill: skillName || null,
        game: gameName || null,
      },
    });
  } catch (error) {
    console.error('Get interest feed error:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

// ============================================
// GET SINGLE POST WITH COMMENTS
// ============================================

// GET /api/interest-posts/post/:id - Get a single post with its comments
// NOTE: This route MUST come before /:type/:value to avoid conflict
router.get('/post/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const post = await prisma.interestPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            school: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      post: {
        id: post.id,
        userId: post.userId,
        user: post.user,
        type: post.type,
        interestValue: post.interestValue,
        progressSnapshot: post.progressSnapshot,
        content: post.content,
        createdAt: post.createdAt,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        isLiked: post.likes.length > 0,
        comments: post.comments,
      },
    });
  } catch (error) {
    console.error('Get interest post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// ============================================
// GET USER'S POSTS FOR AN INTEREST
// ============================================

// GET /api/interest-posts/user/:userId/:type/:value - Get a user's posts for a specific interest
// NOTE: This route MUST come before /:type/:value to avoid conflict
router.get('/user/:userId/:type/:value', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId: targetUserId, type, value } = req.params;
    const currentUserId = req.user!.userId;

    if (!['book', 'skill', 'game'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be book, skill, or game' });
    }

    const decodedValue = decodeURIComponent(value);

    const posts = await prisma.interestPost.findMany({
      where: {
        userId: targetUserId,
        type,
        interestValue: {
          equals: decodedValue,
          mode: 'insensitive',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            school: true,
          },
        },
        likes: {
          where: { userId: currentUserId },
          select: { id: true },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      user: post.user,
      type: post.type,
      interestValue: post.interestValue,
      progressSnapshot: post.progressSnapshot,
      content: post.content,
      createdAt: post.createdAt,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isLiked: post.likes.length > 0,
    }));

    res.json({ posts: formattedPosts, total: formattedPosts.length });
  } catch (error) {
    console.error('Get user interest posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// ============================================
// GET POSTS BY INTEREST
// ============================================

// GET /api/interest-posts/:type/:value - Get posts for a specific interest
router.get('/:type/:value', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, value } = req.params;
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const cursor = req.query.cursor as string | undefined;

    if (!['book', 'skill', 'game'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be book, skill, or game' });
    }

    const decodedValue = decodeURIComponent(value);

    const posts = await prisma.interestPost.findMany({
      where: {
        type,
        interestValue: {
          equals: decodedValue,
          mode: 'insensitive',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            school: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

    const formattedPosts = postsToReturn.map((post) => ({
      id: post.id,
      userId: post.userId,
      user: post.user,
      type: post.type,
      interestValue: post.interestValue,
      progressSnapshot: post.progressSnapshot,
      content: post.content,
      createdAt: post.createdAt,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isLiked: post.likes.length > 0,
    }));

    res.json({
      posts: formattedPosts,
      hasMore,
      nextCursor: hasMore ? postsToReturn[postsToReturn.length - 1].id : null,
    });
  } catch (error) {
    console.error('Get interest posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// ============================================
// LIKE / UNLIKE POST
// ============================================

// POST /api/interest-posts/:id/like - Like or unlike a post
router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if post exists
    const post = await prisma.interestPost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already liked
    const existingLike = await prisma.interestLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.interestLike.delete({
        where: { id: existingLike.id },
      });

      const likeCount = await prisma.interestLike.count({
        where: { postId: id },
      });

      return res.json({
        message: 'Post unliked',
        isLiked: false,
        likeCount,
      });
    } else {
      // Like
      await prisma.interestLike.create({
        data: {
          postId: id,
          userId,
        },
      });

      const likeCount = await prisma.interestLike.count({
        where: { postId: id },
      });

      return res.json({
        message: 'Post liked',
        isLiked: true,
        likeCount,
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like/unlike post' });
  }
});

// ============================================
// COMMENTS
// ============================================

// POST /api/interest-posts/:id/comment - Add a comment to a post
router.post('/:id/comment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (content.trim().length > 500) {
      return res.status(400).json({ error: 'Comment must be 500 characters or less' });
    }

    // Check if post exists
    const post = await prisma.interestPost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await prisma.interestComment.create({
      data: {
        postId: id,
        userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    const commentCount = await prisma.interestComment.count({
      where: { postId: id },
    });

    res.status(201).json({
      message: 'Comment added',
      comment,
      commentCount,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// DELETE /api/interest-posts/:id/comment/:commentId - Delete a comment
router.delete('/:id/comment/:commentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user!.userId;

    const comment = await prisma.interestComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await prisma.interestComment.delete({
      where: { id: commentId },
    });

    const commentCount = await prisma.interestComment.count({
      where: { postId: id },
    });

    res.json({
      message: 'Comment deleted',
      commentCount,
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ============================================
// DELETE POST
// ============================================

// DELETE /api/interest-posts/:id - Delete a post
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const post = await prisma.interestPost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await prisma.interestPost.delete({
      where: { id },
    });

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
