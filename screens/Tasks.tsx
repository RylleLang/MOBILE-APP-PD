import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';

interface Task {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  time: string;
  nurse?: string;
  source?: string;
  destination?: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', name: 'Clean Room A', priority: 'high', time: '10:30 AM' },
    { id: '2', name: 'Inspect Corridor', priority: 'medium', time: '11:00 AM' },
    { id: '3', name: 'Charge Battery', priority: 'low', time: '12:00 PM' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nurse, setNurse] = useState('');
  const [taskType, setTaskType] = useState('Delivery');
  const [source, setSource] = useState('Supply Room');
  const [destination, setDestination] = useState('Room A');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const sources = ['Supply Room', 'Pharmacy', 'Storage'];
  const destinations = ['Room A', 'Room B', 'Emergency Room'];
  const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

  const addTask = () => {
    if (!nurse || !taskType || !source || !destination) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      name: `${taskType} from ${source} to ${destination}`,
      priority,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      nurse,
      source,
      destination,
    };
    setTasks([...tasks, newTask]);
    setModalVisible(false);
    setNurse('');
    setTaskType('Delivery');
    setSource('Supply Room');
    setDestination('Room A');
    setPriority('medium');
    Alert.alert('Success', 'Task added');
  };

  const renderTask = ({ item }: { item: Task }) => {
    const priorityColor = item.priority === 'high' ? '#e53935' : item.priority === 'medium' ? '#f0dd0f' : '#7bb662';

    return (
      <View style={styles.taskItem}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          {item.nurse && <Text style={styles.nurse}>Nurse: {item.nurse}</Text>}
          <Text style={[styles.priority, { color: priorityColor }]}>{item.priority.toUpperCase()}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Queue</Text>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
            <Text style={styles.label}>Nurse Name</Text>
            <TextInput style={styles.input} value={nurse} onChangeText={setNurse} placeholder="Enter nurse name" />

            <Text style={styles.label}>Task Type</Text>
            <TextInput style={styles.input} value={taskType} onChangeText={setTaskType} placeholder="e.g., Delivery" />

            <Text style={styles.label}>From (Source)</Text>
            <View style={styles.pickerContainer}>
              {sources.map((s) => (
                <TouchableOpacity key={s} style={styles.pickerItem} onPress={() => setSource(s)}>
                  <Text style={[styles.pickerText, source === s && styles.selected]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>To (Destination)</Text>
            <View style={styles.pickerContainer}>
              {destinations.map((d) => (
                <TouchableOpacity key={d} style={styles.pickerItem} onPress={() => setDestination(d)}>
                  <Text style={[styles.pickerText, destination === d && styles.selected]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.pickerContainer}>
              {priorities.map((p) => (
                <TouchableOpacity key={p} style={styles.pickerItem} onPress={() => setPriority(p)}>
                  <Text style={[styles.pickerText, priority === p && styles.selected]}>
                    {p === 'high' ? 'Emergency' : p === 'medium' ? 'Urgent' : 'Normal'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.submitButton} onPress={addTask}>
                <Text style={styles.submitButtonText}>Submit Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
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
  list: {
    flex: 1,
  },
  taskItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
  },
  info: {
    flexDirection: 'column',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nurse: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    fontStyle: 'italic',
  },
  priority: {
    fontWeight: '500',
    fontSize: 14,
  },
  time: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#e53935',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f6f7fb',
  },
  modalScroll: {
    flex: 1,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  selected: {
    color: '#3513e1',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#7bb662',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e53935',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Tasks;
