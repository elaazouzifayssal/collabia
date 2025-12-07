import api from './api';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CurrentBook {
  id: string;
  userId: string;
  title: string;
  totalPages: number | null;
  pagesRead: number;
  status: 'reading' | 'paused' | 'completed';
  startDate: string;
  updatedAt: string;
}

export interface CurrentSkill {
  id: string;
  userId: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  notes: string | null;
  startDate: string;
  updatedAt: string;
}

export interface CurrentGame {
  id: string;
  userId: string;
  name: string;
  rank: string | null;
  frequency: 'daily' | 'weekly' | 'occasionally' | null;
  startDate: string;
  updatedAt: string;
}

export interface BookHistoryItem {
  id: string;
  userId: string;
  title: string;
  totalPages: number | null;
  pagesRead: number | null;
  status: 'completed' | 'paused';
  rating: number | null;
  startedAt: string;
  finishedAt: string;
}

export interface SkillHistoryItem {
  id: string;
  userId: string;
  name: string;
  levelReached: string;
  notes: string | null;
  startedAt: string;
  completedAt: string;
}

export interface GameHistoryItem {
  id: string;
  userId: string;
  name: string;
  rank: string | null;
  playedFrom: string;
  playedTo: string;
}

export interface CurrentInterests {
  currentBook: CurrentBook | null;
  currentSkill: CurrentSkill | null;
  currentGame: CurrentGame | null;
}

export interface InterestHistory {
  bookHistory: BookHistoryItem[];
  skillHistory: SkillHistoryItem[];
  gameHistory: GameHistoryItem[];
}

export interface UserInterests {
  current: {
    book: CurrentBook | null;
    skill: CurrentSkill | null;
    game: CurrentGame | null;
  };
  history: {
    books: BookHistoryItem[];
    skills: SkillHistoryItem[];
    games: GameHistoryItem[];
  };
}

// Input types for creating/updating
export interface UpdateBookInput {
  title: string;
  totalPages?: number;
  pagesRead?: number;
  status?: 'reading' | 'paused' | 'completed';
}

export interface UpdateSkillInput {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
}

export interface UpdateGameInput {
  name: string;
  rank?: string;
  frequency?: 'daily' | 'weekly' | 'occasionally';
}

// ============================================
// SERVICE
// ============================================

