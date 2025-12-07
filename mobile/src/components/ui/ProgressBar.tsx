import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'right';
  gradientColors?: readonly [string, string, ...string[]];
  backgroundColor?: string;
}

export default function ProgressBar({
  progress,
  height = 8,
  showLabel = false,
  labelPosition = 'right',
  gradientColors = ['#A06EFF', '#6C4DFF'],
  backgroundColor = '#e5e7eb',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height, backgroundColor }]}>
        {clampedProgress > 0 && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.fill,
              {
                width: `${clampedProgress}%`,
                height,
              },
            ]}
          >
            {showLabel && labelPosition === 'inside' && clampedProgress > 20 && (
              <Text style={styles.insideLabel}>{Math.round(clampedProgress)}%</Text>
            )}
          </LinearGradient>
        )}
      </View>
      {showLabel && labelPosition === 'right' && (
        <Text style={styles.rightLabel}>{Math.round(clampedProgress)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  insideLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  rightLabel: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    minWidth: 36,
  },
});
