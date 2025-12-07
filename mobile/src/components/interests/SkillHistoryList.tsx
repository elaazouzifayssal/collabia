import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LevelBadge from '../ui/LevelBadge';
import { SkillHistoryItem } from '../../services/interestService';

interface SkillHistoryListProps {
  skills: SkillHistoryItem[];
  initiallyExpanded?: boolean;
  onSkillPress?: (skill: SkillHistoryItem) => void;
}

function SkillHistoryCard({
  skill,
  onPress,
}: {
  skill: SkillHistoryItem;
  onPress?: () => void;
}) {
  const completedDate = new Date(skill.completedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.skillCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.skillIconContainer}>
        <Text style={styles.skillIcon}>🎯</Text>
      </View>

      <View style={styles.skillInfo}>
        <Text style={styles.skillName} numberOfLines={1}>
          {skill.name}
        </Text>
        <Text style={styles.skillDate}>{completedDate}</Text>
      </View>

      <LevelBadge level={skill.levelReached} size="small" showIcon={false} />
    </TouchableOpacity>
  );
}

export default function SkillHistoryList({
  skills,
  initiallyExpanded = false,
  onSkillPress,
}: SkillHistoryListProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  if (skills.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>🎓</Text>
          <Text style={styles.headerTitle}>Skills Learned</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{skills.length}</Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#9ca3af"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.listContainer}>
          {skills.map((skill) => (
            <SkillHistoryCard
              key={skill.id}
              skill={skill}
              onPress={onSkillPress ? () => onSkillPress(skill) : undefined}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  skillIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  skillIcon: {
    fontSize: 16,
  },
  skillInfo: {
    flex: 1,
    gap: 4,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  skillDate: {
    fontSize: 12,
    color: '#6b7280',
  },
});
