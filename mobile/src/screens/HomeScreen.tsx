import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { postService } from '../services/postService';
import { useNotifications } from '../context/NotificationContext';
import PostCard from '../components/PostCard';

export default function HomeScreen({ navigation }: any) {
  const { refreshNotifications, newPostIds, newInterestPostIds } = useNotifications();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate total notification count
  const notificationCount = newPostIds.size + newInterestPostIds.size;

  const loadPosts = async () => {
    try {
      const data = await postService.getPosts();
      setPosts(data);
      // Refresh notifications to update NEW badges
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPosts();
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

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
          <Text style={styles.headerTitle}>Home</Text>
          <Text style={styles.headerSubtitle}>Find your next collaborator</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notificationIndicator}
            onPress={handleNotificationPress}
          >
            <Text style={styles.notificationBadge}>🔔</Text>
            {notificationCount > 0 && (
              <View style={styles.notificationCount}>
                <Text style={styles.notificationCountText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
            <Text style={styles.createButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts Feed */}
      <View style={styles.container}>
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🚀</Text>
            <Text style={styles.emptyTitle}>Start Your Journey</Text>
            <Text style={styles.emptyText}>
              Be the first to post! Find study partners, build projects, or start a startup together.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreatePost}>
              <Text style={styles.emptyButtonText}>Create Your First Post</Text>
            </TouchableOpacity>
            <Text style={styles.emptyHint}>
              💡 Tip: Posts with specific goals get 3x more responses
            </Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onInterestToggled={loadPosts}
                onPostDeleted={loadPosts}
                onPostUpdated={loadPosts}
              />
            )}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#6366f1"
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 2,
  },
  notificationIndicator: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    fontSize: 24,
  },
  notificationCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