export const interestService = {
  // ============================================
  // CURRENT INTERESTS
  // ============================================

  // Get current user's structured interests
  getCurrentInterests: async (): Promise<CurrentInterests> => {
    const response = await api.get('/api/interests/current');
    return response.data;
  },

  // ============================================
  // BOOK OPERATIONS
  // ============================================

  // Update current book (auto-archives old one)
  updateCurrentBook: async (data: UpdateBookInput): Promise<{ message: string; currentBook: CurrentBook }> => {
    const response = await api.put('/api/interests/book', data);
    return response.data;
  },

  // Update book progress
  updateBookProgress: async (pagesRead: number, status?: string): Promise<{ message: string; currentBook: CurrentBook | null }> => {
    const response = await api.patch('/api/interests/book/progress', { pagesRead, status });
    return response.data;
  },

  // Clear current book (optionally archive)
  clearCurrentBook: async (archive: boolean = true): Promise<{ message: string }> => {
    const response = await api.delete(`/api/interests/book?archive=${archive}`);
    return response.data;
  },

  // ============================================
  // SKILL OPERATIONS
  // ============================================

  // Update current skill (auto-archives old one)
  updateCurrentSkill: async (data: UpdateSkillInput): Promise<{ message: string; currentSkill: CurrentSkill }> => {
    const response = await api.put('/api/interests/skill', data);
    return response.data;
  },

  // Update skill level/notes
  updateSkillDetails: async (level?: string, notes?: string): Promise<{ message: string; currentSkill: CurrentSkill }> => {
    const response = await api.patch('/api/interests/skill/level', { level, notes });
    return response.data;
  },

  // Clear current skill (optionally archive)
  clearCurrentSkill: async (archive: boolean = true): Promise<{ message: string }> => {
    const response = await api.delete(`/api/interests/skill?archive=${archive}`);
    return response.data;
  },

  // ============================================
  // GAME OPERATIONS
  // ============================================

  // Update current game (auto-archives old one)
  updateCurrentGame: async (data: UpdateGameInput): Promise<{ message: string; currentGame: CurrentGame }> => {
    const response = await api.put('/api/interests/game', data);
    return response.data;
  },

  // Update game details
  updateGameDetails: async (rank?: string, frequency?: string): Promise<{ message: string; currentGame: CurrentGame }> => {
    const response = await api.patch('/api/interests/game', { rank, frequency });
    return response.data;
  },

  // Clear current game (optionally archive)
  clearCurrentGame: async (archive: boolean = true): Promise<{ message: string }> => {
    const response = await api.delete(`/api/interests/game?archive=${archive}`);
    return response.data;
  },

  // ============================================
  // HISTORY
  // ============================================

  // Get all history
  getHistory: async (limit: number = 20): Promise<InterestHistory> => {
    const response = await api.get(`/api/interests/history?limit=${limit}`);
    return response.data;
  },

  // Get specific history type
  getBookHistory: async (limit: number = 20): Promise<{ history: BookHistoryItem[] }> => {
    const response = await api.get(`/api/interests/history/books?limit=${limit}`);
    return response.data;
  },

  getSkillHistory: async (limit: number = 20): Promise<{ history: SkillHistoryItem[] }> => {
    const response = await api.get(`/api/interests/history/skills?limit=${limit}`);
    return response.data;
  },

  getGameHistory: async (limit: number = 20): Promise<{ history: GameHistoryItem[] }> => {
    const response = await api.get(`/api/interests/history/games?limit=${limit}`);
    return response.data;
  },

  // Add rating to a completed book in history
  rateBook: async (bookId: string, rating: number): Promise<{ message: string; book: BookHistoryItem }> => {
    const response = await api.patch(`/api/interests/history/book/${bookId}/rating`, { rating });
    return response.data;
  },

  // ============================================
  // OTHER USER'S INTERESTS
  // ============================================

  // Get another user's interests (for profile viewing)
  getUserInterests: async (userId: string): Promise<UserInterests> => {
    const response = await api.get(`/api/interests/user/${userId}`);
    return response.data;
  },

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  // Calculate book progress percentage
  getBookProgressPercent: (book: CurrentBook | { pagesRead: number; totalPages: number | null }): number => {
    if (!book.totalPages || book.totalPages === 0) return 0;
    return Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100));
  },

  // Get level display text
  getLevelDisplay: (level: string): { text: string; color: string } => {
    switch (level) {
      case 'beginner':
        return { text: 'Beginner', color: '#22c55e' };
      case 'intermediate':
        return { text: 'Intermediate', color: '#f59e0b' };
      case 'advanced':
        return { text: 'Advanced', color: '#8b5cf6' };
      default:
        return { text: level, color: '#6b7280' };
    }
  },

  // Get frequency display text
  getFrequencyDisplay: (frequency: string | null): string => {
    switch (frequency) {
      case 'daily':
        return 'Plays daily';
      case 'weekly':
        return 'Plays weekly';
      case 'occasionally':
        return 'Plays occasionally';
      default:
        return '';
    }
  },

  // Get reading status display
  getBookStatusDisplay: (status: string): { text: string; color: string } => {
    switch (status) {
      case 'reading':
        return { text: 'Currently Reading', color: '#22c55e' };
      case 'paused':
        return { text: 'Paused', color: '#f59e0b' };
      case 'completed':
        return { text: 'Completed', color: '#8b5cf6' };
      default:
        return { text: status, color: '#6b7280' };
    }
  },

  // Calculate days since started
  getDaysSinceStart: (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
};
