import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import MapContainer from '../components/MapContainer';
import BatteryWidget from '../components/BatteryWidget';
import TaskWidget from '../components/TaskWidget';
import RobotStatus from '../components/RobotStatus';

type DashboardProps = {
	navigation: any;
};

function Dashboard({ navigation }: DashboardProps) {
	// Placeholder values for now
	const position = { x: 43.3, y: -1.8 };
	const id = 'MED-001';
	// Battery state is shared
	const [battery, setBattery] = useState(24);

	const handlePause = () => alert('Pause pressed');
	const handleResume = () => alert('Resume pressed');
	const handleEmergencyStop = () => alert('Emergency Stop pressed');

	return (
		<ScrollView style={styles.container}>
			<RobotStatus
				position={position}
				battery={battery}
				id={id}
				onPause={handlePause}
				onResume={handleResume}
				onEmergencyStop={handleEmergencyStop}
			/>
			<MapContainer />
			<View style={styles.row}>
				<BatteryWidget battery={battery} />
				<TaskWidget navigation={navigation} />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
});

export default Dashboard;
