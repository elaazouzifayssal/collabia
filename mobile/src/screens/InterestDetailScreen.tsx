import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '../components/Avatar';
import InterestPostCard from '../components/InterestPostCard';
import { swipeService } from '../services/swipeService';
import {
  interestPostService,
  InterestPost,
} from '../services/interestPostService';

const INTEREST_CONFIG = {
  book: {
    icon: '📚',
    title: 'Reading the same book',
    peopleLabel: 'People reading this book',
    postsLabel: 'Posts about',
    gradient: ['#A06EFF', '#6C4DFF'] as const,
  },
  game: {
    icon: '🎮',
    title: 'Playing the same game',
    peopleLabel: 'People playing this game',
    postsLabel: 'Posts about',
    gradient: ['#FF6B9D', '#C44569'] as const,
  },
  skill: {
    icon: '🎯',
    title: 'Learning the same skill',
    peopleLabel: 'People learning this skill',
    postsLabel: 'Posts about',
    gradient: ['#00D9A5', '#00B388'] as const,
  },
};

interface User {
  id: string;
  name: string;
  email: string;
  location?: string;
  school?: string;
  structuredBook?: {
    pagesRead: number;
    totalPages: number | null;
    status: string;
  };
  structuredSkill?: {
    level: string;
    notes: string | null;
  };
  structuredGame?: {
    rank: string | null;
    frequency: string | null;
  };
}

export default function InterestDetailScreen({ route, navigation }: any) {
  const { type, value } = route.params as {
    type: 'book' | 'skill' | 'game';
    value: string;
  };

  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<InterestPost[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const config = INTEREST_CONFIG[type];

  useEffect(() => {
    loadData();
  }, [type, value]);

  const loadData = async () => {
    await Promise.all([loadUsers(), loadPosts()]);
  };

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await swipeService.getSameInterests();

      // Extract users for this specific interest type
      let interestUsers: User[] = [];
      if (type === 'book' && data.sameBook) {
        interestUsers = data.sameBook.users;
      } else if (type === 'game' && data.sameGame) {
        interestUsers = data.sameGame.users;
      } else if (type === 'skill' && data.sameSkill) {
        interestUsers = data.sameSkill.users;
      }

      setUsers(interestUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadPosts = async (cursor?: string) => {
    try {
      if (!cursor) setIsLoadingPosts(true);
      const data = await interestPostService.getPostsByInterest(type, value, 20, cursor);

      if (!cursor) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setHasMorePosts(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  }, [type, value]);

  const handleLoadMorePosts = () => {
    if (!isLoadingPosts && hasMorePosts && nextCursor) {
      loadPosts(nextCursor);
    }
  };

  const handleUserPress = (user: User) => {
    navigation.navigate('CollaboratorProfile', { userId: user.id });
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

  const getProgressText = (user: User): string | null => {
    if (type === 'book' && user.structuredBook) {
      const { pagesRead, totalPages } = user.structuredBook;
      if (totalPages) {
        const percent = Math.round((pagesRead / totalPages) * 100);
        return `${percent}% complete`;
      }
      return `Page ${pagesRead}`;
    }
    if (type === 'skill' && user.structuredSkill) {
      return user.structuredSkill.level.charAt(0).toUpperCase() + user.structuredSkill.level.slice(1);
    }
    if (type === 'game' && user.structuredGame?.rank) {
      return user.structuredGame.rank;
    }
    return null;
  };

  const renderUserCard = ({ item }: { item: User }) => {
    const progressText = getProgressText(item);

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => handleUserPress(item)}
        activeOpacity={0.8}
      >
        <Avatar name={item.name} email={item.email} size={64} />
        <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
        {item.location && (
          <Text style={styles.userLocation} numberOfLines={1}>{item.location}</Text>
        )}
        {progressText && (
          <View style={[styles.progressBadge, { backgroundColor: config.gradient[0] + '20' }]}>
            <Text style={[styles.progressText, { color: config.gradient[0] }]}>
              {progressText}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={config.gradient[0]}
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroIcon}>{config.icon}</Text>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{value}</Text>
              <Text style={styles.heroSubtitle}>{config.title}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* People Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{config.peopleLabel}</Text>

          {isLoadingUsers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={config.gradient[0]} />
            </View>
          ) : users.length > 0 ? (
            <FlatList
              horizontal
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={renderUserCard}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.usersListContent}
            />
          ) : (
            <View style={styles.emptyPeopleContainer}>
              <Text style={styles.emptyText}>No one else is here yet</Text>
            </View>
          )}
        </View>

        {/* Posts Section */}
        <View style={styles.section}>
          <View style={styles.postsSectionHeader}>
            <Text style={styles.sectionTitle}>{config.postsLabel} "{value}"</Text>
          </View>

          {/* Write a Post Button */}
          <TouchableOpacity
            style={styles.writePostButton}
            onPress={handleCreatePost}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={config.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.writePostGradient}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.writePostText}>Write a post</Text>
            </LinearGradient>
          </TouchableOpacity>

          {isLoadingPosts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={config.gradient[0]} />
            </View>
          ) : posts.length > 0 ? (
            <View style={styles.postsContainer}>
              {posts.map((post) => (
                <InterestPostCard
                  key={post.id}
                  post={post}
                  gradientColors={config.gradient}
                  onPress={() => handlePostPress(post)}
                  onLike={() => handleLike(post.id)}
                  onComment={() => handlePostPress(post)}
                  showInterestPill={false}
                />
              ))}

              {hasMorePosts && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={handleLoadMorePosts}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.loadMoreText, { color: config.gradient[0] }]}>
                    Load more posts
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyPostsContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: config.gradient[0] + '15' }]}>
                <Ionicons name="chatbubbles-outline" size={32} color={config.gradient[0]} />
              </View>
              <Text style={styles.emptyPostsTitle}>No posts yet</Text>
              <Text style={styles.emptyPostsText}>
                Be the first to share your thoughts about {value}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  heroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  heroIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  usersListContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  userCard: {
    width: 100,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
  },
  userLocation: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  progressBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyPeopleContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  postsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  writePostButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  writePostGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  writePostText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  postsContainer: {
    paddingHorizontal: 16,
  },
  loadMoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyPostsContainer: {
    paddingVertical: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyPostsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyPostsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
