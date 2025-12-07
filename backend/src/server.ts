import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import postsRoutes from './routes/posts';
import conversationsRoutes from './routes/conversations';
import searchRoutes from './routes/search';
import swipesRoutes from './routes/swipes';
import interestsRoutes from './routes/interests';
import interestPostsRoutes from './routes/interestPosts';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests from mobile app
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/swipes', swipesRoutes);
app.use('/api/interests', interestsRoutes);
app.use('/api/interest-posts', interestPostsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Collabia API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
