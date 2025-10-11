import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RobotStatus: React.FC = () => {
  const isOnline = true; // Mock status
  const robotId = 'MED-001';
  const positionX = 43.3;
  const positionY = 18;
  const currentTask = 'Going to Patient Room';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Robot Status</Text>
      
      {/* Online Status Indicator */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4caf50' : '#f44336' }]} />
        <Text style={[styles.statusText, { color: isOnline ? '#4caf50' : '#f44336' }]}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>

      {/* Robot ID */}
      <Text style={styles.infoText}>ID: {robotId}</Text>

      {/* Current Position */}
      <Text style={styles.infoText}>Current Position: X={positionX} Y={positionY}</Text>

      {/* Current Task */}
      <Text style={styles.infoText}>Current Task: {currentTask}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  title: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default RobotStatus;
