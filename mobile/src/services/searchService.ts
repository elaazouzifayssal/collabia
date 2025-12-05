import api from './api';

export const searchService = {
  // Search users
  searchUsers: async (query?: string, filters?: { school?: string; interests?: string[]; skills?: string[] }) => {
    const params: any = {};
    if (query) params.query = query;
    if (filters?.school) params.school = filters.school;
    if (filters?.interests) params.interests = filters.interests.join(',');
    if (filters?.skills) params.skills = filters.skills.join(',');

    const response = await api.get('/api/search/users', { params });
    return response.data.users;
  },

  // Search posts
  searchPosts: async (query?: string, tags?: string[]) => {
    const params: any = {};
    if (query) params.query = query;
    if (tags) params.tags = tags.join(',');

    const response = await api.get('/api/search/posts', { params });
    return response.data.posts;
  },

  // Get trending tags
  getTrendingTags: async () => {
    const response = await api.get('/api/search/trending-tags');
    return response.data.trendingTags;
  },
};
