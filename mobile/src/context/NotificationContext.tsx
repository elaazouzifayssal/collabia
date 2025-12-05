import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { conversationService } from '../services/conversationService';
import { postService } from '../services/postService';

interface NotificationContextType {
  unreadMessageCount: number;
  newPostIds: Set<string>;
  newInterestPostIds: Set<string>;
  refreshNotifications: () => Promise<void>;
  markPostAsSeen: (postId: string) => void;
  markInterestAsSeen: (postId: string) => void;
  clearMessageNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());
  const [newInterestPostIds, setNewInterestPostIds] = useState<Set<string>>(new Set());
  const [lastSeenPosts, setLastSeenPosts] = useState<Date>(new Date());
  const [lastCheckedInterests, setLastCheckedInterests] = useState<Date>(new Date());

  // Load last seen timestamps on mount
  useEffect(() => {
    loadLastSeenTimestamps();
  }, []);

  const loadLastSeenTimestamps = async () => {
    try {
      const postsTimestamp = await AsyncStorage.getItem('lastSeenPosts');
      const interestsTimestamp = await AsyncStorage.getItem('lastCheckedInterests');

      if (postsTimestamp) {
        setLastSeenPosts(new Date(postsTimestamp));
      }
      if (interestsTimestamp) {
        setLastCheckedInterests(new Date(interestsTimestamp));
      }
    } catch (error) {
      console.error('Failed to load last seen timestamps:', error);
    }
  };

  const refreshNotifications = useCallback(async () => {
    try {
      // Note: We don't track unread messages yet - would need backend support
      // For now, message count is always 0
      setUnreadMessageCount(0);

      // Get new posts (posts created after last seen)
      const posts = await postService.getPosts();
      const newPosts = posts.filter((post: any) => {
        const postDate = new Date(post.createdAt);
        return postDate > lastSeenPosts;
      });
      setNewPostIds(new Set(newPosts.map((p: any) => p.id)));

      // Get user's posts with new interests
      const myPosts = await postService.getMyPosts();
      const postsWithNewInterests = myPosts.filter((post: any) => {
        if (!post.interests || post.interests.length === 0) return false;

        // Check if any interest is newer than last checked
        return post.interests.some((interest: any) => {
          const interestDate = new Date(interest.createdAt);
          return interestDate > lastCheckedInterests;
        });
      });
      setNewInterestPostIds(new Set(postsWithNewInterests.map((p: any) => p.id)));
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, [lastSeenPosts, lastCheckedInterests]);

  const markPostAsSeen = useCallback(async (postId: string) => {
    setNewPostIds((prev) => {
      const updated = new Set(prev);
      updated.delete(postId);
      return updated;
    });
  }, []);

  const markInterestAsSeen = useCallback(async (postId: string) => {
    setNewInterestPostIds((prev) => {
      const updated = new Set(prev);
      updated.delete(postId);
      return updated;
    });

    // Update last checked interests timestamp
    const now = new Date();
    setLastCheckedInterests(now);
    await AsyncStorage.setItem('lastCheckedInterests', now.toISOString());
  }, []);

  const clearMessageNotifications = useCallback(() => {
    setUnreadMessageCount(0);
  }, []);

  // Update last seen posts timestamp when user views home feed
  useEffect(() => {
    const updateLastSeenPosts = async () => {
      const now = new Date();
      await AsyncStorage.setItem('lastSeenPosts', now.toISOString());
    };

    // Only update if we've seen new posts
    if (newPostIds.size > 0) {
      updateLastSeenPosts();
    }
  }, [newPostIds]);

  return (
    <NotificationContext.Provider
      value={{
        unreadMessageCount,
        newPostIds,
        newInterestPostIds,
        refreshNotifications,
        markPostAsSeen,
        markInterestAsSeen,
        clearMessageNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
