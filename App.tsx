import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Dashboard from './screens/Dashboard';
import Tasks from './screens/Tasks';
import RobotMap from './screens/RobotMap';
import Monitoring from './screens/Monitoring';
import Reports from './screens/Reports';
import Settings from './screens/Settings';
import Help from './screens/Help';
import Logout from './screens/Logout';
import SupplyRequest from './screens/SupplyRequest';
import { TaskProvider } from './components/TaskContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'RobotMap') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Monitoring') {
            iconName = focused ? 'eye' : 'eye-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Help') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          } else if (route.name === 'Logout') {
            iconName = focused ? 'log-out' : 'log-out-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Tasks" component={Tasks} />
      <Tab.Screen name="RobotMap" component={RobotMap} options={{ title: 'Robot Map' }} />
      <Tab.Screen name="Monitoring" component={Monitoring} />
      <Tab.Screen name="Reports" component={Reports} />
      <Tab.Screen name="Settings" component={Settings} />
      <Tab.Screen name="Help" component={Help} />
      <Tab.Screen name="Logout" component={Logout} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="SupplyRequest" component={SupplyRequest} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </TaskProvider>
  );
}
