import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTaskContext, Task } from '../components/TaskContext';

type TasksProps = {
	navigation: any;
};

function Tasks({ navigation }: TasksProps) {
	const { tasks, isDarkMode } = useTaskContext();

	const renderTask = ({ item }: { item: Task }) => (
		<View style={styles.taskItem}>
			<View style={styles.taskHeader}>
				<Text style={styles.taskId}>{item.id}</Text>
				<View style={[styles.priorityTag, item.priority === 'URGENT' ? styles.urgentTag : styles.normalTag]}>
					<Text style={styles.priorityText}>{item.priority}</Text>
				</View>
			</View>
			<Text style={styles.sourceDest}>From: {item.source} – To: {item.destination}</Text>
			<Text style={styles.items}>Items: {item.items.join(', ')}</Text>
			<Text style={styles.requester}>By: {item.requester}, {item.timestamp}</Text>
		</View>
	);

	return (
		<View style={[styles.container, isDarkMode && styles.darkContainer]}>
			<Text style={[styles.pageTitle, isDarkMode && styles.darkText]}>Tasks</Text>
			<Text style={[styles.title, isDarkMode && styles.darkText]}>Delivery Queue ({tasks.length})</Text>
			<FlatList
				data={tasks}
				keyExtractor={(item) => item.id}
				renderItem={renderTask}
			/>
			<TouchableOpacity
				style={styles.fab}
				onPress={() => navigation.navigate('SupplyRequest')}
			>
				<Text style={styles.fabText}>+</Text>
			</TouchableOpacity>
		</View>
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
		marginBottom: 10,
		textAlign: 'center',
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#0D47A1', // Dark blue
		textAlign: 'center',
		marginBottom: 24,
		fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
	},
	darkText: {
		color: '#FFFFFF', // White text for dark mode
	},
	taskItem: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		borderWidth: 1,
		borderColor: '#BBDEFB',
	},
	taskHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	taskId: {
		fontSize: 20,
		fontWeight: '600',
		color: '#0D47A1',
		fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
	},
	priorityTag: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 8,
	},
	normalTag: {
		backgroundColor: '#1976D2', // Medical blue
	},
	urgentTag: {
		backgroundColor: '#D32F2F', // Red for urgent
	},
	priorityText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: '600',
		fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
	},
	sourceDest: {
		fontSize: 16,
		marginBottom: 8,
		color: '#424242',
		fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
	},
	items: {
		fontSize: 16,
		marginBottom: 8,
		color: '#424242',
		fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
	},
	requester: {
		fontSize: 14,
		color: '#757575',
		fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
	},
	fab: {
		position: 'absolute',
		bottom: 30,
		right: 30,
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: '#1976D2', // Medical blue
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#1976D2',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	fabText: {
		color: '#fff',
		fontSize: 32,
		fontWeight: '700',
		fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
	},
});

export default Tasks;
