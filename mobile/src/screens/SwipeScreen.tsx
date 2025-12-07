import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import SwipeCard from '../components/SwipeCard';
import SameInterestCard from '../components/SameInterestCard';
import InterestSectionHeader from '../components/InterestSectionHeader';
import { swipeService } from '../services/swipeService';

// Gradient color presets for different interest types
const INTEREST_GRADIENTS = {
  book: ['#A06EFF', '#6C4DFF'] as const,
  game: ['#FF6B9D', '#C44569'] as const,
  skill: ['#00D9A5', '#00B388'] as const,
};

type DiscoveryMode = 'collaborate' | 'interests';

interface SameInterestGroup {
  value: string | null;
  users: User[];
}

interface SameInterestsResult {
  sameBook: SameInterestGroup | null;
  sameGame: SameInterestGroup | null;
  sameSkill: SameInterestGroup | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  school?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  skills?: string[];
  openToCofounder?: boolean;
  openToProjects?: boolean;
  openToHelpingOthers?: boolean;
  openToStudyPartner?: boolean;
  openToAccountability?: boolean;
  // New discovery fields
  currentBook?: string;
  currentGame?: string;
  currentSkill?: string;
  whatImBuilding?: string;
  lookingFor?: 'cofounder' | 'team' | 'freelance' | 'learn' | null;
}

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DURATION = 250;
const DAILY_SWIPE_LIMIT = 30;

