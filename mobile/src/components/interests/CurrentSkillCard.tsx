import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LevelBadge from '../ui/LevelBadge';
import { CurrentSkill, interestService } from '../../services/interestService';

interface CurrentSkillCardProps {
  skill: CurrentSkill;
  onPress?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

const LEVEL_GRADIENTS = {
  beginner: ['#22c55e', '#16a34a'] as const,
  intermediate: ['#f59e0b', '#d97706'] as const,
  advanced: ['#8b5cf6', '#7c3aed'] as const,
};

export default function CurrentSkillCard({
  skill,
  onPress,
  onEdit,
  compact = false,
}: CurrentSkillCardProps) {
  const daysSinceStart = interestService.getDaysSinceStart(skill.startDate);
  const levelColors = LEVEL_GRADIENTS[skill.level as keyof typeof LEVEL_GRADIENTS] || LEVEL_GRADIENTS.beginner;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={levelColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactGradient}
        >
          <View style={styles.compactContent}>
            <Text style={styles.compactIcon}>🎯</Text>
            <View style={styles.compactInfo}>
              <Text style={styles.compactTitle} numberOfLines={1}>
                {skill.name}
              </Text>
              <Text style={styles.compactLevel}>
                {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...levelColors, levelColors[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🎯</Text>
            <Text style={styles.headerLabel}>Currently Learning</Text>
          </View>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <TouchableOpacity
        style={styles.body}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.titleRow}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <LevelBadge level={skill.level} size="medium" />
        </View>

        {skill.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text-outline" size={14} color="#9ca3af" />
            <Text style={styles.notesText} numberOfLines={2}>
              {skill.notes}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.progressIndicator}>
            <View style={styles.levelDots}>
              {['beginner', 'intermediate', 'advanced'].map((level, index) => (
                <View
                  key={level}
                  style={[
                    styles.levelDot,
                    {
                      backgroundColor:
                        ['beginner', 'intermediate', 'advanced'].indexOf(skill.level) >= index
                          ? levelColors[0]
                          : '#374151',
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.levelProgressText}>
              Level {['beginner', 'intermediate', 'advanced'].indexOf(skill.level) + 1} of 3
            </Text>
          </View>

          <View style={styles.daysContainer}>
            <Ionicons name="time-outline" size={14} color="#9ca3af" />
            <Text style={styles.daysText}>
              {daysSinceStart} day{daysSinceStart !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editButton: {
    padding: 4,
  },
  body: {
    padding: 16,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  skillName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 10,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  levelDots: {
    flexDirection: 'row',
    gap: 4,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  daysText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Compact styles
  compactContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactGradient: {
    padding: 12,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactIcon: {
    fontSize: 24,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  compactLevel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
