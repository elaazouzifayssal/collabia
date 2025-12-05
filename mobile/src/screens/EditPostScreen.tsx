import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { postService } from '../services/postService';

export default function EditPostScreen({ navigation, route }: any) {
  const { post } = route.params;

  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description || '');
  const [tagsInput, setTagsInput] = useState(post.tags.join(', '));
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!tagsInput.trim()) {
      Alert.alert('Error', 'Please add at least one tag');
      return;
    }

    setIsLoading(true);

    try {
      const tags = tagsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      if (tags.length === 0) {
        Alert.alert('Error', 'Please add at least one valid tag');
        setIsLoading(false);
        return;
      }

      await postService.updatePost(post.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        tags,
      });

      Alert.alert('Success', 'Post updated successfully!');
      navigation.goBack();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update post';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Edit Post</Text>
        <Text style={styles.headerSubtitle}>
          Update your collaboration post
        </Text>

        <Text style={styles.label}>Title *</Text>
        <Text style={styles.hint}>What are you looking for?</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Looking for React Native co-learner"
          editable={!isLoading}
        />

        <Text style={styles.label}>Description</Text>
        <Text style={styles.hint}>Add more details about your goal</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="e.g., I want to build a mobile app and would love to learn together. We can meet twice a week."
          multiline
          numberOfLines={5}
          editable={!isLoading}
        />

        <Text style={styles.label}>Tags *</Text>
        <Text style={styles.hint}>Separate with commas (topics, skills, interests)</Text>
        <TextInput
          style={styles.input}
          value={tagsInput}
          onChangeText={setTagsInput}
          placeholder="e.g., React Native, Mobile Dev, Startup"
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Post</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    marginTop: 16,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  updateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
