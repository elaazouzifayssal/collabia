import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { postService } from '../services/postService';
import { conversationService } from '../services/conversationService';

interface User {
  id: string;
  name: string;
  email: string;
  school?: string;
  bio?: string;
  interests?: string[];
  skills?: string[];
}

export default function InterestedUsersScreen({ route, navigation }: any) {
  const { postId, postTitle } = route.params;
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInterestedUsers();
  }, []);

  const loadInterestedUsers = async () => {
    try {
      const data = await postService.getInterestedUsers(postId);
      setUsers(data);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to load interested users';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = async (user: User) => {
    try {
      const conversation = await conversationService.createConversation(user.id);

      // Navigate to the chat screen
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: {
          conversationId: conversation.id,
          otherUser: user,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create conversation';
      Alert.alert('Error', message);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.school && <Text style={styles.userSchool}>{item.school}</Text>}
          {item.bio && (
            <Text style={styles.userBio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
        </View>
      </View>

      {/* Interests */}
      {item.interests && item.interests.length > 0 && (
        <View style={styles.tags}>
          {item.interests.slice(0, 3).map((interest, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
          {item.interests.length > 3 && (
            <Text style={styles.moreText}>+{item.interests.length - 3} more</Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => handleStartConversation(item)}
      >
        <Text style={styles.messageButtonText}>Start Conversation</Text>
      </TouchableOpacity>
    </View>
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
        <Text style={styles.headerTitle}>Interested Users</Text>
        <Text style={styles.headerSubtitle} numberOfLines={1}>
          {postTitle}
        </Text>
      </View>

      {users.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No one interested yet</Text>
          <Text style={styles.emptyText}>
            Share your post to get more visibility!
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
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userSchool: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
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
  moreText: {
    fontSize: 12,
    color: '#9ca3af',
    alignSelf: 'center',
  },
  messageButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
