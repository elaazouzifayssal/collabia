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
import { Ionicons } from '@expo/vector-icons';

export default function SchoolVerificationScreen({ navigation }: any) {
  const { user, refreshUser } = useAuth();
  const [schoolEmail, setSchoolEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!schoolEmail.trim()) {
      Alert.alert('Error', 'Please enter your school email');
      return;
    }

    setIsVerifying(true);
    try {
      await userService.verifySchool(schoolEmail.trim());
      await refreshUser();
      Alert.alert('Success', 'School verified successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to verify school';
      Alert.alert('Error', message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (user?.schoolVerified) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>School Verification</Text>
        </View>

        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>School Verified!</Text>
          <Text style={styles.successText}>
            Your school has been verified with {user.schoolEmail}
          </Text>
          {user.verifiedAt && (
            <Text style={styles.successDate}>
              Verified on {new Date(user.verifiedAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Verification Benefits</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
            <Text style={styles.benefitText}>Verified badge on your profile</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
            <Text style={styles.benefitText}>Higher trust from other students</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
            <Text style={styles.benefitText}>Priority in search results</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify Your School</Text>
        <Text style={styles.subtitle}>
          Get a verified badge by confirming your educational email
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoEmoji}>🎓</Text>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Why verify?</Text>
          <Text style={styles.infoText}>
            Verification builds trust and helps other students know you're a real student at {user?.school || 'your school'}.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Educational Email</Text>
        <Text style={styles.hint}>Use your school email address (.ac.ma, .edu, etc.)</Text>
        <TextInput
          style={styles.input}
          value={schoolEmail}
          onChangeText={setSchoolEmail}
          placeholder="your.name@school.ac.ma"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isVerifying}
        />
      </View>

      <View style={styles.validDomainsCard}>
        <Text style={styles.validDomainsTitle}>Accepted domains:</Text>
        <View style={styles.domainTags}>
          <View style={styles.domainTag}>
            <Text style={styles.domainTagText}>.ac.ma</Text>
          </View>
          <View style={styles.domainTag}>
            <Text style={styles.domainTagText}>.edu</Text>
          </View>
          <View style={styles.domainTag}>
            <Text style={styles.domainTagText}>.edu.ma</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
        onPress={handleVerify}
        disabled={isVerifying}
      >
        {isVerifying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.verifyButtonText}>Verify School</Text>
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
  validDomainsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  validDomainsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  domainTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  domainTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  domainTagText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#10b981',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  successDate: {
    fontSize: 13,
    color: '#9ca3af',
  },
  benefitsCard: {
    backgroundColor: '#ecfdf5',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#047857',
    marginLeft: 12,
  },
});
