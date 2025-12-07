import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  interestService,
  CurrentBook,
  CurrentSkill,
  CurrentGame,
} from '../services/interestService';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';
type GameFrequency = 'daily' | 'weekly' | 'occasionally';

export default function EditInterestsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Book state
  const [bookTitle, setBookTitle] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [hasBook, setHasBook] = useState(false);

  // Skill state
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [skillNotes, setSkillNotes] = useState('');
  const [hasSkill, setHasSkill] = useState(false);

  // Game state
  const [gameName, setGameName] = useState('');
  const [gameRank, setGameRank] = useState('');
  const [gameFrequency, setGameFrequency] = useState<GameFrequency | null>(null);
  const [hasGame, setHasGame] = useState(false);

  useEffect(() => {
    loadCurrentInterests();
  }, []);

  const loadCurrentInterests = async () => {
    try {
      const interests = await interestService.getCurrentInterests();

      if (interests.currentBook) {
        setBookTitle(interests.currentBook.title);
        setTotalPages(interests.currentBook.totalPages?.toString() || '');
        setPagesRead(interests.currentBook.pagesRead.toString());
        setHasBook(true);
      }

      if (interests.currentSkill) {
        setSkillName(interests.currentSkill.name);
        setSkillLevel(interests.currentSkill.level as SkillLevel);
        setSkillNotes(interests.currentSkill.notes || '');
        setHasSkill(true);
      }

      if (interests.currentGame) {
        setGameName(interests.currentGame.name);
        setGameRank(interests.currentGame.rank || '');
        setGameFrequency(interests.currentGame.frequency as GameFrequency | null);
        setHasGame(true);
      }
    } catch (error) {
      console.error('Error loading interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async () => {
    if (!bookTitle.trim()) {
      Alert.alert('Error', 'Please enter a book title');
      return;
    }

    setSaving(true);
    try {
      await interestService.updateCurrentBook({
        title: bookTitle.trim(),
        totalPages: totalPages ? parseInt(totalPages) : undefined,
        pagesRead: pagesRead ? parseInt(pagesRead) : 0,
      });
      setHasBook(true);
      Alert.alert('Success', 'Book updated successfully');
    } catch (error) {
      console.error('Error saving book:', error);
      Alert.alert('Error', 'Failed to update book');
    } finally {
      setSaving(false);
    }
  };

  const handleClearBook = async () => {
    Alert.alert(
      'Clear Book',
      'Do you want to archive this book to history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete (No Archive)',
          style: 'destructive',
          onPress: async () => {
            try {
              await interestService.clearCurrentBook(false);
              setBookTitle('');
              setTotalPages('');
              setPagesRead('');
              setHasBook(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear book');
            }
          },
        },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              await interestService.clearCurrentBook(true);
              setBookTitle('');
              setTotalPages('');
              setPagesRead('');
              setHasBook(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to archive book');
            }
          },
        },
      ]
    );
  };

  const handleSaveSkill = async () => {
    if (!skillName.trim()) {
      Alert.alert('Error', 'Please enter a skill name');
      return;
    }

    setSaving(true);
    try {
      await interestService.updateCurrentSkill({
        name: skillName.trim(),
        level: skillLevel,
        notes: skillNotes.trim() || undefined,
      });
      setHasSkill(true);
      Alert.alert('Success', 'Skill updated successfully');
    } catch (error) {
      console.error('Error saving skill:', error);
      Alert.alert('Error', 'Failed to update skill');
    } finally {
      setSaving(false);
    }
  };

  const handleClearSkill = async () => {
    Alert.alert(
      'Clear Skill',
      'Do you want to archive this skill to history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete (No Archive)',
          style: 'destructive',
          onPress: async () => {
            try {
              await interestService.clearCurrentSkill(false);
              setSkillName('');
              setSkillLevel('beginner');
              setSkillNotes('');
              setHasSkill(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear skill');
            }
          },
        },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              await interestService.clearCurrentSkill(true);
              setSkillName('');
              setSkillLevel('beginner');
              setSkillNotes('');
              setHasSkill(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to archive skill');
            }
          },
        },
      ]
    );
  };

  const handleSaveGame = async () => {
    if (!gameName.trim()) {
      Alert.alert('Error', 'Please enter a game name');
      return;
    }

    setSaving(true);
    try {
      await interestService.updateCurrentGame({
        name: gameName.trim(),
        rank: gameRank.trim() || undefined,
        frequency: gameFrequency || undefined,
      });
      setHasGame(true);
      Alert.alert('Success', 'Game updated successfully');
    } catch (error) {
      console.error('Error saving game:', error);
      Alert.alert('Error', 'Failed to update game');
    } finally {
      setSaving(false);
    }
  };

  const handleClearGame = async () => {
    Alert.alert(
      'Clear Game',
      'Do you want to archive this game to history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete (No Archive)',
          style: 'destructive',
          onPress: async () => {
            try {
              await interestService.clearCurrentGame(false);
              setGameName('');
              setGameRank('');
              setGameFrequency(null);
              setHasGame(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear game');
            }
          },
        },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              await interestService.clearCurrentGame(true);
              setGameName('');
              setGameRank('');
              setGameFrequency(null);
              setHasGame(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to archive game');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Interests</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#8b5cf6', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionEmoji}>📖</Text>
            <Text style={styles.sectionTitle}>Currently Reading</Text>
          </LinearGradient>

          <View style={styles.sectionContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Book Title</Text>
              <TextInput
                style={styles.input}
                value={bookTitle}
                onChangeText={setBookTitle}
                placeholder="What are you reading?"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Total Pages</Text>
                <TextInput
                  style={styles.input}
                  value={totalPages}
                  onChangeText={setTotalPages}
                  placeholder="300"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Pages Read</Text>
                <TextInput
                  style={styles.input}
                  value={pagesRead}
                  onChangeText={setPagesRead}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#8b5cf6' }]}
                onPress={handleSaveBook}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {hasBook ? 'Update Book' : 'Add Book'}
                </Text>
              </TouchableOpacity>
              {hasBook && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClearBook}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Skill Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionEmoji}>🎯</Text>
            <Text style={styles.sectionTitle}>Currently Learning</Text>
          </LinearGradient>

          <View style={styles.sectionContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skill Name</Text>
              <TextInput
                style={styles.input}
                value={skillName}
                onChangeText={setSkillName}
                placeholder="What are you learning?"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Level</Text>
              <View style={styles.levelButtons}>
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      skillLevel === level && styles.levelButtonActive,
                    ]}
                    onPress={() => setSkillLevel(level)}
                  >
                    <Text
                      style={[
                        styles.levelButtonText,
                        skillLevel === level && styles.levelButtonTextActive,
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={skillNotes}
                onChangeText={setSkillNotes}
                placeholder="Any notes about your learning journey..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#22c55e' }]}
                onPress={handleSaveSkill}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {hasSkill ? 'Update Skill' : 'Add Skill'}
                </Text>
              </TouchableOpacity>
              {hasSkill && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClearSkill}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Game Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#ec4899', '#db2777']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionEmoji}>🎮</Text>
            <Text style={styles.sectionTitle}>Currently Playing</Text>
          </LinearGradient>

          <View style={styles.sectionContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Game Name</Text>
              <TextInput
                style={styles.input}
                value={gameName}
                onChangeText={setGameName}
                placeholder="What are you playing?"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rank (optional)</Text>
              <TextInput
                style={styles.input}
                value={gameRank}
                onChangeText={setGameRank}
                placeholder="Gold, Diamond, Immortal..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>How often do you play?</Text>
              <View style={styles.levelButtons}>
                {(['daily', 'weekly', 'occasionally'] as const).map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.levelButton,
                      gameFrequency === freq && styles.frequencyButtonActive,
                    ]}
                    onPress={() => setGameFrequency(freq)}
                  >
                    <Text
                      style={[
                        styles.levelButtonText,
                        gameFrequency === freq && styles.levelButtonTextActive,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: '#ec4899' }]}
                onPress={handleSaveGame}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {hasGame ? 'Update Game' : 'Add Game'}
                </Text>
              </TouchableOpacity>
              {hasGame && (
                <TouchableOpacity style={styles.clearButton} onPress={handleClearGame}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f8fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f7f8fa',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  sectionEmoji: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#22c55e',
  },
  frequencyButtonActive: {
    backgroundColor: '#ec4899',
  },
  levelButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  levelButtonTextActive: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  clearButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
