import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { conversationService } from '../services/conversationService';
import Avatar from '../components/Avatar';

interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  school?: string;
  location?: string;
  bio?: string;
  status?: string;
  interests?: string[];
  skills?: string[];
  schoolVerified?: boolean;
  openToStudyPartner?: boolean;
  openToProjects?: boolean;
  openToAccountability?: boolean;
  openToCofounder?: boolean;
  openToHelpingOthers?: boolean;
  lastActiveAt?: string;
}

export default function CollaboratorProfileScreen({ route, navigation }: any) {
  const { userId } = route.params;
  const { user: currentUser } = useAuth();
  const [collaborator, setCollaborator] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessaging, setIsMessaging] = useState(false);

  useEffect(() => {
    loadCollaboratorProfile();
  }, [userId]);

  const loadCollaboratorProfile = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUserById(userId);
      setCollaborator(data.user);
    } catch (error) {
      console.error('Failed to load collaborator profile:', error);
      Alert.alert('Error', 'Failed to load profile');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!collaborator) return;

    setIsMessaging(true);
    try {
      const conversation = await conversationService.createOrGetConversation(collaborator.id);
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: {
          conversationId: conversation.id,
          otherUser: {
            id: collaborator.id,
            name: collaborator.name,
            email: collaborator.email,
          },
        },
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      Alert.alert('Error', 'Failed to start conversation');
    } finally {
      setIsMessaging(false);
    }
  };

  const getOpenToList = () => {
    if (!collaborator) return [];
    const preferences = [];
    if (collaborator.openToStudyPartner) preferences.push('Study partner');
    if (collaborator.openToProjects) preferences.push('Projects');
    if (collaborator.openToAccountability) preferences.push('Accountability');
    if (collaborator.openToCofounder) preferences.push('Co-founder');
    if (collaborator.openToHelpingOthers) preferences.push('Helping others');
    return preferences;
  };

  const getCollaborationDetails = () => {
    if (!collaborator) return [];
    const details = [];
    if (collaborator.openToStudyPartner) {
      details.push({ emoji: '📚', label: 'Study Partner', desc: 'Find someone to study with' });
    }
    if (collaborator.openToProjects) {
      details.push({ emoji: '💻', label: 'Projects', desc: 'Collaborate on projects together' });
    }
    if (collaborator.openToAccountability) {
      details.push({ emoji: '⚡', label: 'Accountability Partner', desc: 'Keep each other motivated' });
    }
    if (collaborator.openToCofounder) {
      details.push({ emoji: '🚀', label: 'Co-founder', desc: 'Build a startup together' });
    }
    if (collaborator.openToHelpingOthers) {
      details.push({ emoji: '🤝', label: 'Helping Others', desc: 'Share knowledge and help out' });
    }
    return details;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  if (!collaborator) {
    return null;
  }

  const openToList = getOpenToList();
  const collaborationDetails = getCollaborationDetails();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar name={collaborator.name} email={collaborator.email} size={100} />

          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{collaborator.name}</Text>
              {collaborator.schoolVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                </View>
              )}
            </View>
            {collaborator.username && (
              <Text style={styles.username}>@{collaborator.username}</Text>
            )}
          </View>

          {collaborator.school && (
            <View style={styles.schoolRow}>
              <Ionicons name="school-outline" size={18} color="#6b7280" />
              <Text style={styles.schoolText}>{collaborator.school}</Text>
            </View>
          )}

          {collaborator.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={18} color="#6b7280" />
              <Text style={styles.locationText}>{collaborator.location}</Text>
            </View>
          )}

          {collaborator.status && (
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{collaborator.status}</Text>
            </View>
          )}

          {openToList.length > 0 && (
            <Text style={styles.openToLine}>
              Open to: {openToList.join(', ')}
            </Text>
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {collaborator.bio ? (
            <Text style={styles.bioText}>{collaborator.bio}</Text>
          ) : (
            <Text style={styles.placeholderText}>No bio added yet.</Text>
          )}
        </View>

        {/* Skills & Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Interests</Text>

          {collaborator.skills && collaborator.skills.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Skills</Text>
              <View style={styles.tagsContainer}>
                {collaborator.skills.map((skill, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {collaborator.interests && collaborator.interests.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Interests</Text>
              <View style={styles.tagsContainer}>
                {collaborator.interests.map((interest, index) => (
                  <View key={index} style={[styles.tag, styles.interestTag]}>
                    <Text style={[styles.tagText, styles.interestTagText]}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {(!collaborator.skills || collaborator.skills.length === 0) &&
           (!collaborator.interests || collaborator.interests.length === 0) && (
            <Text style={styles.placeholderText}>No skills or interests added yet.</Text>
          )}
        </View>

        {/* Collaboration Preferences */}
        {collaborationDetails.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collaboration Preferences</Text>
            <View style={styles.preferencesContainer}>
              {collaborationDetails.map((pref, index) => (
                <View key={index} style={styles.preferenceItem}>
                  <Text style={styles.preferenceEmoji}>{pref.emoji}</Text>
                  <View style={styles.preferenceContent}>
                    <Text style={styles.preferenceLabel}>{pref.label}</Text>
                    <Text style={styles.preferenceDesc}>{pref.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity
          style={[styles.messageButton, isMessaging && styles.messageButtonDisabled]}
          onPress={handleMessage}
          disabled={isMessaging}
        >
          {isMessaging ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="chatbubble-outline" size={20} color="#fff" />
              <Text style={styles.messageButtonText}>Message</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  username: {
    fontSize: 15,
    color: '#6366f1',
    marginTop: 4,
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  schoolText: {
    fontSize: 15,
    color: '#6b7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statusPill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  statusText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  openToLine: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  placeholderText: {
    fontSize: 15,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  tagText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
  },
  interestTag: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  interestTagText: {
    color: '#d97706',
  },
  preferencesContainer: {
    gap: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  preferenceEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  preferenceDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  messageButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  messageButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
