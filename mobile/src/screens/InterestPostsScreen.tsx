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
import { interestPostService, InterestPost } from '../services/interestPostService';
import InterestPostCard from '../components/InterestPostCard';

const INTEREST_GRADIENTS = {
  book: ['#A06EFF', '#6C4DFF'] as const,
  game: ['#FF6B9D', '#C44569'] as const,
  skill: ['#00D9A5', '#00B388'] as const,
};

const INTEREST_EMOJIS = {
  book: '📚',
  game: '🎮',
  skill: '🎯',
};

const INTEREST_LABELS = {
  book: 'Reading',
  game: 'Playing',
  skill: 'Learning',
};

export default function InterestPostsScreen({ route, navigation }: any) {
  const { type, value } = route.params as { type: 'book' | 'skill' | 'game'; value: string };
  const [posts, setPosts] = useState<InterestPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const gradientColors = INTEREST_GRADIENTS[type];

  useEffect(() => {
    loadPosts();
  }, [type, value]);

  const loadPosts = async (cursor?: string) => {
    try {
      if (!cursor) setIsLoading(true);
      const data = await interestPostService.getPostsByInterest(type, value, 20, cursor);
      if (!cursor) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await interestPostService.getPostsByInterest(type, value, 20);
      setPosts(data.posts);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Failed to refresh posts:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [type, value]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore && nextCursor) {
      loadPosts(nextCursor);
    }
  };

  const handlePostPress = (post: InterestPost) => {
    navigation.navigate('InterestPostThread', { postId: post.id });
  };

  const handleLike = async (postId: string) => {
    try {
      const result = await interestPostService.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: result.isLiked, likeCount: result.likeCount }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleCreatePost = () => {
    navigation.navigate('CreateInterestPost', { type, value });
  };

  const renderPost = ({ item }: { item: InterestPost }) => (
    <InterestPostCard
      post={item}
      gradientColors={gradientColors}
      onPress={() => handlePostPress(item)}
      onLike={() => handleLike(item.id)}
      onComment={() => handlePostPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerCard}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.headerEmoji}>{INTEREST_EMOJIS[type]}</Text>
        <View style={styles.headerContent}>
          <Text style={styles.headerLabel}>{INTEREST_LABELS[type]}</Text>
          <Text style={styles.headerValue} numberOfLines={2}>{value}</Text>
          <Text style={styles.headerCount}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: gradientColors[0] + '15' }]}>
        <Ionicons name="chatbubbles-outline" size={40} color={gradientColors[0]} />
      </View>
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptyText}>
        Be the first to share your thoughts about {value}
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreatePost}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createButtonGradient}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create Post</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={gradientColors[0]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={gradientColors[0]} />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPost}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={gradientColors[0]}
              />
            }
          />

          {/* Floating Create Button */}
          {posts.length > 0 && (
            <TouchableOpacity
              style={styles.fab}
              onPress={handleCreatePost}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={gradientColors}
                style={styles.fabGradient}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </>
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
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  headerCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
