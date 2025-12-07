import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { postService, Post } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import ProgressBar from '../components/ui/ProgressBar';

interface BookInfo {
  title: string;
  pagesRead?: number;
  totalPages?: number | null;
  status?: 'reading' | 'paused' | 'completed';
  isHistory?: boolean;
  rating?: number | null;
}

export default function BookDetailScreen({ route, navigation }: any) {
  const { book } = route.params as { book: BookInfo };
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const progress = book.totalPages && book.pagesRead
    ? Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100))
    : 0;

  useEffect(() => {
    loadPosts();
  }, [book.title]);

  const loadPosts = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await postService.getUserInterestPosts(user.id, 'book', book.title);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const data = await postService.getUserInterestPosts(user.id, 'book', book.title);
      setPosts(data);
    } catch (error) {
      console.error('Failed to refresh posts:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [user, book.title]);

  const handlePostPress = (post: Post) => {
    navigation.navigate('Home', {
      screen: 'PostDetail',
      params: { postId: post.id },
    });
  };

  const handleCreatePost = () => {
    navigation.navigate('Home', {
      screen: 'CreatePost',
      params: {
        preselectedInterest: {
          type: 'book',
          value: book.title,
          progressSnapshot: book.pagesRead,
        },
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case 'reading':
        return { text: 'Currently Reading', color: '#22c55e' };
      case 'paused':
        return { text: 'Paused', color: '#f59e0b' };
      case 'completed':
        return { text: 'Completed', color: '#8b5cf6' };
      default:
        return { text: '', color: '#6b7280' };
    }
  };

  const statusDisplay = getStatusDisplay(book.status);

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => handlePostPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.postHeader}>
        <View style={styles.postMeta}>
          <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
          {item.progressSnapshot !== null && (
            <View style={styles.progressBadge}>
              <Ionicons name="bookmark" size={12} color="#8b5cf6" />
              <Text style={styles.progressBadgeText}>at page {item.progressSnapshot}</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.postDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      <View style={styles.tagsContainer}>
        {item.tags.map((tag, idx) => (
          <View key={idx} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerCard}>
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerEmoji}>📖</Text>
          {book.isHistory ? (
            <View style={styles.historyBadge}>
              <Text style={styles.historyBadgeText}>Past Read</Text>
            </View>
          ) : (
            statusDisplay.text && (
              <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color + '30' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusDisplay.color }]} />
                <Text style={[styles.statusBadgeText, { color: '#fff' }]}>
                  {statusDisplay.text}
                </Text>
              </View>
            )
          )}
        </View>

        <Text style={styles.bookTitle}>{book.title}</Text>

        {!book.isHistory && book.totalPages && (
          <View style={styles.progressSection}>
            <ProgressBar
              progress={progress}
              height={6}
              gradientColors={['#fff', '#e9d5ff']}
              backgroundColor="rgba(255,255,255,0.2)"
            />
            <View style={styles.progressDetails}>
              <Text style={styles.pagesText}>
                {book.pagesRead} / {book.totalPages} pages
              </Text>
              <Text style={styles.percentText}>{progress}%</Text>
            </View>
          </View>
        )}

        {book.isHistory && book.rating && (
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= book.rating! ? 'star' : 'star-outline'}
                size={18}
                color="#fbbf24"
              />
            ))}
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="document-text-outline" size={40} color="#8b5cf6" />
      </View>
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptyText}>
        Share your thoughts about "{book.title}"
      </Text>
      <TouchableOpacity style={styles.createPostButton} onPress={handleCreatePost}>
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createPostGradient}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createPostText}>Create Post</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Your Posts</Text>
      {posts.length > 0 && (
        <TouchableOpacity onPress={handleCreatePost} style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#8b5cf6" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderSectionHeader()}
            </>
          }
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#8b5cf6"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#6b7280',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  headerGradient: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerEmoji: {
    fontSize: 36,
  },
  historyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  historyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 30,
  },
  progressSection: {
    gap: 8,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagesText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  percentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  addButton: {
    padding: 4,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    marginBottom: 10,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  postDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 6,
  },
  postDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createPostButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createPostGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  createPostText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
