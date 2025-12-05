import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../context/NotificationContext';
import { postService } from '../services/postService';
import Avatar from '../components/Avatar';
import { timeAgo } from '../utils/timeAgo';

interface Notification {
  id: string;
  type: 'new_post' | 'new_interest';
  title: string;
  description: string;
  timestamp: Date;
  post?: any;
  user?: any;
  icon: string;
  color: string;
}

export default function NotificationsScreen({ navigation }: any) {
  const { newPostIds, newInterestPostIds, markPostAsSeen, markInterestAsSeen } =
    useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [newPostIds, newInterestPostIds]);

  const loadNotifications = async () => {
    try {
      const allNotifications: Notification[] = [];

      // Get all posts to find new ones
      const posts = await postService.getPosts();
      const newPosts = posts.filter((post: any) => newPostIds.has(post.id));

      // Add new post notifications
      newPosts.forEach((post: any) => {
        allNotifications.push({
          id: `new_post_${post.id}`,
          type: 'new_post',
          title: 'New Post',
          description: `${post.author.name} posted: "${post.title}"`,
          timestamp: new Date(post.createdAt),
          post,
          user: post.author,
          icon: '📬',
          color: '#3b82f6',
        });
      });

      // Get user's posts with new interests
      const myPosts = await postService.getMyPosts();
      const postsWithNewInterests = myPosts.filter((post: any) =>
        newInterestPostIds.has(post.id)
      );

      // Add new interest notifications
      postsWithNewInterests.forEach((post: any) => {
        const newInterests = post.interests.filter((interest: any) => {
          // All interests in posts marked as having new interests
          return true;
        });

        newInterests.forEach((interest: any, index: number) => {
          allNotifications.push({
            id: `new_interest_${post.id}_${index}`,
            type: 'new_interest',
            title: 'New Interest',
            description: `Someone showed interest in "${post.title}"`,
            timestamp: new Date(interest.createdAt),
            post,
            icon: '👥',
            color: '#10b981',
          });
        });
      });

      // Sort by timestamp (newest first)
      allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as seen
    if (notification.type === 'new_post') {
      markPostAsSeen(notification.post.id);
    } else if (notification.type === 'new_interest') {
      markInterestAsSeen(notification.post.id);
    }

    // Navigate to relevant screen
    navigation.navigate('Home');
  };

  const handleDismiss = (notification: Notification) => {
    // Mark as seen without navigating
    if (notification.type === 'new_post') {
      markPostAsSeen(notification.post.id);
    } else if (notification.type === 'new_interest') {
      markInterestAsSeen(notification.post.id);
    }
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach((notification) => {
      if (notification.type === 'new_post') {
        markPostAsSeen(notification.post.id);
      } else if (notification.type === 'new_interest') {
        markInterestAsSeen(notification.post.id);
      }
    });
    navigation.goBack();
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.timestamp}>{timeAgo(item.timestamp)}</Text>
        </View>

        <Text style={styles.notificationDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {item.user && (
          <View style={styles.userInfo}>
            <Avatar name={item.user.name} email={item.user.email} size={20} />
            <Text style={styles.userName}>{item.user.name}</Text>
            {item.user.school && (
              <Text style={styles.userSchool}>• {item.user.school}</Text>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.dismissButton}
        onPress={() => handleDismiss(item)}
      >
        <Text style={styles.dismissIcon}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔔</Text>
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>
            You have no new notifications right now.
          </Text>
          <Text style={styles.emptyHint}>
            We'll notify you when there's new activity
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    fontSize: 28,
    color: '#6366f1',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  list: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  userSchool: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dismissButton: {
    padding: 4,
  },
  dismissIcon: {
    fontSize: 18,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
