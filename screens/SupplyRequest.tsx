import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useTaskContext, Task } from '../components/TaskContext';

type SupplyRequestProps = {
  navigation: any;
};

const suppliesOptions = [
  'Syringes (5ml)',
  'Bandages',
  'Morphine 10mg',
  'IV Fluids',
  'Gloves',
  'Antiseptic Solution',
  'Gauze Pads',
  'Thermometer',
];

const sourceOptions = ['Supply Room', 'Pharmacy', 'Storage Room'];

const destinationOptions = [
  'Room A1',
  'Room A2',
  'Room A3',
  'Room B1',
  'Room B2',
  'ICU',
  'Emergency Room',
];

function SupplyRequest({ navigation }: SupplyRequestProps) {
  const { tasks, addTask } = useTaskContext();
  const [nurseName, setNurseName] = useState('');
  const [selectedSupplies, setSelectedSupplies] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [notes, setNotes] = useState('');

  const toggleSupply = (supply: string) => {
    setSelectedSupplies((prev) =>
      prev.includes(supply)
        ? prev.filter((s) => s !== supply)
        : [...prev, supply]
    );
  };

  const handleSubmit = () => {
    if (!nurseName.trim()) {
      Alert.alert('Error', 'Nurse name is required.');
      return;
    }
    if (selectedSupplies.length === 0) {
      Alert.alert('Error', 'Please select at least one medical supply.');
      return;
    }
    if (!selectedSource) {
      Alert.alert('Error', 'Please select a source location.');
      return;
    }
    if (!selectedDestination) {
      Alert.alert('Error', 'Please select a destination room.');
      return;
    }

    addTask({
      priority,
      source: selectedSource,
      destination: selectedDestination,
      items: selectedSupplies,
      requester: nurseName,
    });

    Alert.alert('Success', 'Delivery request submitted successfully!');
    // Reset form
    setNurseName('');
    setSelectedSupplies([]);
    setSelectedSource('');
    setSelectedDestination('');
    setPriority('NORMAL');
    setNotes('');
    navigation.goBack();
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskId}>{item.id}</Text>
        <View
          style={[
            styles.priorityTag,
            item.priority === 'URGENT' ? styles.urgentTag : styles.normalTag,
          ]}
        >
          <Text style={styles.priorityText}>{item.priority}</Text>
        </View>
      </View>
      <Text style={styles.sourceDest}>
        From: {item.source} – To: {item.destination}
      </Text>
      <Text style={styles.items}>Items: {item.items.join(', ')}</Text>
      <Text style={styles.requester}>
        By: {item.requester}, {item.timestamp}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.queueContainer}>
        <Text style={styles.queueTitle}>Delivery Queue ({tasks.length})</Text>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          horizontal
        />
      </View>
      <ScrollView style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Nurse Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter nurse name *"
          value={nurseName}
          onChangeText={setNurseName}
        />

        <Text style={styles.sectionTitle}>Medical Supplies</Text>
        <View style={styles.optionsContainer}>
          {suppliesOptions.map((supply) => (
            <TouchableOpacity
              key={supply}
              style={[
                styles.optionButton,
                selectedSupplies.includes(supply) && styles.selectedButton,
              ]}
              onPress={() => toggleSupply(supply)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedSupplies.includes(supply) && styles.selectedText,
                ]}
              >
                {supply}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Source Location</Text>
        <View style={styles.optionsContainer}>
          {sourceOptions.map((source) => (
            <TouchableOpacity
              key={source}
              style={[
                styles.optionButton,
                selectedSource === source && styles.selectedButton,
              ]}
              onPress={() => setSelectedSource(source)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedSource === source && styles.selectedText,
                ]}
              >
                {source}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Destination Rooms</Text>
        <View style={styles.optionsContainer}>
          {destinationOptions.map((dest) => (
            <TouchableOpacity
              key={dest}
              style={[
                styles.optionButton,
                selectedDestination === dest && styles.selectedButton,
              ]}
              onPress={() => setSelectedDestination(dest)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedDestination === dest && styles.selectedText,
                ]}
              >
                {dest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Priority</Text>
        <View style={styles.priorityContainer}>
          <TouchableOpacity
            style={[
              styles.priorityButton,
              priority === 'NORMAL' && styles.selectedButton,
            ]}
            onPress={() => setPriority('NORMAL')}
          >
            <Text
              style={[
                styles.priorityButtonText,
                priority === 'NORMAL' && styles.selectedText,
              ]}
            >
              NORMAL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.priorityButton,
              priority === 'URGENT' && styles.selectedButton,
            ]}
            onPress={() => setPriority('URGENT')}
          >
            <Text
              style={[
                styles.priorityButtonText,
                priority === 'URGENT' && styles.selectedText,
              ]}
            >
              URGENT
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Notes (Optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Additional notes or special instructions..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Delivery Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() =>
              Alert.alert(
                'Cancel Request',
                'Are you sure you want to cancel the delivery request?',
                [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes', onPress: () => navigation.goBack() },
                ]
              )
            }
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#E3F2FD', // Light blue background
  },
  formContainer: {
    flex: 0.7,
    padding: 20,
  },
  queueContainer: {
    flex: 0.3,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#e9ecef',
    padding: 10,
    margin: 4,
    borderRadius: 8,
  },
  selectedButton: {
    backgroundColor: '#007bff',
  },
  optionText: {
    fontSize: 14,
  },
  selectedText: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#e9ecef',
    padding: 12,
    margin: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  cancelText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  queueTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: 200,
    marginRight: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priorityTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    fontSize: 10,
    fontWeight: 'bold',
  },
  sourceDest: {
    fontSize: 14,
    marginBottom: 2,
  },
  items: {
    fontSize: 14,
    marginBottom: 2,
  },
  requester: {
    fontSize: 12,
    color: '#666',
  },
});

export default SupplyRequest;
