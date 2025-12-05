import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from './Avatar';
import { timeAgo } from '../utils/timeAgo';

interface PostCardProps {
  post: any;
  onInterestToggled?: () => void;
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
}

export default function PostCard({ post, onInterestToggled, onPostDeleted, onPostUpdated }: PostCardProps) {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { newPostIds, newInterestPostIds, markPostAsSeen, markInterestAsSeen } = useNotifications();
  const [isInterested, setIsInterested] = useState(
    post.interests?.some((i: any) => i.userId === user?.id) || false
  );
  const [interestCount, setInterestCount] = useState(post.interests?.length || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isNewPost = newPostIds.has(post.id);
  const hasNewInterest = newInterestPostIds.has(post.id);

  // Mark post as seen when it appears
  useEffect(() => {
    if (isNewPost) {
      // Give user time to see the badge before removing it
      const timer = setTimeout(() => {
        markPostAsSeen(post.id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNewPost, post.id, markPostAsSeen]);

  // Mark interest as seen when user views their post
  useEffect(() => {
    if (hasNewInterest) {
      const timer = setTimeout(() => {
        markInterestAsSeen(post.id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasNewInterest, post.id, markInterestAsSeen]);

  const handleInterest = async () => {
    if (post.author.id === user?.id) {
      Alert.alert('Info', "You can't be interested in your own post");
      return;
    }

    setIsLoading(true);

    try {
      const response = await postService.toggleInterest(post.id);

      setIsInterested(response.isInterested);
      setInterestCount((prev) => response.isInterested ? prev + 1 : prev - 1);

      if (onInterestToggled) {
        onInterestToggled();
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to toggle interest';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInterested = () => {
    navigation.navigate('InterestedUsers', {
      postId: post.id,
      postTitle: post.title,
    });
  };

  const handleEdit = () => {
    setShowMenu(false);
    navigation.navigate('EditPost', {
      post: post,
    });
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await postService.deletePost(post.id);
              Alert.alert('Success', 'Post deleted successfully');
              if (onPostDeleted) {
                onPostDeleted();
              }
            } catch (error: any) {
              const message = error.response?.data?.error || 'Failed to delete post';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const isOwnPost = post.author.id === user?.id;

  return (
    <View style={styles.card}>
      {/* Author Info */}
      <View style={styles.header}>
        <Avatar name={post.author.name} email={post.author.email} size={40} />
        <View style={styles.authorInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            <Text style={styles.timeAgo}>• {timeAgo(post.createdAt)}</Text>
          </View>
          {post.author.school && (
            <Text style={styles.authorSchool}>{post.author.school}</Text>
          )}
        </View>
        {isOwnPost && (
          <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuButton}>
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Post Content */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{post.title}</Text>
        <View style={styles.badgesRow}>
          {isNewPost && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {hasNewInterest && isOwnPost && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeText}>🔔 New Interest</Text>
            </View>
          )}
          {interestCount >= 3 && (
            <View style={styles.hotBadge}>
              <Text style={styles.hotBadgeText}>🔥 HOT</Text>
            </View>
          )}
        </View>
      </View>

      {post.description && (
        <Text style={styles.description} numberOfLines={3}>
          {post.description}
        </Text>
      )}

      {/* Tags */}
      <View style={styles.tags}>
        {post.tags.map((tag: string, index: number) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={isOwnPost && interestCount > 0 ? handleViewInterested : undefined}
          disabled={!isOwnPost || interestCount === 0}
        >
          <Text style={[styles.interestCount, isOwnPost && interestCount > 0 && styles.interestCountClickable]}>
            {interestCount} {interestCount === 1 ? 'person' : 'people'} interested
          </Text>
        </TouchableOpacity>

        {!isOwnPost && (
          <TouchableOpacity
            style={[
              styles.interestButton,
              isInterested && styles.interestedButton,
            ]}
            onPress={handleInterest}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.interestButtonText,
                isInterested && styles.interestedButtonText,
              ]}
            >
              {isInterested ? '✓ Interested' : 'Interested'}
            </Text>
          </TouchableOpacity>
        )}

        {isOwnPost && interestCount > 0 && (
          <TouchableOpacity style={styles.viewButton} onPress={handleViewInterested}>
            <Text style={styles.viewButtonText}>View Interested</Text>
          </TouchableOpacity>
        )}

        {isOwnPost && interestCount === 0 && (
          <View style={styles.ownPostBadge}>
            <Text style={styles.ownPostText}>Your Post</Text>
          </View>
        )}
      </View>

      {/* Options Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuModal}>
            <TouchableOpacity style={styles.menuOption} onPress={handleEdit}>
              <Text style={styles.menuOptionText}>Edit Post</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuOption} onPress={handleDelete}>
              <Text style={[styles.menuOptionText, styles.deleteText]}>Delete Post</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  authorSchool: {
    fontSize: 12,
    color: '#6b7280',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  newBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  activityBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  activityBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#065f46',
  },
  hotBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  hotBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  interestCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  interestCountClickable: {
    color: '#6366f1',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  interestButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  interestedButton: {
    backgroundColor: '#d1fae5',
  },
  interestButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  interestedButtonText: {
    color: '#059669',
  },
  viewButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ownPostBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ownPostText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    overflow: 'hidden',
  },
  menuOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuOptionText: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  deleteText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
