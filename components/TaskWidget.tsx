import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type TaskWidgetProps = {
	navigation: any; // For navigation
};

function TaskWidget({ navigation }: TaskWidgetProps) {
	return (
		<TouchableOpacity style={styles.container} onPress={() => navigation.navigate('Tasks')}>
			<Text style={styles.title}>Current Task</Text>
			<Text style={styles.task}>Patient room delivery (example)</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 8,
		margin: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	task: {
		fontSize: 16,
		color: '#666',
	},
});

export default TaskWidget;
