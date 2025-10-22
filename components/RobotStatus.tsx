import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RobotStatusProps {
  position?: { x: number; y: number };
  battery?: number;
  task?: string;
  onPause?: () => void;
  onResume?: () => void;
  onEmergencyStop?: () => void;
  id?: string;
}

const RobotStatus: React.FC<RobotStatusProps> = ({
  position = { x: 0, y: 0 },
  battery = 0,
  task = 'Going to Patient Room',
  onPause,
  onResume,
  onEmergencyStop,
  id = 'MED-001',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Robot Status</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.position}>
            <Text style={styles.label}>Current Position</Text>{'\n'}
            X: {position.x}, Y: {position.y}
          </Text>
          <Text style={styles.task}>
            <Text style={styles.label}>Current Task</Text>{'\n'}
            {task}
          </Text>
          <Text style={styles.battery}>
            <Text style={styles.label}>Battery</Text>{'\n'}
            {battery}%
          </Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.button, styles.pause]} onPress={onPause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.resume]} onPress={onResume}>
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.stop]} onPress={onEmergencyStop}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    marginBottom: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  info: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  position: {
    color: '#7c3aed',
    fontWeight: '500',
    marginBottom: 8,
  },
  task: {
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  battery: {
    color: '#4caf50',
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  pause: {
    backgroundColor: '#ffb300',
  },
  resume: {
    backgroundColor: '#4caf50',
  },
  stop: {
    backgroundColor: '#e53935',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default RobotStatus;
