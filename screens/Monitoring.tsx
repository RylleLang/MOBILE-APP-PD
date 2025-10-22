import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

function Monitoring() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoring</Text>
      <Text>Real-time monitoring of robot activities and system status.</Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D47A1', // Dark blue
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default Monitoring;
