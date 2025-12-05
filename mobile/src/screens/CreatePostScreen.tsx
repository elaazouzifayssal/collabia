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

interface Template {
  id: string;
  icon: string;
  title: string;
  label: string;
  titleText: string;
  descriptionText: string;
  tags: string[];
}

const TEMPLATES: Template[] = [
  {
    id: 'study-partner',
    icon: '📚',
    title: 'Study Partner',
    label: 'Find someone to study with',
    titleText: 'Looking for study partner',
    descriptionText: 'I need a study partner to prepare for exams together. We can meet regularly to review material and help each other understand difficult concepts.',
    tags: ['Study', 'Academic', 'Learning'],
  },
  {
    id: 'project-collab',
    icon: '💻',
    title: 'Project Collab',
    label: 'Build something together',
    titleText: 'Looking for project collaborator',
    descriptionText: 'I have an idea for a project and need someone with complementary skills to build it together. Let\'s create something amazing!',
    tags: ['Project', 'Collaboration', 'Tech'],
  },
  {
    id: 'startup-cofounder',
    icon: '🚀',
    title: 'Co-founder',
    label: 'Start a business',
    titleText: 'Searching for startup co-founder',
    descriptionText: 'I\'m working on a startup idea and looking for a co-founder who shares the vision. Looking for someone passionate about building and scaling a business.',
    tags: ['Startup', 'Entrepreneurship', 'Co-founder'],
  },
  {
    id: 'skill-exchange',
    icon: '🔄',
    title: 'Skill Exchange',
    label: 'Teach and learn',
    titleText: 'Want to exchange skills',
    descriptionText: 'I can teach what I know in exchange for learning something new. Let\'s help each other grow by sharing our expertise.',
    tags: ['Skills', 'Teaching', 'Learning'],
  },
  {
    id: 'accountability',
    icon: '⚡',
    title: 'Accountability',
    label: 'Stay motivated together',
    titleText: 'Need accountability partner',
    descriptionText: 'Looking for someone to keep each other accountable on our goals. Regular check-ins and mutual support to stay on track.',
    tags: ['Accountability', 'Goals', 'Motivation'],
  },
  {
    id: 'event-buddy',
    icon: '🎯',
    title: 'Event Buddy',
    label: 'Attend events together',
    titleText: 'Looking for event/workshop buddy',
    descriptionText: 'Want to attend events, workshops, or conferences together. More fun and valuable with someone to discuss ideas with.',
    tags: ['Events', 'Networking', 'Learning'],
  },
];

export default function CreatePostScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  const handleTemplateSelect = (template: Template) => {
    setTitle(template.titleText);
    setDescription(template.descriptionText);
    setTagsInput(template.tags.join(', '));
    setShowTemplates(false);
  };

  const handleStartFromScratch = () => {
    setShowTemplates(false);
  };

  const handleCreate = async () => {
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

      await postService.createPost({
        title: title.trim(),
        description: description.trim() || undefined,
        tags,
      });

      Alert.alert('Success', 'Post created successfully!');
      navigation.goBack();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create post';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Create Collab Post</Text>
        <Text style={styles.headerSubtitle}>
          Find someone to build or learn with
        </Text>

        {showTemplates ? (
          <>
            <Text style={styles.templatesTitle}>⚡ Quick Start Templates</Text>
            <Text style={styles.templatesSubtitle}>
              Choose a template to get started faster
            </Text>

            <View style={styles.templatesGrid}>
              {TEMPLATES.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => handleTemplateSelect(template)}
                >
                  <Text style={styles.templateIcon}>{template.icon}</Text>
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateLabel}>{template.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.startFromScratchButton}
              onPress={handleStartFromScratch}
            >
              <Text style={styles.startFromScratchText}>
                ✏️ Start from scratch
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.backToTemplatesButton}
              onPress={() => setShowTemplates(true)}
            >
              <Text style={styles.backToTemplatesText}>← Use template</Text>
            </TouchableOpacity>

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

            <View style={styles.examples}>
              <Text style={styles.examplesTitle}>💡 Examples:</Text>
              <Text style={styles.exampleText}>• "Need study partner for Analyse S1"</Text>
              <Text style={styles.exampleText}>• "Looking for co-founder to build SaaS"</Text>
              <Text style={styles.exampleText}>• "Want accountability buddy for learning AI"</Text>
            </View>

            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create Post</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
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
  templatesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  templatesSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  templatesGrid: {
    gap: 12,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  templateLabel: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  startFromScratchButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  startFromScratchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  backToTemplatesButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  backToTemplatesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
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
  examples: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },
  createButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  createButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  createButtonText: {
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
