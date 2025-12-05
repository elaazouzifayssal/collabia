import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';

interface StudentCardProps {
  id: string;
  name: string;
  email: string;
  school?: string;
  interests?: string[];
  isNew?: boolean;
  isRecentlyActive?: boolean;
  openToStudyPartner?: boolean;
  openToProjects?: boolean;
  openToAccountability?: boolean;
  openToCofounder?: boolean;
  openToHelpingOthers?: boolean;
  sharedInterestCount?: number;
  onPress: () => void;
  onMessage: () => void;
}

export default function StudentCard({
  name,
  email,
  school,
  interests = [],
  isNew,
  isRecentlyActive,
  openToStudyPartner,
  openToProjects,
  openToAccountability,
  openToCofounder,
  openToHelpingOthers,
  sharedInterestCount,
  onPress,
  onMessage,
}: StudentCardProps) {
  const topInterests = interests.slice(0, 3);

  const openToList = [];
  if (openToProjects) openToList.push('Projects');
  if (openToStudyPartner) openToList.push('Study Partner');
  if (openToAccountability) openToList.push('Accountability');
  if (openToCofounder) openToList.push('Co-founder');
  if (openToHelpingOthers) openToList.push('Helping Others');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar name={name} email={email} size={56} />
          {isRecentlyActive && <View style={styles.activeDot} />}
        </View>

        {isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        {school && (
          <View style={styles.schoolRow}>
            <Text style={styles.schoolIcon}>🎓</Text>
            <Text style={styles.schoolText} numberOfLines={1}>
              {school}
            </Text>
          </View>
        )}

        {sharedInterestCount !== undefined && sharedInterestCount > 0 && (
          <Text style={styles.sharedInterests}>
            Shares {sharedInterestCount} interest{sharedInterestCount > 1 ? 's' : ''} with you
          </Text>
        )}

        {topInterests.length > 0 && (
          <View style={styles.interestsRow}>
            {topInterests.map((interest, index) => (
              <View key={index} style={styles.interestChip}>
                <Text style={styles.interestChipText} numberOfLines={1}>
                  {interest}
                </Text>
              </View>
            ))}
          </View>
        )}

        {openToList.length > 0 && (
          <Text style={styles.openTo} numberOfLines={1}>
            Open to: {openToList.join(', ')}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.messageButton}
        onPress={(e) => {
          e.stopPropagation();
          onMessage();
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-outline" size={16} color="#6366f1" />
        <Text style={styles.messageButtonText}>Message</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  newBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f59e0b',
  },
  content: {
    marginBottom: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  schoolIcon: {
    fontSize: 14,
  },
  schoolText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  sharedInterests: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 8,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  interestChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    maxWidth: 120,
  },
  interestChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  openTo: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 10,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
});
