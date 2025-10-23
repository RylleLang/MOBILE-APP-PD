import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { app, auth } from './firebaseConfig';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Tasks from './screens/Tasks';
import RobotMap from './screens/RobotMap';
import Reports from './screens/Reports';
import Settings from './screens/Settings';
import Logout from './screens/Logout';
import SupplyRequest from './screens/SupplyRequest';
import FaceAuth from './screens/FaceAuth';
import VoiceAuth from './screens/VoiceAuth';
import { TaskProvider } from './components/TaskContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'RobotMap') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Logout') {
            iconName = focused ? 'log-out' : 'log-out-outline';
          } else if (route.name === 'FaceAuth') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'VoiceAuth') {
            iconName = focused ? 'mic' : 'mic-outline';
          }
          return <Ionicons name={iconName} size={28} color={focused ? '#3b82f6' : '#b0b3b8'} style={{ marginBottom: 2 }} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#b0b3b8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 6,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(20, 24, 36, 0.98)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 70,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 10,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Tasks" component={Tasks} />
      <Tab.Screen name="RobotMap" component={RobotMap} options={{ title: 'Robot Map' }} />
      <Tab.Screen name="Reports" component={Reports} />
      {/* Logout removed from tab navigator as it's now in Settings */}
      <Tab.Screen name="FaceAuth" component={FaceAuth} options={{ title: 'Face Auth' }} />
      <Tab.Screen name="VoiceAuth" component={VoiceAuth} options={{ title: 'Voice Auth' }} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="SupplyRequest" component={SupplyRequest} />
          </>
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
