import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchService } from '../services/searchService';
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
  interests?: string[];
  skills?: string[];
  schoolVerified?: boolean;
  openToStudyPartner?: boolean;
  openToProjects?: boolean;
  openToAccountability?: boolean;
  openToCofounder?: boolean;
  openToHelpingOthers?: boolean;
}

export default function DiscoverInterestUsersScreen({ route, navigation }: any) {
  const { interest, emoji } = route.params;
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsersForInterest();
  }, [interest]);

  const loadUsersForInterest = async () => {
    try {
      const data = await searchService.searchUsers();
      const filtered = data.filter(
        (u: User) =>
          u.interests?.includes(interest) || u.skills?.includes(interest)
      );
      setUsers(filtered);
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = async (user: User) => {
    try {
      const conversation = await conversationService.createConversation(user.id);
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: {
          conversationId: conversation.id,
          otherUser: user,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to start conversation';
      Alert.alert('Error', message);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('CollaboratorProfile', { userId: item.id })}
      activeOpacity={0.7}
    >
      <Avatar name={item.name} email={item.email} size={50} />
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.schoolVerified && (
            <Text style={styles.verifiedBadge}>✓</Text>
          )}
        </View>
        {item.school && (
          <Text style={styles.userSchool}>🎓 {item.school}</Text>
        )}
        {item.bio && (
          <Text style={styles.userBio} numberOfLines={2}>
            {item.bio}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.messageButton}
        onPress={(e) => {
          e.stopPropagation();
          handleStartConversation(item);
        }}
      >
        <Text style={styles.messageButtonText}>💬</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>{emoji}</Text>
        <Text style={styles.headerTitle}>{interest}</Text>
        <Text style={styles.headerSubtitle}>
          {users.length} student{users.length !== 1 ? 's' : ''} interested
        </Text>
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No students found</Text>
          <Text style={styles.emptyText}>
            Be the first to add {interest} to your interests!
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f8fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#10b981',
  },
  userSchool: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  messageButton: {
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
