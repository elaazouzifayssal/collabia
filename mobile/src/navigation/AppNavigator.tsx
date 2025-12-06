import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

// Auth Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import SwipeScreen from '../screens/SwipeScreen';
import CollabScreen from '../screens/CollabScreen';
import CollaboratorProfileScreen from '../screens/CollaboratorProfileScreen';
import DiscoverInterestUsersScreen from '../screens/DiscoverInterestUsersScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CollaborationPreferencesScreen from '../screens/CollaborationPreferencesScreen';
import SkillsInterestsScreen from '../screens/SkillsInterestsScreen';
import SchoolVerificationScreen from '../screens/SchoolVerificationScreen';
import StatusSettingsScreen from '../screens/StatusSettingsScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import EditPostScreen from '../screens/EditPostScreen';
import InterestedUsersScreen from '../screens/InterestedUsersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import InterestedInYouScreen from '../screens/InterestedInYouScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeFeed"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Create Post' }}
      />
      <Stack.Screen
        name="EditPost"
        component={EditPostScreen}
        options={{ title: 'Edit Post' }}
      />
      <Stack.Screen
        name="InterestedUsers"
        component={InterestedUsersScreen}
        options={{ title: 'Interested Users' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="CollaborationPreferences"
        component={CollaborationPreferencesScreen}
        options={{ title: 'Collaboration Preferences' }}
      />
      <Stack.Screen
        name="SkillsInterests"
        component={SkillsInterestsScreen}
        options={{ title: 'Skills & Interests' }}
      />
      <Stack.Screen
        name="SchoolVerification"
        component={SchoolVerificationScreen}
        options={{ title: 'School Verification' }}
      />
      <Stack.Screen
        name="StatusSettings"
        component={StatusSettingsScreen}
        options={{ title: 'Status' }}
      />
    </Stack.Navigator>
  );
}

function DiscoverStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Swipe"
        component={SwipeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CollaboratorProfile"
        component={CollaboratorProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}

function LikesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InterestedInYou"
        component={InterestedInYouScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CollaboratorProfile"
        component={CollaboratorProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}

function CollabStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CollabList"
        component={CollabScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CollaboratorProfile"
        component={CollaboratorProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="DiscoverInterestUsers"
        component={DiscoverInterestUsersScreen}
        options={({ route }: any) => ({
          title: route.params?.interest || 'Interest',
        })}
      />
    </Stack.Navigator>
  );
}

function MessagesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MessagesList"
        component={MessagesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }: any) => ({
          title: route.params?.otherUser?.name || 'Chat',
        })}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { unreadMessageCount, interestsCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: 8,
        },
        tabBarItemStyle: {
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Collaborate"
        component={DiscoverStack}
        options={{
          headerShown: false,
          title: 'Collaborate',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Likes"
        component={LikesStack}
        options={{
          headerShown: false,
          title: 'Likes',
          tabBarBadge: interestsCount > 0 ? interestsCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          headerShown: false,
          title: 'Messages',
          tabBarBadge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: false,
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      setHasSeenOnboarding(false);
    }
  };

  if (isLoading || hasSeenOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
