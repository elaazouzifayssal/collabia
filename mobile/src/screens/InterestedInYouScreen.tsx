import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { swipeService } from '../services/swipeService';
import { conversationService } from '../services/conversationService';
import { useNotifications } from '../context/NotificationContext';

interface User {
  id: string;
  name: string;
  email: string;
  location?: string;
  school?: string;
  bio?: string;
  interests?: string[];
  skills?: string[];
  openToCofounder?: boolean;
  openToProjects?: boolean;
  openToStudyPartner?: boolean;
  openToAccountability?: boolean;
  openToHelpingOthers?: boolean;
}

interface ReceivedInterest {
  interestId: string;
  isSuperLike: boolean;
  createdAt: string;
  user: User;
}

interface NewMatch {
  interestId: string;
  matchedAt: string;
  user: User;
}

export default function InterestedInYouScreen({ navigation }: any) {
  const { refreshNewMatchesCount } = useNotifications();
  const [interests, setInterests] = useState<ReceivedInterest[]>([]);
  const [newMatches, setNewMatches] = useState<NewMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [interestsData, matchesData] = await Promise.all([
        swipeService.getReceivedInterests(),
        swipeService.getNewMatches(),
      ]);
      setInterests(interestsData);
      setNewMatches(matchesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInterests = async () => {
    try {
      setIsLoading(true);
      const data = await swipeService.getReceivedInterests();
      setInterests(data);
    } catch (error) {
      console.error('Failed to load interests:', error);
      Alert.alert('Error', 'Failed to load interests');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMatchPress = async (match: NewMatch) => {
    try {
      // Mark match as seen
      await swipeService.markMatchSeen(match.interestId);
      // Remove from list
      setNewMatches((prev) => prev.filter((m) => m.interestId !== match.interestId));
      // Refresh count
      refreshNewMatchesCount();
      // Get or create conversation with this user
      const conversation = await conversationService.createConversation(match.user.id);
      // Navigate to chat with conversation ID
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: {
          conversationId: conversation.id,
          otherUser: match.user,
        },
      });
    } catch (error) {
      console.error('Failed to handle match:', error);
      Alert.alert('Error', 'Failed to open chat');
    }
  };

  const handleRespond = async (interestId: string, action: 'accept' | 'decline') => {
    try {
      setRespondingTo(interestId);
      const result = await swipeService.respondToInterest(interestId, action);

      if (action === 'accept' && result.conversation) {
        // Navigate to chat
        navigation.navigate('Messages', {
          screen: 'Chat',
          params: {
            conversationId: result.conversation.id,
            otherUser: result.otherUser,
          },
        });
      }

      // Remove from list
      setInterests((prev) => prev.filter((i) => i.interestId !== interestId));
    } catch (error) {
      console.error('Failed to respond:', error);
      Alert.alert('Error', 'Failed to respond to interest');
    } finally {
      setRespondingTo(null);
    }
  };

  const getUserLookingFor = (user: User): string | null => {
    if (user.openToCofounder) return 'Co-founder';
    if (user.openToProjects) return 'Project Partner';
    if (user.openToHelpingOthers) return 'Mentor/Helper';
    if (user.openToStudyPartner) return 'Study Partner';
    if (user.openToAccountability) return 'Accountability Partner';
    return null;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderInterestCard = ({ item }: { item: ReceivedInterest }) => {
    const { user, isSuperLike, interestId, createdAt } = item;
    const isResponding = respondingTo === interestId;
    const lookingFor = getUserLookingFor(user);
    const allTags = [...(user.interests || []), ...(user.skills || [])].slice(0, 4);

    return (
      <View style={styles.card}>
        {isSuperLike && (
          <View style={styles.superLikeBadge}>
            <Ionicons name="star" size={14} color="#fff" />
            <Text style={styles.superLikeText}>Super Like</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.school && (
              <View style={styles.schoolRow}>
                <Ionicons name="school-outline" size={14} color="#6b7280" />
                <Text style={styles.schoolText}>{user.school}</Text>
              </View>
            )}
            {user.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.locationText}>{user.location}</Text>
              </View>
            )}
          </View>
          <Text style={styles.timeAgo}>{formatTimeAgo(createdAt)}</Text>
        </View>

        {user.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {user.bio}
          </Text>
        )}

        {lookingFor && (
          <View style={styles.lookingForContainer}>
            <Text style={styles.lookingForLabel}>Looking for:</Text>
            <View style={styles.lookingForBadge}>
              <Text style={styles.lookingForText}>{lookingFor}</Text>
            </View>
          </View>
        )}

        {allTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {allTags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleRespond(interestId, 'decline')}
            disabled={isResponding}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <Ionicons name="close" size={20} color="#ef4444" />
                <Text style={styles.declineText}>Not now</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleRespond(interestId, 'accept')}
            disabled={isResponding}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.acceptText}>I'm interested too</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={['#faf9f8', '#f5f3f0']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <Text style={styles.title}>Interested in You</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#faf9f8', '#f5f3f0']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Interested in You</Text>
        {interests.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{interests.length}</Text>
          </View>
        )}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={interests.length === 0 && newMatches.length === 0 ? styles.emptyScrollContent : undefined}
      >
        {/* New Matches Section */}
        {newMatches.length > 0 && (
          <View style={styles.newMatchesSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={20} color="#22c55e" />
              <Text style={styles.sectionTitle}>New Matches!</Text>
              <View style={styles.newMatchesBadge}>
                <Text style={styles.newMatchesBadgeText}>{newMatches.length}</Text>
              </View>
            </View>
            <Text style={styles.sectionSubtitle}>
              These people accepted your interest - start chatting!
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchesScrollContent}
            >
              {newMatches.map((match) => (
                <TouchableOpacity
                  key={match.interestId}
                  style={styles.matchCard}
                  onPress={() => handleMatchPress(match)}
                >
                  <View style={styles.matchAvatar}>
                    <Text style={styles.matchAvatarText}>
                      {match.user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.matchName} numberOfLines={1}>
                    {match.user.name}
                  </Text>
                  {match.user.school && (
                    <Text style={styles.matchSchool} numberOfLines={1}>
                      {match.user.school}
                    </Text>
                  )}
                  <View style={styles.startChatButton}>
                    <Ionicons name="chatbubble" size={14} color="#fff" />
                    <Text style={styles.startChatText}>Chat</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Received Interests Section */}
        {interests.length === 0 && newMatches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No interests yet</Text>
            <Text style={styles.emptyText}>
              When someone swipes right on you, they'll appear here
            </Text>
          </View>
        ) : interests.length > 0 ? (
          <View style={styles.interestsSection}>
            {newMatches.length > 0 && (
              <View style={styles.sectionHeader}>
                <Ionicons name="heart" size={20} color="#8b5cf6" />
                <Text style={styles.sectionTitle}>Interested in You</Text>
              </View>
            )}
            <View style={styles.listContent}>
              {interests.map((item) => (
                <View key={item.interestId}>
                  {renderInterestCard({ item })}
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  countBadge: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  superLikeBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  superLikeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  schoolText: {
    fontSize: 13,
    color: '#6b7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#6b7280',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  bio: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 12,
    lineHeight: 20,
  },
  lookingForContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  lookingForLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  lookingForBadge: {
    backgroundColor: '#f3e8ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lookingForText: {
    fontSize: 13,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4b5563',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  declineButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  acceptButton: {
    backgroundColor: '#22c55e',
  },
  declineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // New Matches Section Styles
  emptyScrollContent: {
    flex: 1,
  },
  newMatchesSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  newMatchesBadge: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newMatchesBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  matchesScrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  matchAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  matchAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  matchName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  matchSchool: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  startChatButton: {
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  startChatText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  interestsSection: {
    paddingHorizontal: 16,
  },
});
