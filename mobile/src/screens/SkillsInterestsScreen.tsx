import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function SkillsInterestsScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();

  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(', ') || '');
  const [interestsInput, setInterestsInput] = useState(user?.interests?.join(', ') || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const interests = interestsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const updatedUser = await userService.updateProfile({
        skills,
        interests,
      });

      updateUser(updatedUser);
      Alert.alert('Success', 'Skills and interests updated successfully');
      navigation.goBack();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update skills and interests';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Skills & Interests</Text>
        <Text style={styles.subtitle}>
          Share what you know and what you want to learn
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Skills</Text>
        <Text style={styles.hint}>What you already know (separate with commas)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={skillsInput}
          onChangeText={setSkillsInput}
          placeholder="e.g. Python, JavaScript, Figma, Machine Learning"
          multiline
          numberOfLines={4}
          editable={!isLoading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Interests</Text>
        <Text style={styles.hint}>What you want to learn (separate with commas)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={interestsInput}
          onChangeText={setInterestsInput}
          placeholder="e.g. React, AI, Design, Startups, Web3"
          multiline
          numberOfLines={4}
          editable={!isLoading}
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoEmoji}>💡</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Why add skills & interests?</Text>
          <Text style={styles.infoText}>
            This helps other students find you based on shared interests or complementary skills for collaboration.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
