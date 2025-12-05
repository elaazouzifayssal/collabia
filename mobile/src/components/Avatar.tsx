import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { getUIAvatarUrl } from '../utils/gravatar';

interface AvatarProps {
  name: string;
  email?: string;
  size?: number;
  style?: ViewStyle;
}

export default function Avatar({ name, email, size = 40, style }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Use UI Avatars (generates avatar from name)
  const avatarUrl = getUIAvatarUrl(name, size * 2); // 2x for retina

  if (imageError) {
    // Fallback to initials
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }, style]}>
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
          {name?.charAt(0).toUpperCase() || 'U'}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: avatarUrl }}
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }, style]}
      onError={() => setImageError(true)}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#e5e7eb',
  },
  fallback: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
