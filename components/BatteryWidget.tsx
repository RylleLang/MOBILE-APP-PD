import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BatteryWidgetProps = {
	battery: number;
};

function BatteryWidget({ battery }: BatteryWidgetProps) {
	const getBatteryColor = (level: number): string => {
		if (level >= 71) return 'green';
		if (level >= 31) return 'yellow';
		if (level >= 16) return 'orange';
		return 'red';
	};

	return (
		<View style={[styles.container, { backgroundColor: getBatteryColor(battery) }]}>
			<Text style={styles.title}>Battery Level</Text>
			<Text style={styles.value}>{battery}%</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		borderRadius: 8,
		margin: 8,
		alignItems: 'center',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff',
	},
	value: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#fff',
		marginTop: 8,
	},
});

export default BatteryWidget;
