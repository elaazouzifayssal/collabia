import api from './api';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface InterestPostUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  school: string | null;
  location?: string | null;
}

export interface InterestComment {
  id: string;
  postId: string;
  userId: string;
  user: InterestPostUser;
  content: string;
  createdAt: string;
}

export interface InterestPost {
  id: string;
  userId: string;
  user: InterestPostUser;
  type: 'book' | 'skill' | 'game';
  interestValue: string;
  progressSnapshot: number | null;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  comments?: InterestComment[];
}

export interface CreateInterestPostData {
  type: 'book' | 'skill' | 'game';
  interestValue: string;
  content: string;
  progressSnapshot?: number;
}

export interface InterestFeedResponse {
  posts: InterestPost[];
  hasMore: boolean;
  nextCursor: string | null;
  myInterests: {
    book: string | null;
    skill: string | null;
    game: string | null;
  };
}

// ============================================
// SERVICE
// ============================================

export const interestPostService = {
  // ============================================
  // POSTS
  // ============================================

  // Create a new interest post
  createPost: async (data: CreateInterestPostData): Promise<InterestPost> => {
    const response = await api.post('/api/interest-posts', data);
    return response.data.post;
  },

  // Get feed of posts from shared interests
  getFeed: async (limit: number = 20, cursor?: string): Promise<InterestFeedResponse> => {
    let url = `/api/interest-posts/feed?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Get posts for a specific interest
  getPostsByInterest: async (
    type: 'book' | 'skill' | 'game',
    value: string,
    limit: number = 20,
    cursor?: string
  ): Promise<{ posts: InterestPost[]; hasMore: boolean; nextCursor: string | null }> => {
    let url = `/api/interest-posts/${type}/${encodeURIComponent(value)}?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Get a single post with comments
  getPost: async (postId: string): Promise<InterestPost> => {
    const response = await api.get(`/api/interest-posts/post/${postId}`);
    return response.data.post;
  },

  // Get a user's posts for a specific interest
  getUserPosts: async (
    userId: string,
    type: 'book' | 'skill' | 'game',
    value: string
  ): Promise<InterestPost[]> => {
    const response = await api.get(
      `/api/interest-posts/user/${userId}/${type}/${encodeURIComponent(value)}`
    );
    return response.data.posts;
  },

  // Delete a post
  deletePost: async (postId: string): Promise<void> => {
    await api.delete(`/api/interest-posts/${postId}`);
  },

  // ============================================
  // LIKES
  // ============================================

  // Toggle like on a post
  toggleLike: async (postId: string): Promise<{ isLiked: boolean; likeCount: number }> => {
    const response = await api.post(`/api/interest-posts/${postId}/like`);
    return {
      isLiked: response.data.isLiked,
      likeCount: response.data.likeCount,
    };
  },

  // ============================================
  // COMMENTS
  // ============================================

  // Add a comment to a post
  addComment: async (
    postId: string,
    content: string
  ): Promise<{ comment: InterestComment; commentCount: number }> => {
    const response = await api.post(`/api/interest-posts/${postId}/comment`, { content });
    return {
      comment: response.data.comment,
      commentCount: response.data.commentCount,
    };
  },

  // Delete a comment
  deleteComment: async (
    postId: string,
    commentId: string
  ): Promise<{ commentCount: number }> => {
    const response = await api.delete(`/api/interest-posts/${postId}/comment/${commentId}`);
    return { commentCount: response.data.commentCount };
  },

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  // Format relative time
  formatRelativeTime: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  },

  // Get interest type icon
  getTypeIcon: (type: 'book' | 'skill' | 'game'): string => {
    switch (type) {
      case 'book':
        return '📖';
      case 'skill':
        return '🎯';
      case 'game':
        return '🎮';
    }
  },

  // Get interest type gradient colors
  getTypeGradient: (type: 'book' | 'skill' | 'game'): readonly [string, string] => {
    switch (type) {
      case 'book':
        return ['#A06EFF', '#6C4DFF'] as const;
      case 'skill':
        return ['#00D9A5', '#00B388'] as const;
      case 'game':
        return ['#FF6B9D', '#C44569'] as const;
    }
  },
};
