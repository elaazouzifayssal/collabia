import api from './api';

interface UpdateProfileData {
  name?: string;
  username?: string;
  location?: string;
  bio?: string;
  school?: string;
  interests?: string[];
  skills?: string[];
  openToStudyPartner?: boolean;
  openToProjects?: boolean;
  openToAccountability?: boolean;
  openToCofounder?: boolean;
  openToHelpingOthers?: boolean;
  status?: string; // legacy
}

export const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/api/users/me');
    return response.data.user;
  },

  // Update current user profile
  updateProfile: async (data: UpdateProfileData) => {
    const response = await api.patch('/api/users/me', data);
    return response.data.user;
  },

  // Get user by ID with recent posts
  getUserById: async (userId: string) => {
    const response = await api.get(`/api/users/${userId}`);
    return {
      user: response.data.user,
      recentPosts: response.data.recentPosts || [],
    };
  },

  // Verify school with educational email
  verifySchool: async (schoolEmail: string) => {
    const response = await api.post('/api/users/verify-school', { schoolEmail });
    return response.data;
  },
};
