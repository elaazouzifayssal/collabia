import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { interestPostService, InterestPost } from '../services/interestPostService';
import InterestPostCard from './InterestPostCard';

interface InterestPostsSectionProps {
  type: 'book' | 'skill' | 'game';
  value: string;
  gradientColors: readonly [string, string];
  currentProgress?: number;
  onViewAll: () => void;
  onPostPress: (post: InterestPost) => void;
  onCreatePost: () => void;
}

export default function InterestPostsSection({
  type,
  value,
  gradientColors,
  currentProgress,
  onViewAll,
  onPostPress,
  onCreatePost,
}: InterestPostsSectionProps) {
  const [posts, setPosts] = useState<InterestPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [type, value]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await interestPostService.getPostsByInterest(type, value, 5);
      setPosts(data.posts);
    } catch (error) {
      console.error('Failed to load interest posts:', error);
    } finally {
      setIsLoading(false);
    }
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

  const typeLabel = type === 'book' ? 'this book' : type === 'skill' ? 'this skill' : 'this game';

  return (
    <View style={styles.container}>
      {/* Header with New Post button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles-outline" size={16} color={gradientColors[0]} />
          <Text style={[styles.headerTitle, { color: gradientColors[0] }]}>
            Discussion
          </Text>
        </View>
        <TouchableOpacity
          onPress={onCreatePost}
          style={styles.newPostButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.newPostGradient}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.newPostText}>New Post</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={gradientColors[0]} />
        </View>
      )}

      {/* Empty state */}
      {!isLoading && posts.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet about {typeLabel}</Text>
          <Text style={styles.emptySubtext}>Be the first to share your thoughts!</Text>
        </View>
      )}

      {/* Posts list - horizontal scroll */}
      {!isLoading && posts.length > 0 && (
        <>
          <FlatList
            horizontal
            data={posts}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.postsContainer}
            renderItem={({ item }) => (
              <InterestPostCard
                post={item}
                gradientColors={gradientColors}
                onPress={() => onPostPress(item)}
                onLike={() => handleLike(item.id)}
                onComment={() => onPostPress(item)}
                compact
              />
            )}
          />

          {/* See all link */}
          <TouchableOpacity onPress={onViewAll} style={styles.seeAllButton}>
            <Text style={[styles.seeAllText, { color: gradientColors[0] }]}>
              See all posts
            </Text>
            <Ionicons name="chevron-forward" size={14} color={gradientColors[0]} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  newPostButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  newPostGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  newPostText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
  },
  postsContainer: {
    paddingRight: 20,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
