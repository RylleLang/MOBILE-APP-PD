import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Monitoring;
