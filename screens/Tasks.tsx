import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTaskContext, Task } from '../components/TaskContext';

type TasksProps = {
	navigation: any;
};

function Tasks({ navigation }: TasksProps) {
	const { tasks } = useTaskContext();

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
		<View style={styles.container}>
			<Text style={styles.title}>Delivery Queue ({tasks.length})</Text>
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
		backgroundColor: '#f5f5f5',
		padding: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	taskItem: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 8,
		marginBottom: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	taskHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	taskId: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	priorityTag: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	normalTag: {
		backgroundColor: '#007bff',
	},
	urgentTag: {
		backgroundColor: '#dc3545',
	},
	priorityText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: 'bold',
	},
	sourceDest: {
		fontSize: 16,
		marginBottom: 4,
	},
	items: {
		fontSize: 16,
		marginBottom: 4,
	},
	requester: {
		fontSize: 14,
		color: '#666',
	},
	fab: {
		position: 'absolute',
		bottom: 20,
		right: 20,
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#007bff',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	fabText: {
		color: '#fff',
		fontSize: 30,
		fontWeight: 'bold',
	},
});

export default Tasks;
