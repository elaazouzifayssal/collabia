import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/posts - Get all posts (feed)
router.get('/', async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            school: true,
            status: true,
          },
        },
        interests: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// GET /api/posts/my-posts - Get current user's posts (protected)
router.get('/my-posts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: req.user!.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            school: true,
            status: true,
          },
        },
        interests: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ posts });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// GET /api/posts/:id - Get single post by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            school: true,
            status: true,
          },
        },
        interests: {
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
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// POST /api/posts - Create new post (protected)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, description, tags } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'At least one tag is required' });
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        tags,
        authorId: req.user!.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            school: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST /api/posts/:id/interest - Toggle interest in a post (protected)
router.post('/:id/interest', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already showed interest
    const existingInterest = await prisma.interest.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: id,
        },
      },
    });

    if (existingInterest) {
      // Remove interest (toggle off)
      await prisma.interest.delete({
        where: {
          id: existingInterest.id,
        },
      });

      return res.json({
        message: 'Interest removed',
        isInterested: false,
      });
    } else {
      // Add interest (toggle on)
      await prisma.interest.create({
        data: {
          userId,
          postId: id,
        },
      });

      return res.json({
        message: 'Interest added',
        isInterested: true,
      });
    }
  } catch (error) {
    console.error('Toggle interest error:', error);
    res.status(500).json({ error: 'Failed to toggle interest' });
  }
});

// GET /api/posts/:id/interested-users - Get users interested in a post (protected)
router.get('/:id/interested-users', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if post exists and user is the author
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only the post author can see interested users
    if (post.authorId !== req.user!.userId) {
      return res.status(403).json({ error: 'Only the post author can see interested users' });
    }

    // Get all interested users
    const interests = await prisma.interest.findMany({
      where: { postId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            school: true,
            avatar: true,
            status: true,
            interests: true,
            skills: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const users = interests.map((interest) => interest.user);

    res.json({ users });
  } catch (error) {
    console.error('Get interested users error:', error);
    res.status(500).json({ error: 'Failed to get interested users' });
  }
});

// PUT /api/posts/:id - Update post (protected, author only)
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: 'At least one tag is required' });
    }

    // Check if post exists and user is the author
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        tags,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            school: true,
            status: true,
          },
        },
      },
    });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/posts/:id - Delete post (protected, author only)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
