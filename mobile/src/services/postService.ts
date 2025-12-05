import api from './api';

interface CreatePostData {
  title: string;
  description?: string;
  tags: string[];
}

interface UpdatePostData {
  title: string;
  description?: string;
  tags: string[];
}

export const postService = {
  // Get all posts (feed)
  getPosts: async () => {
    const response = await api.get('/api/posts');
    return response.data.posts;
  },

  // Get current user's posts
  getMyPosts: async () => {
    const response = await api.get('/api/posts/my-posts');
    return response.data.posts;
  },

  // Get single post by ID
  getPostById: async (postId: string) => {
    const response = await api.get(`/api/posts/${postId}`);
    return response.data.post;
  },

  // Create new post
  createPost: async (data: CreatePostData) => {
    const response = await api.post('/api/posts', data);
    return response.data.post;
  },

  // Toggle interest in a post
  toggleInterest: async (postId: string) => {
    const response = await api.post(`/api/posts/${postId}/interest`);
    return response.data;
  },

  // Get users interested in a post (author only)
  getInterestedUsers: async (postId: string) => {
    const response = await api.get(`/api/posts/${postId}/interested-users`);
    return response.data.users;
  },

  // Update post (author only)
  updatePost: async (postId: string, data: UpdatePostData) => {
    const response = await api.put(`/api/posts/${postId}`, data);
    return response.data.post;
  },

  // Delete post (author only)
  deletePost: async (postId: string) => {
    const response = await api.delete(`/api/posts/${postId}`);
    return response.data;
  },
};
