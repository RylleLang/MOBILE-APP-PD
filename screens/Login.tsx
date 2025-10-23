import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, User, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useTaskContext } from '../components/TaskContext';
import { getDatabase, ref, set, get } from 'firebase/database';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

type LoginProps = {
  navigation: any;
};

const TermsAndConditionsModal = ({ visible, onClose, onAccept }: { visible: boolean; onClose: () => void; onAccept: () => void }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Terms and Conditions</Text>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalText}>
              Welcome to PD Mobile App. By using our service, you agree to these terms:

              1. User Data
              - We collect and store your email and authentication data
              - Your data is protected and only used for app functionality
              
              2. App Usage
              - The app is for authorized personnel only
              - You are responsible for maintaining your account security
              
              3. Privacy
              - We protect your personal information
              - Data is stored securely in our database
              
              4. Updates
              - Terms may be updated periodically
              - Users will be notified of significant changes
            </Text>
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalAcceptButton]} 
              onPress={onAccept}
            >
              <Text style={[styles.modalButtonText, styles.modalAcceptButtonText]}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

function Login({ navigation }: LoginProps) {
  const { isDarkMode } = useTaskContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [gender, setGender] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const checkUniqueness = async (field: string, value: string) => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      for (const uid in users) {
        if (users[uid][field] === value) {
          return false;
        }
      }
    }
    return true;
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && (!name || !contact || !gender || !username)) {
      Alert.alert('Error', 'Please fill in name, contact, gender, and username');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!isLogin && !termsAccepted) {
      Alert.alert('Error', 'Please accept the Terms and Conditions to continue');
      return;
    }

    if (!isLogin) {
      const isEmailUnique = await checkUniqueness('email', email);
      if (!isEmailUnique) {
        Alert.alert('Error', 'Email already exists');
        return;
      }
      const isUsernameUnique = await checkUniqueness('username', username);
      if (!isUsernameUnique) {
        Alert.alert('Error', 'Username already exists');
        return;
      }
      const isContactUnique = await checkUniqueness('contact', contact);
      if (!isContactUnique) {
        Alert.alert('Error', 'Contact number already exists');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Try to sign in with email first
        try {
          await signInWithEmailAndPassword(auth, email, password);
          await AsyncStorage.setItem('userLoggedIn', 'true');
        } catch (emailError) {
          // If email fails, try with username
          const db = getDatabase();
          const usersRef = ref(db, 'users');
          const snapshot = await get(usersRef);
          if (snapshot.exists()) {
            const users = snapshot.val();
            let foundUser = null;
            for (const uid in users) {
              if (users[uid].username === email) {
                foundUser = users[uid];
                break;
              }
            }
            if (foundUser) {
              await signInWithEmailAndPassword(auth, foundUser.email, password);
              await AsyncStorage.setItem('userLoggedIn', 'true');
            } else {
              throw new Error('Invalid credentials');
            }
          } else {
            throw new Error('Invalid credentials');
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const db = getDatabase();
        const userRef = ref(db, 'users/' + user.uid);
        await set(userRef, {
          email: user.email,
          username: username,
          name: name,
          contact: contact,
          gender: gender,
          faceUri: null,
          isAdmin: isAdmin,
        });
        // Also create a user profile node that Settings/TaskContext expects
        const userProfileRef = ref(db, `userProfiles/${user.uid}`);
        await set(userProfileRef, {
          name: name,
          contact: contact,
          email: user.email || '',
          gender: gender,
          faceUri: null,
        });
        Alert.alert('Success', 'Account created successfully!');
        setIsLogin(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };



  if (user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "765061059751-k8qshk9jqe1uidts2a1dak6oihhv3kcv.apps.googleusercontent.com",
    iosClientId: "765061059751-prs4p8flrijr8h332utjib0u7ehf198e.apps.googleusercontent.com",
    clientId: "765061059751-k8qshk9jqe1uidts2a1dak6oihhv3kcv.apps.googleusercontent.com"
  });

  const handleGoogleSignIn = async () => {
    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Sign up to continue</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.termsContainer}>
          <TouchableOpacity style={styles.checkbox} onPress={() => setTermsAccepted(!termsAccepted)}>
            {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.link} onPress={() => setShowTermsModal(true)}>
              Terms and Conditions
            </Text>
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, !termsAccepted && styles.buttonDisabled]} 
          onPress={handleAuth}
          disabled={loading || !termsAccepted}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>or sign up with</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text style={styles.link} onPress={() => setIsLogin(true)}>
              Login
            </Text>
          </Text>
        </View>
      </View>

      <TermsAndConditionsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  form: {
    flex: 1,
  },

  // Text styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  label: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  
  // Input styles
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },

  // Terms and checkbox styles
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#9ACD32',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#9ACD32',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  link: {
    color: '#9ACD32',
    textDecorationLine: 'underline',
  },

  // Button styles
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#9ACD32',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Divider styles
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 16,
    color: '#666666',
    fontSize: 14,
  },

  // Social login styles
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },

  // Footer styles
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#f5f5f5',
  },
  modalAcceptButton: {
    backgroundColor: '#9ACD32',
  },
  modalButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  modalAcceptButtonText: {
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#9ACD32',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#9ACD32',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  link: {
    color: '#9ACD32',
    textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#9ACD32',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 16,
    color: '#666666',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
});

const TermsAndConditionsModal = ({ visible, onClose, onAccept }: { visible: boolean; onClose: () => void; onAccept: () => void }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Terms and Conditions</Text>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.modalText}>
              Welcome to PD Mobile App. By using our service, you agree to these terms:

              1. User Data
              - We collect and store your email and authentication data
              - Your data is protected and only used for app functionality
              
              2. App Usage
              - The app is for authorized personnel only
              - You are responsible for maintaining your account security
              
              3. Privacy
              - We protect your personal information
              - Data is stored securely in our database
              
              4. Updates
              - Terms may be updated periodically
              - Users will be notified of significant changes
            </Text>
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalAcceptButton]} 
              onPress={onAccept}
            >
              <Text style={[styles.modalButtonText, styles.modalAcceptButtonText]}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Login;