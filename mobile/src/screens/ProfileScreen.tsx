import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import {
  CurrentBookCard,
  CurrentSkillCard,
  CurrentGameCard,
  BookHistoryList,
  SkillHistoryList,
  GameHistoryList,
} from '../components/interests';
import {
  interestService,
  CurrentInterests,
  InterestHistory,
} from '../services/interestService';
import UserInterestPosts from '../components/UserInterestPosts';
import { InterestPost } from '../services/interestPostService';

const INTEREST_GRADIENTS = {
  book: ['#A06EFF', '#6C4DFF'] as const,
  game: ['#FF6B9D', '#C44569'] as const,
  skill: ['#00D9A5', '#00B388'] as const,
};

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [currentInterests, setCurrentInterests] = useState<CurrentInterests | null>(null);
  const [history, setHistory] = useState<InterestHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInterests = useCallback(async () => {
    try {
      const [interestsData, historyData] = await Promise.all([
        interestService.getCurrentInterests(),
        interestService.getHistory(10),
      ]);
      setCurrentInterests(interestsData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInterests();
  }, [fetchInterests]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleEditInterests = () => {
    navigation.navigate('EditInterests');
  };

  const handleBookPress = (book: {
    title: string;
    pagesRead?: number;
    totalPages?: number | null;
    status?: 'reading' | 'paused' | 'completed';
    isHistory?: boolean;
    rating?: number | null;
  }) => {
    navigation.navigate('BookDetail', { book });
  };

  const handleInterestPostPress = (post: InterestPost) => {
    navigation.navigate('Collaborate', {
      screen: 'InterestPostThread',
      params: { postId: post.id },
    });
  };

  const handleViewAllPosts = (type: 'book' | 'skill' | 'game', value: string) => {
    navigation.navigate('Collaborate', {
      screen: 'InterestPosts',
      params: { type, value },
    });
  };

  const handleCreateInterestPost = (type: 'book' | 'skill' | 'game', value: string, progress?: number) => {
    navigation.navigate('Collaborate', {
      screen: 'CreateInterestPost',
      params: { type, value, currentProgress: progress },
    });
  };

  const settingsItems = [
    {
      icon: 'checkmark-circle-outline',
      label: 'Collaboration Preferences',
      onPress: () => navigation.navigate('CollaborationPreferences'),
    },
    {
      icon: 'star-outline',
      label: 'Skills & Interests',
      onPress: () => navigation.navigate('SkillsInterests'),
    },
    {
      icon: 'school-outline',
      label: 'School Verification',
      onPress: () => navigation.navigate('SchoolVerification'),
      badge: user?.schoolVerified ? '✓' : undefined,
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Status',
      onPress: () => navigation.navigate('StatusSettings'),
      subtitle: user?.status || 'Not set',
    },
  ];

  const preferencesItems = [
    {
      icon: 'globe-outline',
      label: 'Language',
      onPress: () => Alert.alert('Coming Soon', 'Language settings will be available soon'),
      subtitle: 'English',
    },
    {
      icon: 'location-outline',
      label: 'Location',
      onPress: () => {},
      subtitle: user?.location || 'Not set',
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
    },
  ];

  const otherItems = [
    {
      icon: 'trash-outline',
      label: 'Clear Cache',
      onPress: () => Alert.alert('Clear Cache', 'This will clear temporary app data'),
    },
    {
      icon: 'time-outline',
      label: 'Clear History',
      onPress: () => Alert.alert('Clear History', 'This will clear your browsing history'),
    },
  ];

  const renderSettingItem = (
    item: {
      icon: any;
      label: string;
      onPress: () => void;
      subtitle?: string;
      badge?: string;
    },
    isLast: boolean = false
  ) => (
    <TouchableOpacity
      key={item.label}
      style={[styles.settingItem, isLast && styles.settingItemLast]}
      onPress={item.onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={item.icon} size={22} color="#6b7280" style={styles.settingIcon} />
        <View>
          <Text style={styles.settingLabel}>{item.label}</Text>
          {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {item.badge && <Text style={styles.settingBadge}>{item.badge}</Text>}
        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );

  const hasStructuredInterests =
    currentInterests?.currentBook ||
    currentInterests?.currentSkill ||
    currentInterests?.currentGame;

  const hasLegacyInterests =
    !hasStructuredInterests &&
    (user?.currentBook || user?.currentGame || user?.currentSkill || user?.whatImBuilding);

  const hasHistory =
    history &&
    (history.bookHistory.length > 0 ||
      history.skillHistory.length > 0 ||
      history.gameHistory.length > 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <Avatar name={user?.name || ''} email={user?.email} size={80} />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Current Interests Section - Structured */}
      {hasStructuredInterests && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>NOW</Text>
            <TouchableOpacity onPress={handleEditInterests}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.interestsContainer}>
            {currentInterests?.currentBook && (
              <CurrentBookCard
                book={currentInterests.currentBook}
                onEdit={handleEditInterests}
                onPress={() => handleBookPress({
                  title: currentInterests.currentBook!.title,
                  pagesRead: currentInterests.currentBook!.pagesRead,
                  totalPages: currentInterests.currentBook!.totalPages,
                  status: currentInterests.currentBook!.status,
                })}
              />
            )}
            {currentInterests?.currentSkill && (
              <CurrentSkillCard
                skill={currentInterests.currentSkill}
                onEdit={handleEditInterests}
              />
            )}
            {currentInterests?.currentGame && (
              <CurrentGameCard
                game={currentInterests.currentGame}
                onEdit={handleEditInterests}
              />
            )}
          </View>
        </View>
      )}

      {/* My Interest Posts Section */}
      {hasStructuredInterests && user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MY POSTS</Text>
          <View style={styles.postsContainer}>
            {currentInterests?.currentBook && (
              <View style={styles.postsSectionCard}>
                <View style={styles.postsSectionHeader}>
                  <Text style={styles.postsSectionEmoji}>📚</Text>
                  <Text style={styles.postsSectionTitle} numberOfLines={1}>
                    {currentInterests.currentBook.title}
                  </Text>
                </View>
                <UserInterestPosts
                  userId={user.id}
                  type="book"
                  interestValue={currentInterests.currentBook.title}
                  gradientColors={INTEREST_GRADIENTS.book}
                  onPostPress={handleInterestPostPress}
                  onViewAll={() => handleViewAllPosts('book', currentInterests.currentBook!.title)}
                  onCreatePost={() => handleCreateInterestPost('book', currentInterests.currentBook!.title, currentInterests.currentBook!.pagesRead)}
                />
              </View>
            )}
            {currentInterests?.currentSkill && (
              <View style={styles.postsSectionCard}>
                <View style={styles.postsSectionHeader}>
                  <Text style={styles.postsSectionEmoji}>🎯</Text>
                  <Text style={styles.postsSectionTitle} numberOfLines={1}>
                    {currentInterests.currentSkill.name}
                  </Text>
                </View>
                <UserInterestPosts
                  userId={user.id}
                  type="skill"
                  interestValue={currentInterests.currentSkill.name}
                  gradientColors={INTEREST_GRADIENTS.skill}
                  onPostPress={handleInterestPostPress}
                  onViewAll={() => handleViewAllPosts('skill', currentInterests.currentSkill!.name)}
                  onCreatePost={() => handleCreateInterestPost('skill', currentInterests.currentSkill!.name)}
                />
              </View>
            )}
            {currentInterests?.currentGame && (
              <View style={styles.postsSectionCard}>
                <View style={styles.postsSectionHeader}>
                  <Text style={styles.postsSectionEmoji}>🎮</Text>
                  <Text style={styles.postsSectionTitle} numberOfLines={1}>
                    {currentInterests.currentGame.name}
                  </Text>
                </View>
                <UserInterestPosts
                  userId={user.id}
                  type="game"
                  interestValue={currentInterests.currentGame.name}
                  gradientColors={INTEREST_GRADIENTS.game}
                  onPostPress={handleInterestPostPress}
                  onViewAll={() => handleViewAllPosts('game', currentInterests.currentGame!.name)}
                  onCreatePost={() => handleCreateInterestPost('game', currentInterests.currentGame!.name)}
                />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Legacy Now Section - Fallback for non-structured data */}
      {hasLegacyInterests && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>NOW</Text>
            <TouchableOpacity onPress={handleEditInterests}>
              <Text style={styles.editLink}>Upgrade</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.nowCard}>
            {user?.currentBook && (
              <View style={styles.nowItem}>
                <View style={styles.nowIconContainer}>
                  <Text style={styles.nowEmoji}>📚</Text>
                </View>
                <View style={styles.nowContent}>
                  <Text style={styles.nowLabel}>Reading</Text>
                  <Text style={styles.nowValue}>{user.currentBook}</Text>
                </View>
              </View>
            )}
            {user?.currentGame && (
              <View style={styles.nowItem}>
                <View style={styles.nowIconContainer}>
                  <Text style={styles.nowEmoji}>🎮</Text>
                </View>
                <View style={styles.nowContent}>
                  <Text style={styles.nowLabel}>Playing</Text>
                  <Text style={styles.nowValue}>{user.currentGame}</Text>
                </View>
              </View>
            )}
            {user?.currentSkill && (
              <View style={styles.nowItem}>
                <View style={styles.nowIconContainer}>
                  <Text style={styles.nowEmoji}>🎯</Text>
                </View>
                <View style={styles.nowContent}>
                  <Text style={styles.nowLabel}>Learning</Text>
                  <Text style={styles.nowValue}>{user.currentSkill}</Text>
                </View>
              </View>
            )}
            {user?.whatImBuilding && (
              <View style={[styles.nowItem, styles.nowItemLast]}>
                <View style={styles.nowIconContainer}>
                  <Text style={styles.nowEmoji}>🚀</Text>
                </View>
                <View style={styles.nowContent}>
                  <Text style={styles.nowLabel}>Building</Text>
                  <Text style={styles.nowValue}>{user.whatImBuilding}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* No Interests - Add prompt */}
      {!hasStructuredInterests && !hasLegacyInterests && !loading && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOW</Text>
          <TouchableOpacity style={styles.emptyInterestsCard} onPress={handleEditInterests}>
            <Ionicons name="add-circle-outline" size={32} color="#6366f1" />
            <Text style={styles.emptyInterestsText}>Add what you're currently into</Text>
            <Text style={styles.emptyInterestsSubtext}>
              Share what you're reading, learning, or playing
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* History Section */}
      {hasHistory && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HISTORY</Text>
          <View style={styles.historyContainer}>
            {history.bookHistory.length > 0 && (
              <BookHistoryList
                books={history.bookHistory}
                onBookPress={(book) => handleBookPress({
                  title: book.title,
                  pagesRead: book.pagesRead || undefined,
                  totalPages: book.totalPages,
                  status: book.status,
                  isHistory: true,
                  rating: book.rating,
                })}
              />
            )}
            {history.skillHistory.length > 0 && (
              <SkillHistoryList skills={history.skillHistory} />
            )}
            {history.gameHistory.length > 0 && (
              <GameHistoryList games={history.gameHistory} />
            )}
          </View>
        </View>
      )}

      {/* What I'm Building - if exists */}
      {user?.whatImBuilding && hasStructuredInterests && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BUILDING</Text>
          <View style={styles.buildingCard}>
            <Text style={styles.buildingEmoji}>🚀</Text>
            <View style={styles.buildingContent}>
              <Text style={styles.buildingLabel}>Current Project</Text>
              <Text style={styles.buildingValue}>{user.whatImBuilding}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Settings Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROFILE</Text>
        <View style={styles.settingsCard}>
          {settingsItems.map((item, index) =>
            renderSettingItem(item, index === settingsItems.length - 1)
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.settingsCard}>
          {preferencesItems.map((item, index) =>
            renderSettingItem(item, index === preferencesItems.length - 1)
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OTHER</Text>
        <View style={styles.settingsCard}>
          {otherItems.map((item, index) =>
            renderSettingItem(item, index === otherItems.length - 1)
          )}
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="log-out-outline"
                size={22}
                color="#ef4444"
                style={styles.settingIcon}
              />
              <Text style={styles.logoutLabel}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Version */}
      <Text style={styles.appVersion}>App version 1.0.0</Text>

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
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#f7f8fa',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginLeft: 20,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  editLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  interestsContainer: {
    marginHorizontal: 20,
    gap: 16,
  },
  historyContainer: {
    marginHorizontal: 20,
    gap: 12,
  },
  settingsCard: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingBadge: {
    fontSize: 18,
    color: '#10b981',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  logoutLabel: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  appVersion: {
    textAlign: 'center',
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 16,
  },
  // Now section styles
  nowCard: {
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
  nowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  nowItemLast: {
    borderBottomWidth: 0,
  },
  nowIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  nowEmoji: {
    fontSize: 22,
  },
  nowContent: {
    flex: 1,
  },
  nowLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  nowValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  // Empty interests
  emptyInterestsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
  },
  emptyInterestsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  emptyInterestsSubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  // Building card
  buildingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  buildingEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  buildingContent: {
    flex: 1,
  },
  buildingLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  buildingValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  // Posts section styles
  postsContainer: {
    marginHorizontal: 20,
    gap: 16,
  },
  postsSectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  postsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postsSectionEmoji: {
    fontSize: 20,
  },
  postsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
});
