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
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function EditProfileScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [school, setSchool] = useState(user?.school || '');
  // New discovery fields
  const [currentBook, setCurrentBook] = useState(user?.currentBook || '');
  const [currentGame, setCurrentGame] = useState(user?.currentGame || '');
  const [currentSkill, setCurrentSkill] = useState(user?.currentSkill || '');
  const [whatImBuilding, setWhatImBuilding] = useState(user?.whatImBuilding || '');
  const [lookingFor, setLookingFor] = useState<'cofounder' | 'team' | 'freelance' | 'learn' | null>(user?.lookingFor || null);
  const [isLoading, setIsLoading] = useState(false);

  const lookingForOptions: { value: 'cofounder' | 'team' | 'freelance' | 'learn'; label: string; emoji: string }[] = [
    { value: 'cofounder', label: 'Co-founder', emoji: '🚀' },
    { value: 'team', label: 'Team', emoji: '👥' },
    { value: 'freelance', label: 'Internship', emoji: '💼' },
    { value: 'learn', label: 'Learn', emoji: '📚' },
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setIsLoading(true);

    try {
      const updatedUser = await userService.updateProfile({
        name: name.trim(),
        username: username.trim() || undefined,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
        school: school.trim() || undefined,
        // New discovery fields
        currentBook: currentBook.trim() || undefined,
        currentGame: currentGame.trim() || undefined,
        currentSkill: currentSkill.trim() || undefined,
        whatImBuilding: whatImBuilding.trim() || undefined,
        lookingFor: lookingFor || undefined,
      });

      updateUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update profile';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.headerSubtitle}>
            Basic info that appears on your Collabiaa profile.
          </Text>
        </View>

        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          editable={!isLoading}
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="@username"
          autoCapitalize="none"
          editable={!isLoading}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g., Casablanca, Morocco"
          editable={!isLoading}
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="Short intro about who you are and what you want to build or learn."
          multiline
          numberOfLines={4}
          editable={!isLoading}
        />

        <Text style={styles.label}>School / University</Text>
        <TextInput
          style={styles.input}
          value={school}
          onChangeText={setSchool}
          placeholder="e.g., ENSA Marrakech"
          editable={!isLoading}
        />

        {/* Now Section - Discovery Fields */}
        <View style={styles.nowSection}>
          <Text style={styles.sectionHeader}>Now</Text>
          <Text style={styles.sectionSubtitle}>
            Share what you're currently into to connect with like-minded people
          </Text>

          <Text style={styles.label}>What I'm Building</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={whatImBuilding}
            onChangeText={setWhatImBuilding}
            placeholder="Describe what you're currently working on..."
            multiline
            numberOfLines={3}
            editable={!isLoading}
          />

          <Text style={styles.label}>Book I'm Reading</Text>
          <TextInput
            style={styles.input}
            value={currentBook}
            onChangeText={setCurrentBook}
            placeholder="e.g., Zero to One"
            editable={!isLoading}
          />

          <Text style={styles.label}>Game I'm Playing</Text>
          <TextInput
            style={styles.input}
            value={currentGame}
            onChangeText={setCurrentGame}
            placeholder="e.g., Valorant"
            editable={!isLoading}
          />

          <Text style={styles.label}>Skill I'm Learning</Text>
          <TextInput
            style={styles.input}
            value={currentSkill}
            onChangeText={setCurrentSkill}
            placeholder="e.g., Machine Learning"
            editable={!isLoading}
          />

          <Text style={styles.label}>Looking For</Text>
          <View style={styles.lookingForContainer}>
            {lookingForOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.lookingForOption,
                  lookingFor === option.value && styles.lookingForOptionSelected,
                ]}
                onPress={() => setLookingFor(lookingFor === option.value ? null : option.value)}
                disabled={isLoading}
              >
                <Text style={styles.lookingForEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.lookingForText,
                    lookingFor === option.value && styles.lookingForTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
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
    backgroundColor: '#f7f8fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
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
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
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
  // Now section styles
  nowSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  lookingForContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  lookingForOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  lookingForOptionSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#8b5cf6',
  },
  lookingForEmoji: {
    fontSize: 18,
  },
  lookingForText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  lookingForTextSelected: {
    color: '#8b5cf6',
  },
});
