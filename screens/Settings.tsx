import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView, Image, Modal, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, deleteUser, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useTaskContext, User } from '../components/TaskContext';

function Settings() {
  const navigation = useNavigation();
  const { isDarkMode, setIsDarkMode, savedFaces, userProfile, updateUserProfile, updateFace, deleteFace, users } = useTaskContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showFaceDetailsModal, setShowFaceDetailsModal] = useState(false);
  const [selectedFace, setSelectedFace] = useState<any>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [nameValue, setNameValue] = useState(userProfile.name);
  const [contactValue, setContactValue] = useState(userProfile.contact);
  const [genderValue, setGenderValue] = useState(userProfile.gender);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingFaceIndex, setEditingFaceIndex] = useState<number | null>(null);
  const [faceEditData, setFaceEditData] = useState({ name: '', contact: '', email: '' });
  const [showProfileViewModal, setShowProfileViewModal] = useState(false);

  const isAdmin = auth.currentUser?.email === 'admin@admin.com';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await signOut(auth);
              await AsyncStorage.removeItem('userLoggedIn');
              // Navigation will automatically switch to Login screen due to auth state change
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (user) {
                await deleteUser(user);
                await AsyncStorage.removeItem('userLoggedIn');
                Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert('Notifications', `${notificationsEnabled ? 'Disabled' : 'Enabled'}`);
  };

  const handleFacePress = (face: any, index: number) => {
    setSelectedFace({ ...face, index });
    setShowFaceDetailsModal(true);
  };

  const handleUserPress = (index: number, user: User) => {
    Alert.alert('User Details', `Name: ${user.name}\nEmail: ${user.email}\nContact: ${user.contact}`);
  };

  const handleEditFace = () => {
    if (selectedFace && selectedFace.index !== undefined) {
      setEditingFaceIndex(selectedFace.index);
      setFaceEditData({
        name: selectedFace.details?.name || '',
        contact: selectedFace.details?.contact || '',
        email: selectedFace.details?.email || '',
      });
      setShowFaceDetailsModal(false);
    }
  };

  const handleSaveFaceEdit = () => {
    if (editingFaceIndex !== null) {
      const updatedFace = {
        ...savedFaces[editingFaceIndex],
        details: faceEditData,
      };
      updateFace(editingFaceIndex, updatedFace);
      setEditingFaceIndex(null);
      setFaceEditData({ name: '', contact: '', email: '' });
      Alert.alert('Success', 'Face details updated successfully.');
    }
  };

  const handleDeleteFace = () => {
    if (selectedFace && selectedFace.index !== undefined) {
      Alert.alert(
        'Delete Face',
        'Are you sure you want to delete this face?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteFace(selectedFace.index);
              setShowFaceDetailsModal(false);
              Alert.alert('Success', 'Face deleted successfully.');
            },
          },
        ]
      );
    }
  };

  const handleNameUpdate = async () => {
    try {
      const updatedProfile = { ...userProfile, name: nameValue };
      await updateUserProfile(updatedProfile);
      setShowNameModal(false);
      Alert.alert('Success', 'Name updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update name.');
    }
  };

  const handleContactUpdate = async () => {
    try {
      const updatedProfile = { ...userProfile, contact: contactValue };
      await updateUserProfile(updatedProfile);
      setShowContactModal(false);
      Alert.alert('Success', 'Contact updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update contact.');
    }
  };

  const handleGenderUpdate = async () => {
    try {
      const updatedProfile = { ...userProfile, gender: genderValue };
      await updateUserProfile(updatedProfile);
      setShowGenderModal(false);
      Alert.alert('Success', 'Gender updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update gender.');
    }
  };



  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      const user = auth.currentUser;
      if (user) {
        const credential = EmailAuthProvider.credential(user.email!, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setCurrentPassword('');
        setNewPassword('');
        Alert.alert('Success', 'Password updated successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update password.');
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail) {
      Alert.alert('Error', 'Please enter a new email.');
      return;
    }
    try {
      const user = auth.currentUser;
      if (user) {
        await updateEmail(user, newEmail);
        setNewEmail('');
        Alert.alert('Success', 'Email updated successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update email.');
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Appearance</Text>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={toggleTheme}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Theme</Text>
          <Text style={[styles.settingValue, isDarkMode && styles.darkText]}>{isDarkMode ? 'Dark' : 'Light'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Notifications</Text>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={toggleNotifications}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Push Notifications</Text>
          <Text style={[styles.settingValue, isDarkMode && styles.darkText]}>{notificationsEnabled ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Profile</Text>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={() => setShowNameModal(true)}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Update Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={() => setShowContactModal(true)}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Update Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={() => setShowGenderModal(true)}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Update Gender</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={() => setShowProfileViewModal(true)}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={() => setShowPasswordModal(true)}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={() => setShowEmailModal(true)}>
          <Text style={[styles.settingText, isDarkMode && styles.darkText]}>Change Email</Text>
        </TouchableOpacity>
      </View>

      {isAdmin && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Admin Panel</Text>
          <Text style={[styles.sectionSubtitle, isDarkMode && styles.darkText]}>Saved Faces</Text>
          {savedFaces.length > 0 ? (
            savedFaces.map((face, index) => (
              <TouchableOpacity key={index} style={[styles.faceItem, isDarkMode && styles.darkFaceItem]} onPress={() => handleFacePress(face, index)}>
                <Image source={{ uri: face.uri }} style={styles.faceImage} />
                <Text style={[styles.faceText, isDarkMode && styles.darkText]}>Face {index + 1}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noFacesText, isDarkMode && styles.darkText]}>No saved faces</Text>
          )}
          <Text style={[styles.sectionSubtitle, isDarkMode && styles.darkText]}>Users</Text>
          {users.length > 0 ? (
            users.map((user, index) => (
              <TouchableOpacity key={user.id} style={[styles.userItem, isDarkMode && styles.darkUserItem]} onPress={() => handleUserPress(index, user)}>
                <Text style={[styles.userText, isDarkMode && styles.darkText]}>{user.name} - {user.email}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noFacesText, isDarkMode && styles.darkText]}>No users</Text>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Account</Text>
        <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={handleLogout}>
          <Text style={[styles.settingText, { color: '#D32F2F' }]}>Logout</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={[styles.settingItem, isDarkMode && styles.darkSettingItem]} onPress={handleDeleteAccount}>
            <Text style={[styles.settingText, { color: '#D32F2F' }]}>Delete Account</Text>
          </TouchableOpacity>
        )}
      </View>



      <Modal visible={showEmailModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Email</Text>
            <TextInput
              style={styles.input}
              placeholder="New Email"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={() => { handleEmailChange(); setShowEmailModal(false); }}>
              <Text style={styles.buttonText}>Update Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEmailModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={() => { handlePasswordChange(); setShowPasswordModal(false); }}>
              <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showFaceDetailsModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Face Details</Text>
            {selectedFace && (
              <>
                <Image source={{ uri: selectedFace.uri }} style={styles.faceImageLarge} />
                <Text style={styles.detailText}>Name: {selectedFace.details?.name || 'N/A'}</Text>
                <Text style={styles.detailText}>Contact: {selectedFace.details?.contact || 'N/A'}</Text>
                <Text style={styles.detailText}>Email: {selectedFace.details?.email || 'N/A'}</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.editButton} onPress={handleEditFace}>
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteFace}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFaceDetailsModal(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={editingFaceIndex !== null} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Face Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={faceEditData.name}
              onChangeText={(text) => setFaceEditData({ ...faceEditData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact"
              value={faceEditData.contact}
              onChangeText={(text) => setFaceEditData({ ...faceEditData, contact: text })}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={faceEditData.email}
              onChangeText={(text) => setFaceEditData({ ...faceEditData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveFaceEdit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingFaceIndex(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showProfileViewModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>View Profile</Text>
            <Text style={styles.detailText}>Name: {userProfile.name}</Text>
            <Text style={styles.detailText}>Contact: {userProfile.contact}</Text>
            <Text style={styles.detailText}>Email: {auth.currentUser?.email}</Text>
            <Text style={styles.detailText}>Gender: {userProfile.gender}</Text>
            {userProfile.faceUri && (
              <Image source={{ uri: userProfile.faceUri }} style={styles.faceImageLarge} />
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowProfileViewModal(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showNameModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={nameValue}
              onChangeText={setNameValue}
            />
            <TouchableOpacity style={styles.button} onPress={() => { handleNameUpdate(); setShowNameModal(false); }}>
              <Text style={styles.buttonText}>Update Name</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowNameModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showContactModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={contactValue}
              onChangeText={setContactValue}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.button} onPress={() => { handleContactUpdate(); setShowContactModal(false); }}>
              <Text style={styles.buttonText}>Update Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowContactModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showGenderModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Gender</Text>
            <Picker
              selectedValue={genderValue}
              onValueChange={(itemValue) => setGenderValue(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
            <TouchableOpacity style={styles.button} onPress={() => { handleGenderUpdate(); setShowGenderModal(false); }}>
              <Text style={styles.buttonText}>Update Gender</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowGenderModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D47A1', // Dark blue
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  darkText: {
    color: '#FFFFFF', // White text for dark mode
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0D47A1',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkSettingItem: {
    backgroundColor: '#1E1E1E', // Dark setting item
  },
  settingText: {
    fontSize: 16,
    color: '#424242',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  settingValue: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0D47A1',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  faceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkFaceItem: {
    backgroundColor: '#1E1E1E',
  },
  faceImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  faceText: {
    fontSize: 16,
    color: '#424242',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  noFacesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkUserItem: {
    backgroundColor: '#1E1E1E',
  },
  userText: {
    fontSize: 16,
    color: '#424242',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#1976D2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
  },
  cancelText: {
    color: '#1976D2',
    fontSize: 16,
  },
  faceImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#424242',
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default Settings;
