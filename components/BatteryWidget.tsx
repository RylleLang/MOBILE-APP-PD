import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BatteryWidgetProps {
  percentage: number;
}

const BatteryWidget: React.FC<BatteryWidgetProps> = ({ percentage }) => {
  const getColor = (percent: number) => {
    if (percent > 75) return '#7bb662'; // green
    if (percent > 50) return '#f0dd0f'; // yellow
    if (percent > 25) return '#fb8c00'; // orange
    return '#e53935'; // red
  };

  const color = getColor(percentage);

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.text}>Battery: {percentage}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default BatteryWidget;
