import React, { useEffect } from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import useAuthStore from "./src/state/useAuthStore";

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ChallengeListScreen from './src/screens/ChallengeListScreen';
import ChallengeDetailScreen from './src/screens/ChallengeDetailScreen';
import CaptureScreen from './src/screens/CaptureScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ProgressScreen from './src/screens/ProgressScreen';
// Admin Screens
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminChallengesScreen from './src/screens/AdminChallengesScreen';
import AdminSubmissionsScreen from './src/screens/AdminSubmissionsScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';
import AdminCreateChallengeScreen from './src/screens/AdminCreateChallengeScreen';
import AdminEditChallengeScreen from './src/screens/AdminEditChallengeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#94A3B8',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Challenges"
        component={ChallengeListScreen}
        options={{ 
          tabBarLabel: 'Challenges',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trail-sign-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ 
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ 
          tabBarLabel: 'Leaderboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
        initialParams={{ challengeId: 'all' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="ChallengeList"
              component={ChallengeListScreen}
            />
            <Stack.Screen
              name="ChallengeDetail"
              component={ChallengeDetailScreen}
            />
            <Stack.Screen name="CaptureCheckpoint" component={CaptureScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminChallenges" component={AdminChallengesScreen} />
            <Stack.Screen name="AdminSubmissions" component={AdminSubmissionsScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
            <Stack.Screen name="AdminCreateChallenge" component={AdminCreateChallengeScreen} />
            <Stack.Screen name="AdminEditChallenge" component={AdminEditChallengeScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}

