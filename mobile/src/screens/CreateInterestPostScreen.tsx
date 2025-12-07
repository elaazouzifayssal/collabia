import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { interestPostService } from '../services/interestPostService';
import { useAuth } from '../context/AuthContext';

const TYPE_CONFIG = {
  book: {
    emoji: '📚',
    label: 'Book',
    placeholder: 'Share your thoughts about this book...',
    gradient: ['#A06EFF', '#6C4DFF'] as const,
  },
  skill: {
    emoji: '🎯',
    label: 'Skill',
    placeholder: 'Share your learning journey...',
    gradient: ['#00D9A5', '#00B388'] as const,
  },
  game: {
    emoji: '🎮',
    label: 'Game',
    placeholder: 'Share your gaming experience...',
    gradient: ['#FF6B9D', '#C44569'] as const,
  },
};

export default function CreateInterestPostScreen({ route, navigation }: any) {
  const { type, value, currentProgress } = route.params;
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something before posting');
      return;
    }

    setIsSubmitting(true);
    try {
      await interestPostService.createPost({
        type,
        interestValue: value,
        content: content.trim(),
        progressSnapshot: type === 'book' ? currentProgress : undefined,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Interest Badge */}
          <View style={styles.interestBadge}>
            <LinearGradient
              colors={config.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.interestGradient}
            >
              <Text style={styles.interestEmoji}>{config.emoji}</Text>
              <Text style={styles.interestValue} numberOfLines={1}>
                {value}
              </Text>
            </LinearGradient>
          </View>

          {/* Progress indicator for books */}
          {type === 'book' && currentProgress !== undefined && currentProgress !== null && (
            <View style={styles.progressIndicator}>
              <Ionicons name="bookmark" size={14} color={config.gradient[0]} />
              <Text style={[styles.progressText, { color: config.gradient[0] }]}>
                Posting at page {currentProgress}
              </Text>
            </View>
          )}

          {/* Content Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={config.placeholder}
              placeholderTextColor="#9ca3af"
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={1000}
              textAlignVertical="top"
              autoFocus
            />
            <Text style={styles.charCount}>{content.length}/1000</Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !content.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={content.trim() ? config.gradient : ['#9ca3af', '#9ca3af']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitText}>Post</Text>
                  <Ionicons name="send" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
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
    marginBottom: 12,
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
  interestEmoji: {
    fontSize: 16,
  },
  interestValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    maxWidth: 250,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingLeft: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    flex: 1,
    minHeight: 160,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