export default function SwipeScreen({ navigation }: any) {
  // Mode toggle state
  const [mode, setMode] = useState<DiscoveryMode>('collaborate');

  // Collaborate mode state
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipesLeft, setSwipesLeft] = useState(DAILY_SWIPE_LIMIT);
  const [isLoading, setIsLoading] = useState(true);
  const [showInterestSent, setShowInterestSent] = useState(false);
  const [lastSwipedUser, setLastSwipedUser] = useState<User | null>(null);

  // Same Interests mode state
  const [sameInterests, setSameInterests] = useState<SameInterestsResult | null>(null);
  const [isLoadingInterests, setIsLoadingInterests] = useState(false);

  // Refs to hold current values for PanResponder
  const currentIndexRef = useRef(currentIndex);
  const usersRef = useRef(users);
  const swipesLeftRef = useRef(swipesLeft);

  // Keep refs in sync
  currentIndexRef.current = currentIndex;
  usersRef.current = users;
  swipesLeftRef.current = swipesLeft;

  const position = useRef(new Animated.ValueXY()).current;

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.92, 1],
    extrapolate: 'clamp',
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.6, 1],
    extrapolate: 'clamp',
  });

  useFocusEffect(
    useCallback(() => {
      if (mode === 'collaborate') {
        loadUsers();
        loadSwipeCount();
      } else {
        loadSameInterests();
      }
    }, [mode])
  );

  const loadSameInterests = async () => {
    try {
      setIsLoadingInterests(true);
      const data = await swipeService.getSameInterests();
      setSameInterests(data);
    } catch (error) {
      console.error('Failed to load same interests:', error);
    } finally {
      setIsLoadingInterests(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await swipeService.getSwipeableUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSwipeCount = async () => {
    try {
      const count = await swipeService.getSwipeCount();
      setSwipesLeft(DAILY_SWIPE_LIMIT - count);
    } catch (error) {
      console.error('Failed to load swipe count:', error);
    }
  };

  const forceSwipe = (direction: 'left' | 'right' | 'up') => {
    if (swipesLeftRef.current <= 0) {
      Alert.alert('No swipes left', 'Come back tomorrow for more swipes!');
      return;
    }

    const currentUser = usersRef.current[currentIndexRef.current];
    if (!currentUser) return;

    const x = direction === 'right' ? width * 1.5 : direction === 'left' ? -width * 1.5 : 0;
    const y = direction === 'up' ? -height : 0;

    Animated.timing(position, {
      toValue: { x, y },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      onSwipeComplete(direction, currentUser);
    });
  };

  const onSwipeComplete = (direction: 'left' | 'right' | 'up', swipedUser: User) => {
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
    setSwipesLeft((prev) => prev - 1);

    const swipeDirection = direction === 'up' ? 'superlike' : direction;

    swipeService.swipe(swipedUser.id, swipeDirection).then((result) => {
      // Show interest sent notification for right/superlike swipes
      if (result.status === 'pending' && (direction === 'right' || direction === 'up')) {
        setLastSwipedUser(swipedUser);
        setShowInterestSent(true);
        // Auto-hide after 2 seconds
        setTimeout(() => setShowInterestSent(false), 2000);
      }
    }).catch((error) => {
      console.error('Swipe error:', error);
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => {
          return Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
        },
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            forceSwipe('left');
          } else {
            resetPosition();
          }
        },
      }),
    []
  );

  const getUserLookingFor = (targetUser: User): 'cofounder' | 'team' | 'freelance' | 'learn' | null => {
    // Prefer the new lookingFor field if it exists
    if (targetUser.lookingFor) return targetUser.lookingFor;
    // Fallback to legacy boolean fields
    if (targetUser.openToCofounder) return 'cofounder';
    if (targetUser.openToProjects) return 'team';
    if (targetUser.openToHelpingOthers) return 'freelance';
    if (targetUser.openToStudyPartner || targetUser.openToAccountability) return 'learn';
    return null;
  };

  const handleUserPress = (user: User) => {
    navigation.navigate('CollaboratorProfile', { userId: user.id });
  };

  // Premium Interest Section with horizontal FlatList
  const renderPremiumInterestSection = (
    type: 'book' | 'game' | 'skill',
    title: string,
    emoji: string,
    value: string,
    users: User[]
  ) => {
    if (!users || users.length === 0) return null;

    const gradientColors = INTEREST_GRADIENTS[type];
    const matchPrefix = type === 'book' ? 'Also reading' : type === 'game' ? 'Also playing' : 'Also learning';

    return (
      <View style={styles.premiumSection}>
        {/* Gradient Header Card */}
        <InterestSectionHeader
          emoji={emoji}
          title={title}
          value={value}
          count={users.length}
          gradientColors={gradientColors}
        />

        {/* Horizontal User Cards */}
        <FlatList
          horizontal
          data={users}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.premiumCardsContainer}
          renderItem={({ item }) => (
            <SameInterestCard
              name={item.name}
              email={item.email}
              location={item.location}
              matchLabel={`${matchPrefix} ${value}`}
              gradientColors={gradientColors}
              onPress={() => handleUserPress(item)}
            />
          )}
        />
      </View>
    );
  };

  const renderSameInterestsMode = () => {
    if (isLoadingInterests) {
      return (
        <View style={styles.premiumLoadingContainer}>
          <LinearGradient
            colors={['#A06EFF', '#6C4DFF']}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color="#fff" />
          </LinearGradient>
          <Text style={styles.premiumLoadingText}>Finding your people...</Text>
          <Text style={styles.premiumLoadingSubtext}>
            Matching interests, books & games
          </Text>
        </View>
      );
    }

    const hasAnyInterests =
      sameInterests?.sameBook?.users?.length ||
      sameInterests?.sameGame?.users?.length ||
      sameInterests?.sameSkill?.users?.length;

    if (!hasAnyInterests) {
      return (
        <View style={styles.premiumEmptyContainer}>
          {/* Empty state with gradient icon background */}
          <LinearGradient
            colors={['#A06EFF', '#6C4DFF']}
            style={styles.emptyIconGradient}
          >
            <Ionicons name="sparkles" size={48} color="#fff" />
          </LinearGradient>
          <Text style={styles.premiumEmptyTitle}>No matches yet</Text>
          <Text style={styles.premiumEmptyText}>
            Share what you're reading, playing, or learning to discover like-minded people
          </Text>
          <TouchableOpacity
            style={styles.premiumEditButton}
            onPress={() => navigation.navigate('Profile', { screen: 'EditProfile' })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#A06EFF', '#6C4DFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumEditButtonGradient}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
              <Text style={styles.premiumEditButtonText}>Complete Your Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.premiumScrollView}
        contentContainerStyle={styles.premiumScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header intro text */}
        <View style={styles.premiumIntroContainer}>
          <Text style={styles.premiumIntroTitle}>Your Tribe</Text>
          <Text style={styles.premiumIntroSubtitle}>
            People who share your current interests
          </Text>
        </View>

        {/* Interest Sections */}
        {sameInterests?.sameBook && renderPremiumInterestSection(
          'book',
          'READING THE SAME BOOK',
          '📚',
          sameInterests.sameBook.value || '',
          sameInterests.sameBook.users
        )}
        {sameInterests?.sameGame && renderPremiumInterestSection(
          'game',
          'PLAYING THE SAME GAME',
          '🎮',
          sameInterests.sameGame.value || '',
          sameInterests.sameGame.users
        )}
        {sameInterests?.sameSkill && renderPremiumInterestSection(
          'skill',
          'LEARNING THE SAME SKILL',
          '🎯',
          sameInterests.sameSkill.value || '',
          sameInterests.sameSkill.users
        )}

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderCards = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding people for you...</Text>
        </View>
      );
    }

    if (currentIndex >= users.length) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={80} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No more profiles</Text>
          <Text style={styles.emptyText}>
            Check back later for more people to connect with
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadUsers}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return users
      .map((item, index) => {
        if (index < currentIndex) return null;

        const isFirst = index === currentIndex;
        const cardStyle = isFirst
          ? {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            }
          : {
              transform: [{ scale: nextCardScale }],
              opacity: nextCardOpacity,
            };

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.cardContainer,
              cardStyle,
              { zIndex: users.length - index },
            ]}
            {...(isFirst ? panResponder.panHandlers : {})}
          >
            {/* COLLAB overlay */}
            {isFirst && (
              <Animated.View
                style={[styles.likeOverlay, { opacity: likeOpacity }]}
              >
                <Text style={styles.likeText}>COLLAB</Text>
              </Animated.View>
            )}

            {/* PASS overlay */}
            {isFirst && (
              <Animated.View
                style={[styles.nopeOverlay, { opacity: nopeOpacity }]}
              >
                <Text style={styles.nopeText}>PASS</Text>
              </Animated.View>
            )}

            <SwipeCard
              name={item.name}
              email={item.email}
              age={22}
              city={item.location}
              school={item.school}
              bio={item.whatImBuilding || item.bio}
              interests={[...(item.interests || []), ...(item.skills || [])]}
              lookingFor={getUserLookingFor(item)}
              isFirst={isFirst}
            />
          </Animated.View>
        );
      })
      .reverse();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#faf9f8', '#f5f3f0']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        {mode === 'collaborate' && (
          <View style={styles.swipeCounter}>
            <Ionicons name="flash" size={18} color="#8b5cf6" />
            <Text style={styles.swipeCountText}>{swipesLeft} left</Text>
          </View>
        )}
      </View>

      {/* Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, mode === 'collaborate' && styles.toggleButtonActive]}
          onPress={() => setMode('collaborate')}
        >
          <Ionicons
            name="people"
            size={18}
            color={mode === 'collaborate' ? '#fff' : '#6b7280'}
          />
          <Text style={[styles.toggleText, mode === 'collaborate' && styles.toggleTextActive]}>
            Collaborate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, mode === 'interests' && styles.toggleButtonActive]}
          onPress={() => setMode('interests')}
        >
          <Ionicons
            name="sparkles"
            size={18}
            color={mode === 'interests' ? '#fff' : '#6b7280'}
          />
          <Text style={[styles.toggleText, mode === 'interests' && styles.toggleTextActive]}>
            Same Interests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on mode */}
      {mode === 'collaborate' ? (
        <>
          {/* Cards */}
          <View style={styles.cardsContainer}>{renderCards()}</View>

          {/* Action Buttons */}
          {currentIndex < users.length && !isLoading && (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.nopeButton]}
                onPress={() => forceSwipe('left')}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={32} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.superLikeButton]}
                onPress={() => forceSwipe('up')}
                activeOpacity={0.8}
              >
                <Ionicons name="star" size={28} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.likeButton]}
                onPress={() => forceSwipe('right')}
                activeOpacity={0.8}
              >
                <Ionicons name="heart" size={32} color="#22c55e" />
              </TouchableOpacity>
            </View>
          )}

          {/* Interest Sent Toast */}
          {showInterestSent && lastSwipedUser && (
            <View style={styles.interestSentToast}>
              <View style={styles.toastContent}>
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <View style={styles.toastTextContainer}>
                  <Text style={styles.toastTitle}>Interest sent!</Text>
                  <Text style={styles.toastSubtitle}>
                    Waiting for {lastSwipedUser.name.split(' ')[0]} to respond...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </>
      ) : (
        renderSameInterestsMode()
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
  },
  swipeCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  swipeCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
  },
  likeOverlay: {
    position: 'absolute',
    top: 50,
    left: 30,
    zIndex: 10,
    transform: [{ rotate: '-20deg' }],
    borderWidth: 4,
    borderColor: '#22c55e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  likeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#22c55e',
  },
  nopeOverlay: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 10,
    transform: [{ rotate: '20deg' }],
    borderWidth: 4,
    borderColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  nopeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ef4444',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
    gap: 24,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  nopeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  superLikeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  likeButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyContainer: {
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
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  refreshText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  interestSentToast: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toastTextContainer: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
  },
  toastSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  // Toggle styles
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#fff',
  },
  // ============================================
  // PREMIUM SAME INTERESTS MODE STYLES
  // ============================================

  // Premium Scroll View
  premiumScrollView: {
    flex: 1,
  },
  premiumScrollContent: {
    paddingBottom: 32,
  },

  // Premium Intro Header
  premiumIntroContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  premiumIntroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },
  premiumIntroSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },

  // Premium Section
  premiumSection: {
    marginBottom: 32,
  },
  premiumCardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },

  // Premium Loading State
  premiumLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  premiumLoadingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  premiumLoadingSubtext: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
  },

  // Premium Empty State
  premiumEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  premiumEmptyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumEmptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  premiumEditButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumEditButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 10,
  },
  premiumEditButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
