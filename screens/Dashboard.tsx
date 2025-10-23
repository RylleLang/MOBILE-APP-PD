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
		backgroundColor: '#101828', // Deep dark blue
		padding: 20,
	},
	darkContainer: {
		backgroundColor: '#101828',
	},
	pageTitle: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#60A5FA', // Vibrant blue accent
		marginBottom: 20,
		textAlign: 'center',
		letterSpacing: 0.5,
	},
	darkText: {
		color: '#F3F4F6',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	card: {
		backgroundColor: '#1A2233',
		borderRadius: 18,
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 2,
	},
	button: {
		backgroundColor: '#2563EB',
		borderRadius: 24,
		paddingVertical: 12,
		paddingHorizontal: 24,
		alignItems: 'center',
		marginVertical: 8,
	},
	buttonText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
	},
});

export default Dashboard;
