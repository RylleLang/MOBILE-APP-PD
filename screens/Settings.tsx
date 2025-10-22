import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, deleteUser } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useTaskContext } from '../components/TaskContext';

function Settings() {
  const navigation = useNavigation();
  const { isDarkMode, setIsDarkMode } = useTaskContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await signOut(auth);
              await AsyncStorage.removeItem('userLoggedIn');
              // Navigation will automatically switch to Login screen due to auth state change
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (user) {
                await deleteUser(user);
                await AsyncStorage.removeItem('userLoggedIn');
                Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert('Notifications', `${notificationsEnabled ? 'Disabled' : 'Enabled'}`);
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Appearance</Text>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={toggleTheme}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Theme</Text>
          <Text style={[styles.settingValue, isDarkMode && styles.darkText]}>{isDarkMode ? 'Dark' : 'Light'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Notifications</Text>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={toggleNotifications}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Push Notifications</Text>
          <Text style={[styles.settingValue, isDarkMode && styles.darkText]}>{notificationsEnabled ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Account</Text>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={handleLogout}>
          <Text style={[styles.settingText, { color: '#D32F2F' }]}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={handleDeleteAccount}>
          <Text style={[styles.settingText, { color: '#D32F2F' }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Light blue background
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#121212', // Dark background
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D47A1', // Dark blue
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  darkText: {
    color: '#FFFFFF', // White text for dark mode
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D47A1',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkSettingItem: {
    backgroundColor: '#1E1E1E', // Dark setting item
  },
  settingText: {
    fontSize: 16,
    color: '#424242',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  settingValue: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default Settings;
