import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';

interface SwipeCardProps {
  name: string;
  email: string;
  age?: number;
  city?: string;
  school?: string;
  bio?: string;
  interests?: string[];
  lookingFor?: 'cofounder' | 'team' | 'freelance' | 'learn' | null;
  avatar?: string;
  isFirst?: boolean;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = height * 0.58;

const INTEREST_EMOJIS: Record<string, string> = {
  'AI': '🤖',
  'Machine Learning': '🧠',
  'Web Development': '💻',
  'Mobile Apps': '📱',
  'Design': '🎨',
  'UI/UX': '✨',
  'Data Science': '📊',
  'Blockchain': '⛓️',
  'Cybersecurity': '🔒',
  'Cloud Computing': '☁️',
  'DevOps': '⚙️',
  'Entrepreneurship': '🚀',
  'Startups': '💡',
  'Marketing': '📣',
  'Business': '💼',
  'Finance': '💰',
  'React': '⚛️',
  'Python': '🐍',
  'JavaScript': '💛',
  'Java': '☕',
  'Web3': '🌐',
  'Mobile Dev': '📱',
  'Art': '🎨',
  'SAAS': '☁️',
};

const getLookingForConfig = (lookingFor: string | null | undefined) => {
  switch (lookingFor) {
    case 'cofounder':
      return { label: 'Looking for Co-founder', emoji: '🚀', color: '#f59e0b' };
    case 'team':
      return { label: 'Looking for Team', emoji: '👥', color: '#8b5cf6' };
    case 'freelance':
      return { label: 'Looking for Internship', emoji: '💼', color: '#06b6d4' };
    case 'learn':
      return { label: 'Looking to Learn', emoji: '📚', color: '#10b981' };
    default:
      return null;
  }
};

export default function SwipeCard({
  name,
  email,
  age,
  city,
  bio,
  interests = [],
  lookingFor,
  isFirst = false,
}: SwipeCardProps) {
  const lookingForConfig = getLookingForConfig(lookingFor);
  const displayInterests = interests.slice(0, 3);
  const firstName = name.split(' ')[0];

  return (
    <View style={[styles.card, isFirst && styles.firstCard]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      />

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <LinearGradient
            colors={['#8b5cf6', '#6366f1', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <View style={styles.avatarInner}>
              <Avatar name={name} email={email} size={104} />
            </View>
          </LinearGradient>
        </View>

        {/* Name + Age */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>
            {firstName}
            {age && <Text style={styles.age}>, {age}</Text>}
          </Text>
        </View>

        {/* Location */}
        {city && (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.infoText}>{city}</Text>
            </View>
          </View>
        )}

        {/* What I'm Building Section */}
        {bio && (
          <View style={styles.buildingSection}>
            <View style={styles.buildingHeader}>
              <Ionicons name="rocket" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.buildingLabel}>What I'm building</Text>
            </View>
            <Text style={styles.buildingText} numberOfLines={3}>
              {bio}
            </Text>
          </View>
        )}

        {/* Looking For Badge */}
        {lookingForConfig && (
          <View style={[styles.lookingForBadge, { backgroundColor: lookingForConfig.color }]}>
            <Text style={styles.lookingForEmoji}>{lookingForConfig.emoji}</Text>
            <Text style={styles.lookingForText}>{lookingForConfig.label}</Text>
          </View>
        )}

        {/* Interest Tags */}
        {displayInterests.length > 0 && (
          <View style={styles.tagsContainer}>
            {displayInterests.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagEmoji}>
                  {INTEREST_EMOJIS[interest] || '💡'}
                </Text>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  firstCard: {
    shadowOpacity: 0.4,
    shadowRadius: 25,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  nameContainer: {
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  age: {
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  buildingSection: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    width: '100%',
  },
  buildingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  buildingLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buildingText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  lookingForBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  lookingForEmoji: {
    fontSize: 18,
  },
  lookingForText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tagEmoji: {
    fontSize: 14,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
