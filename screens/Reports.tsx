import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTaskContext } from '../components/TaskContext';

function Reports() {
  const { isDarkMode } = useTaskContext();

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>Generate and view reports on deliveries, performance, and analytics.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subtitle: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginTop: 10,
  },
  darkText: {
    color: '#FFFFFF', // White text for dark mode
  },
});

export default Reports;
