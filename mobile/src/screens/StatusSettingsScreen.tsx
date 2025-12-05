import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export default function StatusSettingsScreen({ navigation }: any) {
  const { user, updateUser } = useAuth();
  const [status, setStatus] = useState(user?.status || '');
  const [isLoading, setIsLoading] = useState(false);

  const quickStatuses = [
    { label: 'Available', emoji: '✅' },
    { label: 'Busy', emoji: '💼' },
    { label: 'Learning', emoji: '📚' },
    { label: 'Working on a project', emoji: '💻' },
    { label: 'Looking for team', emoji: '🔍' },
    { label: 'Taking a break', emoji: '☕' },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateProfile({
        status: status.trim() || 'Available',
      });

      updateUser(updatedUser);
      Alert.alert('Success', 'Status updated successfully');
      navigation.goBack();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update status';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectQuickStatus = (statusLabel: string) => {
    setStatus(statusLabel);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Status</Text>
        <Text style={styles.subtitle}>
          Let others know what you're up to
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Current Status</Text>
        <TextInput
          style={styles.input}
          value={status}
          onChangeText={setStatus}
          placeholder="e.g., Available, Busy, Learning"
          editable={!isLoading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Quick Status</Text>
        <Text style={styles.hint}>Tap to select a common status</Text>
        <View style={styles.quickStatusGrid}>
          {quickStatuses.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickStatusItem,
                status === item.label && styles.quickStatusItemActive,
              ]}
              onPress={() => selectQuickStatus(item.label)}
              disabled={isLoading}
            >
              <Text style={styles.quickStatusEmoji}>{item.emoji}</Text>
              <Text
                style={[
                  styles.quickStatusLabel,
                  status === item.label && styles.quickStatusLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoEmoji}>💡</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Status visibility</Text>
          <Text style={styles.infoText}>
            Your status is visible to all students on Collabiaa and helps them understand your availability.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Status</Text>
        )}
      </TouchableOpacity>

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
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  quickStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickStatusItem: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '47%',
  },
  quickStatusItemActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eff6ff',
  },
  quickStatusEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickStatusLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  quickStatusLabelActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
