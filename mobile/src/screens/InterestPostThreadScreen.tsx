import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  interestPostService,
  InterestPost,
  InterestComment,
} from '../services/interestPostService';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

export default function InterestPostThreadScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const { user } = useAuth();
  const [post, setPost] = useState<InterestPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const gradientColors = post
    ? interestPostService.getTypeGradient(post.type)
    : (['#A06EFF', '#6C4DFF'] as const);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const data = await interestPostService.getPost(postId);
      setPost(data);
    } catch (error) {
      console.error('Failed to load post:', error);
      Alert.alert('Error', 'Failed to load post');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      const result = await interestPostService.toggleLike(post.id);
      setPost({
        ...post,
        isLiked: result.isLiked,
        likeCount: result.likeCount,
      });
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSendComment = async () => {
    if (!post || !commentText.trim()) return;

    setIsSending(true);
    try {
      const result = await interestPostService.addComment(post.id, commentText.trim());
      setPost({
        ...post,
        comments: [...(post.comments || []), result.comment],
        commentCount: result.commentCount,
      });
      setCommentText('');
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send comment:', error);
      Alert.alert('Error', 'Failed to send comment');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;

    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await interestPostService.deleteComment(post.id, commentId);
              setPost({
                ...post,
                comments: post.comments?.filter((c) => c.id !== commentId),
                commentCount: result.commentCount,
              });
            } catch (error) {
              console.error('Failed to delete comment:', error);
              Alert.alert('Error', 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  const handleDeletePost = async () => {
    if (!post) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await interestPostService.deletePost(post.id);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  const formatTime = (dateString: string) => {
    return interestPostService.formatRelativeTime(dateString);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={gradientColors[0]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return null;
  }

  const isOwnPost = user?.id === post.userId;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Interest Badge */}
          <View style={styles.interestBadge}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.interestGradient}
            >
              <Text style={styles.interestIcon}>
                {interestPostService.getTypeIcon(post.type)}
              </Text>
              <Text style={styles.interestValue} numberOfLines={1}>
                {post.interestValue}
              </Text>
            </LinearGradient>
          </View>

          {/* Post Content */}
          <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <Avatar name={post.user.name} email={post.user.email} size={48} />
              <View style={styles.postHeaderInfo}>
                <Text style={styles.postUserName}>{post.user.name}</Text>
                <View style={styles.postMeta}>
                  <Text style={styles.postTime}>{formatTime(post.createdAt)}</Text>
                  {post.progressSnapshot !== null && post.type === 'book' && (
                    <>
                      <Text style={styles.dot}>·</Text>
                      <Text style={[styles.progressText, { color: gradientColors[0] }]}>
                        at page {post.progressSnapshot}
                      </Text>
                    </>
                  )}
                </View>
              </View>
              {isOwnPost && (
                <TouchableOpacity onPress={handleDeletePost} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            {/* Actions */}
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Ionicons
                  name={post.isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={post.isLiked ? '#ef4444' : '#6b7280'}
                />
                <Text style={[styles.actionText, post.isLiked && styles.actionTextLiked]}>
                  {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                </Text>
              </TouchableOpacity>

              <View style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={22} color="#6b7280" />
                <Text style={styles.actionText}>
                  {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                </Text>
              </View>
            </View>
          </View>

          {/* Comments */}
          {post.comments && post.comments.length > 0 && (
            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>Comments</Text>
              {post.comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <Avatar
                    name={comment.user.name}
                    email={comment.user.email}
                    size={36}
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUserName}>{comment.user.name}</Text>
                      <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                  {comment.userId === user?.id && (
                    <TouchableOpacity
                      onPress={() => handleDeleteComment(comment.id)}
                      style={styles.commentDeleteButton}
                    >
                      <Ionicons name="close-circle" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <Avatar name={user?.name || ''} email={user?.email} size={36} />
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            placeholderTextColor="#9ca3af"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !commentText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendComment}
            disabled={!commentText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  interestBadge: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  interestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  interestIcon: {
    fontSize: 16,
  },
  interestValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    maxWidth: 200,
  },
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  postHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  postTime: {
    fontSize: 13,
    color: '#9ca3af',
  },
  dot: {
    fontSize: 13,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionTextLiked: {
    color: '#ef4444',
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  commentTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentDeleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
});
