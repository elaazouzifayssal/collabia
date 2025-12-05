import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function CollaborationPreferencesScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();

  const [openToStudyPartner, setOpenToStudyPartner] = useState(user?.openToStudyPartner || false);
  const [openToProjects, setOpenToProjects] = useState(user?.openToProjects || false);
  const [openToAccountability, setOpenToAccountability] = useState(user?.openToAccountability || false);
  const [openToCofounder, setOpenToCofounder] = useState(user?.openToCofounder || false);
  const [openToHelpingOthers, setOpenToHelpingOthers] = useState(user?.openToHelpingOthers || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateProfile({
        openToStudyPartner,
        openToProjects,
        openToAccountability,
        openToCofounder,
        openToHelpingOthers,
      });

      updateUser(updatedUser);
      Alert.alert('Success', 'Collaboration preferences updated successfully');
      navigation.goBack();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update preferences';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collaboration Preferences</Text>
        <Text style={styles.subtitle}>
          Let other students know what kind of collaborations you're open to
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceLeft}>
            <Text style={styles.preferenceEmoji}>📚</Text>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Study Partner</Text>
              <Text style={styles.preferenceDescription}>Find someone to study with</Text>
            </View>
          </View>
          <Switch
            value={openToStudyPartner}
            onValueChange={setOpenToStudyPartner}
            disabled={isLoading}
            trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
            thumbColor={openToStudyPartner ? '#6366f1' : '#f3f4f6'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceLeft}>
            <Text style={styles.preferenceEmoji}>💻</Text>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Projects</Text>
              <Text style={styles.preferenceDescription}>Collaborate on projects together</Text>
            </View>
          </View>
          <Switch
            value={openToProjects}
            onValueChange={setOpenToProjects}
            disabled={isLoading}
            trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
            thumbColor={openToProjects ? '#6366f1' : '#f3f4f6'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceLeft}>
            <Text style={styles.preferenceEmoji}>⚡</Text>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Accountability Partner</Text>
              <Text style={styles.preferenceDescription}>Keep each other motivated</Text>
            </View>
          </View>
          <Switch
            value={openToAccountability}
            onValueChange={setOpenToAccountability}
            disabled={isLoading}
            trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
            thumbColor={openToAccountability ? '#6366f1' : '#f3f4f6'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceLeft}>
            <Text style={styles.preferenceEmoji}>🚀</Text>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Co-founder</Text>
              <Text style={styles.preferenceDescription}>Build a startup together</Text>
            </View>
          </View>
          <Switch
            value={openToCofounder}
            onValueChange={setOpenToCofounder}
            disabled={isLoading}
            trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
            thumbColor={openToCofounder ? '#6366f1' : '#f3f4f6'}
          />
        </View>

        <View style={[styles.preferenceItem, styles.preferenceItemLast]}>
          <View style={styles.preferenceLeft}>
            <Text style={styles.preferenceEmoji}>🤝</Text>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Helping Others</Text>
              <Text style={styles.preferenceDescription}>Share your knowledge</Text>
            </View>
          </View>
          <Switch
            value={openToHelpingOthers}
            onValueChange={setOpenToHelpingOthers}
            disabled={isLoading}
            trackColor={{ false: '#e5e7eb', true: '#a5b4fc' }}
            thumbColor={openToHelpingOthers ? '#6366f1' : '#f3f4f6'}
          />
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
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  preferenceItemLast: {
    borderBottomWidth: 0,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  preferenceEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 13,
    color: '#9ca3af',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginTop: 24,
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
