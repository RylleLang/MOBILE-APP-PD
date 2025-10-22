import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import MapContainer from '../components/MapContainer';
import BatteryWidget from '../components/BatteryWidget';
import TaskWidget from '../components/TaskWidget';
import RobotStatus from '../components/RobotStatus';
import { useTaskContext } from '../components/TaskContext';

type DashboardProps = {
	navigation: any;
};

function Dashboard({ navigation }: DashboardProps) {
	const { isDarkMode } = useTaskContext();
	// Placeholder values for now
	const position = { x: 43.3, y: -1.8 };
	const id = 'MED-001';
	// Battery state is shared
	const [battery, setBattery] = useState(24);

	const handlePause = () => alert('Pause pressed');
	const handleResume = () => alert('Resume pressed');
	const handleEmergencyStop = () => alert('Emergency Stop pressed');

	return (
		<ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
			<Text style={[styles.pageTitle, isDarkMode && styles.darkText]}>Dashboard</Text>
			<RobotStatus
				position={position}
				battery={battery}
				task="Going to Patient Room"
				id={id}
				onPause={handlePause}
				onResume={handleResume}
				onEmergencyStop={handleEmergencyStop}
			/>
			<MapContainer />
			<TaskWidget navigation={navigation} />
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
		marginBottom: 20,
		textAlign: 'center',
	},
	darkText: {
		color: '#ffffff',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
});

export default Dashboard;
