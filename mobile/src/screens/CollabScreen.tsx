import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { searchService } from '../services/searchService';
import { conversationService } from '../services/conversationService';
import { useAuth } from '../context/AuthContext';
import FilterPill from '../components/FilterPill';
import UserCard from '../components/UserCard';
import ShimmerPlaceholder from '../components/ShimmerPlaceholder';

interface User {
  id: string;
  name: string;
  email: string;
  school?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  skills?: string[];
  status?: string;
  schoolVerified?: boolean;
  openToStudyPartner?: boolean;
  openToProjects?: boolean;
  openToAccountability?: boolean;
  openToCofounder?: boolean;
  openToHelpingOthers?: boolean;
  createdAt?: string;
  lastActiveAt?: string;
}

type FilterType = 'sameSchool' | 'nearby' | 'new' | 'verified';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7; // Match UserCard width
const CARD_SPACING = 16;

export default function CollabScreen({ navigation }: any) {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());
  const [fadeAnim] = useState(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await searchService.searchUsers();
      const filtered = data.filter((u: User) => u.id !== user?.id);
      setUsers(filtered);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilter = (filter: FilterType) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
  };

  const isNewStudent = (createdAt?: string): boolean => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff < 7;
  };

  const computeSharedInterests = (targetUser: User): number => {
    const myInterests = [...(user?.interests || []), ...(user?.skills || [])];
    const theirInterests = [...(targetUser.interests || []), ...(targetUser.skills || [])];
    return myInterests.filter((i) => theirInterests.includes(i)).length;
  };

  const getUserAge = (targetUser: User): number | undefined => {
    // Mock age - replace with actual age calculation if you have birthdate
    return 22;
  };

  const isUserOnline = (lastActiveAt?: string): boolean => {
    if (!lastActiveAt) return false;
    const lastActive = new Date(lastActiveAt);
    const now = new Date();
    const minutesDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60);
    return minutesDiff < 15; // Online if active in last 15 minutes
  };

  const getUserLookingFor = (targetUser: User): 'cofounder' | 'team' | 'freelance' | 'learn' | null => {
    if (targetUser.openToCofounder) return 'cofounder';
    if (targetUser.openToProjects) return 'team';
    if (targetUser.openToHelpingOthers) return 'freelance';
    if (targetUser.openToStudyPartner || targetUser.openToAccountability) return 'learn';
    return null;
  };

  // Section 1: People matching your interests (sorted by match count: 3 matches, then 2, then 1)
  const getPeopleMatchingInterests = (): User[] => {
    const myInterests = [...(user?.interests || []), ...(user?.skills || [])];

    if (myInterests.length === 0) return [];

    return users
      .map((u) => ({
        user: u,
        matchCount: computeSharedInterests(u),
      }))
      .filter(({ matchCount }) => matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount) // Sort by most matches first
      .map(({ user }) => user)
      .slice(0, 15);
  };

  // Section 2: People looking for the same thing (Co-founder, Team, etc.)
  const getPeopleLookingForSame = (): User[] => {
    // Determine what the current user is looking for
    const userLookingFor = getUserLookingFor(user as User);

    if (!userLookingFor) return [];

    return users
      .filter((u) => {
        const theirLookingFor = getUserLookingFor(u);
        return theirLookingFor === userLookingFor;
      })
      .slice(0, 15);
  };

  // Section 3: People near you (same location)
  const getPeopleNearYou = (): User[] => {
    if (!user?.location) return [];

    return users
      .filter((u) => u.location && u.location === user.location)
      .slice(0, 15);
  };

  // Get filtered users based on search and filters
  const getFilteredUsers = (): User[] => {
    let filtered = [...users];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.school?.toLowerCase().includes(query) ||
          u.interests?.some((i) => i.toLowerCase().includes(query)) ||
          u.skills?.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (activeFilters.has('sameSchool')) {
      filtered = filtered.filter((u) => u.school && u.school === user?.school);
    }

    if (activeFilters.has('nearby')) {
      filtered = filtered.filter((u) => u.location && u.location === user?.location);
    }

    if (activeFilters.has('new')) {
      filtered = filtered.filter((u) => isNewStudent(u.createdAt));
    }

    if (activeFilters.has('verified')) {
      filtered = filtered.filter((u) => u.schoolVerified);
    }

    return filtered;
  };

  const handleStartConversation = async (targetUser: User) => {
    try {
      const conversation = await conversationService.createConversation(targetUser.id);
      navigation.navigate('Messages', {
        screen: 'Chat',
        params: {
          conversationId: conversation.id,
          otherUser: targetUser,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to start conversation';
      Alert.alert('Error', message);
    }
  };

  const matchingInterestUsers = getPeopleMatchingInterests();
  const lookingForSameUsers = getPeopleLookingForSame();
  const nearbyUsers = getPeopleNearYou();
  const filteredUsers = getFilteredUsers();
  const isSearchOrFilterActive = searchQuery.trim() !== '' || activeFilters.size > 0;

  const renderShimmerLoading = () => (
    <View style={styles.shimmerContainer}>
      <ShimmerPlaceholder width="60%" height={28} style={{ marginBottom: 8 }} />
      <ShimmerPlaceholder width="40%" height={20} style={{ marginBottom: 32 }} />

      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.shimmerCard}>
          <ShimmerPlaceholder width={80} height={80} borderRadius={40} style={{ marginBottom: 16 }} />
          <ShimmerPlaceholder width="60%" height={20} style={{ marginBottom: 8 }} />
          <ShimmerPlaceholder width="50%" height={16} style={{ marginBottom: 8 }} />
          <ShimmerPlaceholder width="100%" height={14} />
        </View>
      ))}
    </View>
  );

  const renderSection = (title: string, users: User[]) => {
    if (users.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
        >
          {users.map((targetUser) => (
            <UserCard
              key={targetUser.id}
              id={targetUser.id}
              name={targetUser.name}
              email={targetUser.email}
              age={getUserAge(targetUser)}
              city={targetUser.location}
              school={targetUser.school}
              interests={[...(targetUser.interests || []), ...(targetUser.skills || [])]}
              lookingFor={getUserLookingFor(targetUser)}
              isOnline={isUserOnline(targetUser.lastActiveAt)}
              onPress={() => navigation.navigate('CollaboratorProfile', { userId: targetUser.id })}
              onConnect={() => handleStartConversation(targetUser)}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Meet students who match your goals</Text>
        </View>
        {renderShimmerLoading()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.stickyHeader}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Meet students who match your goals</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students, skills, interests..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color="#9ca3af"
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <FilterPill
            icon="school-outline"
            label="Same School"
            isActive={activeFilters.has('sameSchool')}
            onPress={() => toggleFilter('sameSchool')}
          />
          <FilterPill
            icon="location-outline"
            label="Nearby"
            isActive={activeFilters.has('nearby')}
            onPress={() => toggleFilter('nearby')}
          />
          <FilterPill
            icon="sparkles-outline"
            label="New"
            isActive={activeFilters.has('new')}
            onPress={() => toggleFilter('new')}
          />
          <FilterPill
            icon="shield-checkmark-outline"
            label="Verified"
            isActive={activeFilters.has('verified')}
            onPress={() => toggleFilter('verified')}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {!isSearchOrFilterActive ? (
            <>
              {/* Section 1: People matching your interests */}
              {renderSection('People matching your interests', matchingInterestUsers)}

              {/* Section 2: People looking for the same thing */}
              {renderSection(
                getUserLookingFor(user as User) === 'cofounder'
                  ? 'People also looking for Co-founder'
                  : getUserLookingFor(user as User) === 'team'
                  ? 'People also looking for Team'
                  : getUserLookingFor(user as User) === 'freelance'
                  ? 'People also looking for Freelance work'
                  : 'People also looking to Learn',
                lookingForSameUsers
              )}

              {/* Section 3: People near you */}
              {renderSection('People near you', nearbyUsers)}

              {/* Empty state if no sections have data */}
              {matchingInterestUsers.length === 0 &&
                lookingForSameUsers.length === 0 &&
                nearbyUsers.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="sparkles" size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyTitle}>Complete your profile</Text>
                    <Text style={styles.emptyText}>
                      Add your interests, location, and what you're looking for to see personalized
                      recommendations
                    </Text>
                  </View>
                )}
            </>
          ) : (
            // Search/Filter Results
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>
                {filteredUsers.length} Result{filteredUsers.length !== 1 ? 's' : ''}
              </Text>
              {filteredUsers.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search" size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyTitle}>No matches found</Text>
                  <Text style={styles.emptyText}>Try adjusting your filters or search query</Text>
                </View>
              ) : (
                <View style={styles.resultsGrid}>
                  {filteredUsers.map((targetUser) => (
                    <UserCard
                      key={targetUser.id}
                      id={targetUser.id}
                      name={targetUser.name}
                      email={targetUser.email}
                      age={getUserAge(targetUser)}
                      city={targetUser.location}
                      school={targetUser.school}
                      interests={[...(targetUser.interests || []), ...(targetUser.skills || [])]}
                      lookingFor={getUserLookingFor(targetUser)}
                      isOnline={isUserOnline(targetUser.lastActiveAt)}
                      onPress={() => navigation.navigate('CollaboratorProfile', { userId: targetUser.id })}
                      onConnect={() => handleStartConversation(targetUser)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f8',
  },
  stickyHeader: {
    backgroundColor: '#faf9f8',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ebe6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: 0.1,
  },
  carouselContent: {
    paddingHorizontal: 20,
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 24,
  },
  resultsGrid: {
    gap: 16,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  shimmerContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  shimmerCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
});
