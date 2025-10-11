import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import BatteryWidget from '../components/BatteryWidget';
import MapContainer from '../components/MapContainer';

const Dashboard: React.FC = () => {
  const batteryPercentage = 24; // Mock data from screenshot
  const robotId = 'MED-001';
  const position = 'X=43.3 Y=18';
  const currentTask = 'Going to Patient Room';

  const handlePause = () => Alert.alert('Pause', 'Robot paused');
  const handleResume = () => Alert.alert('Resume', 'Robot resumed');
  const handleStop = () => Alert.alert('Stop', 'Robot stopped');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      
      {/* Robot Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Robot Status</Text>
        <Text style={styles.infoText}>ID: {robotId}</Text>
        <Text style={styles.infoText}>Current Position: {position}</Text>
        <Text style={styles.infoText}>Current Task: {currentTask}</Text>
      </View>

      {/* Battery and Controls Row */}
      <View style={styles.row}>
        <View style={styles.batterySection}>
          <Text style={styles.sectionTitle}>Battery</Text>
          <BatteryWidget percentage={batteryPercentage} />
        </View>
        
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Controls</Text>
          <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={handlePause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.resumeButton]} onPress={handleResume}>
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>

      <MapContainer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f6f7fb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.8)',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  batterySection: {
    flex: 1,
  },
  controlsSection: {
    flex: 1,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
  },
  pauseButton: {
    backgroundColor: '#f0dd0f',
  },
  resumeButton: {
    backgroundColor: '#7bb662',
  },
  stopButton: {
    backgroundColor: '#e53935',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Dashboard;
