import api from './api';

interface User {
  id: string;
  name: string;
  email: string;
  location?: string;
  school?: string;
  bio?: string;
  interests?: string[];
  skills?: string[];
  openToCofounder?: boolean;
  openToProjects?: boolean;
  openToStudyPartner?: boolean;
  openToAccountability?: boolean;
  openToHelpingOthers?: boolean;
  lastActiveAt?: string;
  schoolVerified?: boolean;
}

interface SwipeResult {
  swipe: {
    id: string;
    swiperId: string;
    swipedId: string;
    direction: string;
    createdAt: string;
    expiresAt?: string;
  };
  interest?: {
    id: string;
    senderId: string;
    receiverId: string;
    status: string;
    isSuperLike: boolean;
  };
  status: 'pending' | 'skipped';
}

interface Match {
  matchId: string;
  matchedAt: string;
  user: User;
}

interface ReceivedInterest {
  interestId: string;
  isSuperLike: boolean;
  createdAt: string;
  user: User;
}

interface SentInterest {
  interestId: string;
  isSuperLike: boolean;
  createdAt: string;
  receiverId: string;
  user: { id: string; name: string; email: string };
}

interface InterestResponse {
  interest: {
    id: string;
    senderId: string;
    receiverId: string;
    status: string;
    respondedAt: string;
  };
  conversation?: {
    id: string;
    participants: any[];
  };
  otherUser: User;
}

interface InterestStatus {
  hasSentInterest: boolean;
  status: 'pending' | 'mutual' | 'declined' | null;
  isSuperLike: boolean;
}

interface NewMatch {
  interestId: string;
  matchedAt: string;
  user: User;
}

export const swipeService = {
  // Get recommended users to swipe on
  async getSwipeableUsers(): Promise<User[]> {
    const response = await api.get('/api/swipes/users');
    return response.data;
  },

  // Record a swipe (left, right, or superlike) - creates pending interest for right/superlike
  async swipe(swipedId: string, direction: 'left' | 'right' | 'superlike'): Promise<SwipeResult> {
    const response = await api.post('/api/swipes', { swipedId, direction });
    return response.data;
  },

  // Get today's swipe count
  async getSwipeCount(): Promise<number> {
    const response = await api.get('/api/swipes/count');
    return response.data.count;
  },

  // Get all matches (mutual interests)
  async getMatches(): Promise<Match[]> {
    const response = await api.get('/api/swipes/matches');
    return response.data;
  },

  // Get people who are interested in me (pending)
  async getReceivedInterests(): Promise<ReceivedInterest[]> {
    const response = await api.get('/api/swipes/interests/received');
    return response.data;
  },

  // Get my pending interests (people I'm waiting on)
  async getSentInterests(): Promise<SentInterest[]> {
    const response = await api.get('/api/swipes/interests/sent');
    return response.data;
  },

  // Respond to an interest (accept or decline)
  async respondToInterest(interestId: string, action: 'accept' | 'decline'): Promise<InterestResponse> {
    const response = await api.post(`/api/swipes/interests/${interestId}/respond`, { action });
    return response.data;
  },

  // Get count of pending received interests (for badge)
  async getInterestsCount(): Promise<number> {
    const response = await api.get('/api/swipes/interests/count');
    return response.data.count;
  },

  // Check if I've already sent interest to a user
  async getInterestStatus(userId: string): Promise<InterestStatus> {
    const response = await api.get(`/api/swipes/interest-status/${userId}`);
    return response.data;
  },

  // Get new matches (people who accepted my interest that I haven't seen yet)
  async getNewMatches(): Promise<NewMatch[]> {
    const response = await api.get('/api/swipes/new-matches');
    return response.data;
  },

  // Get count of new matches (for badge)
  async getNewMatchesCount(): Promise<number> {
    const response = await api.get('/api/swipes/new-matches/count');
    return response.data.count;
  },

  // Mark a new match as seen
  async markMatchSeen(interestId: string): Promise<void> {
    await api.post(`/api/swipes/new-matches/${interestId}/mark-seen`);
  },

  // Mark all new matches as seen
  async markAllMatchesSeen(): Promise<void> {
    await api.post('/api/swipes/new-matches/mark-all-seen');
  },
};
