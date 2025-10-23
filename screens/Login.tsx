import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, Modal, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, User, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useTaskContext } from '../components/TaskContext';
import { getDatabase, ref, set, get } from 'firebase/database';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';

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

function Login() {
  const navigation = useNavigation<any>();
  const { isDarkMode } = useTaskContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [gender, setGender] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  // signupStep controls the two-step sign up flow: 'credentials' -> 'profile'
  const [signupStep, setSignupStep] = useState<'credentials' | 'profile'>('credentials');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  // inline validation messages
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // No need to navigate here as App.tsx handles navigation based on auth state
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

  const isEmailLike = (value: string) => value.includes('@') && value.includes('.');

  const handleAuth = async () => {
    // Login flow
    if (isLogin) {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in email/username and password');
        return;
      }
      setLoading(true);
      try {
        // Try email sign-in first
        try {
          await signInWithEmailAndPassword(auth, email, password);
          await AsyncStorage.setItem('userLoggedIn', 'true');
        } catch (emailError) {
          // Try username login
          const db = getDatabase();
          const usersRef = ref(db, 'users');
          const snapshot = await get(usersRef);
          if (snapshot.exists()) {
            const users = snapshot.val();
            let foundUser: any = null;
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
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Signup flow: two steps
    if (!isLogin && signupStep === 'credentials') {
      // Validate credential step and advance to profile step
      if (!email || !password || !confirmPassword) {
        setEmailError('Please fill in email and both password fields');
        return;
      }
      // Require a proper email in credentials step (no username allowed here)
      if (!isEmailLike(email)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      // clear email error if validation passed
      setEmailError('');
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (!termsAccepted) {
        Alert.alert('Error', 'Please accept the Terms and Conditions to continue');
        return;
      }
      // Advance to profile info inputs
      setSignupStep('profile');
      return;
    }

    if (!isLogin && signupStep === 'profile') {
      // Finalize signup: validate profile fields and create account
      if (!name || !contact || !gender || !username) {
        setProfileError('Please fill in name, contact, gender, and username');
        return;
      }
      // basic contact validation: digits only, 7-15 chars
      const contactDigits = contact.replace(/\D/g, '');
      if (contactDigits.length < 7 || contactDigits.length > 15) {
        setProfileError('Please enter a valid contact number');
        return;
      }
      setProfileError('');

      setLoading(true);
      try {
        // Uniqueness checks
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
          isAdmin: false,
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
        // Reset to login mode
        setIsLogin(true);
        setSignupStep('credentials');
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setContact('');
        setGender('');
        setUsername('');
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    }
  };



  // Ensure auth session completes on WebBrowser redirect
  WebBrowser.maybeCompleteAuthSession();

  // Build a redirect URI (use proxy in Expo dev)
  const redirectUri = makeRedirectUri({ useProxy: true } as any);
  // log so you can register this URI in Google Cloud Console if needed
  // Example redirect URI for Expo proxy: https://auth.expo.io/@your-username/expo-mobile-app
  console.log('Google redirectUri:', redirectUri);

  const [showRedirectUri, setShowRedirectUri] = useState<boolean>(__DEV__);

  const copyRedirectUri = async () => {
    try {
      // dynamic import so we don't hard-fail if expo-clipboard isn't installed
      const Clipboard = await import('expo-clipboard');
      if (Clipboard && Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(redirectUri);
        Alert.alert('Copied', 'Redirect URI copied to clipboard');
        return;
      }
    } catch (err) {
      // ignore and fallback to manual instruction
    }
    Alert.alert('Copy', 'Could not copy automatically. Please copy the redirect URI manually from the debug panel.');
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '765061059751-k8qshk9jqe1uidts2a1dak6oihhv3kcv.apps.googleusercontent.com',
    iosClientId: '765061059751-prs4p8flrijr8h332utjib0u7ehf198e.apps.googleusercontent.com',
    webClientId: '765061059751-k8qshk9jqe1uidts2a1dak6oihhv3kcv.apps.googleusercontent.com',
    redirectUri,
  });

  useEffect(() => {
    // Handle the response from Google auth and sign in with Firebase
    const handleResponse = async () => {
      if (response?.type === 'success') {
        try {
          const authResponse: any = response.authentication;
          const id_token = authResponse?.idToken ?? (response as any)?.params?.id_token;
          if (id_token) {
            const credential = GoogleAuthProvider.credential(id_token);
            await signInWithCredential(auth, credential);
          } else {
            console.warn('No id_token returned from Google auth response', response);
            Alert.alert('Error', 'Google sign-in failed: no token received');
          }
        } catch (err) {
          console.error('Error signing in with Google credential:', err);
          Alert.alert('Error', 'Failed to sign in with Google');
        }
      } else if (response?.type === 'error') {
        console.warn('Google auth response error', response);
      }
    };
    handleResponse();
  }, [response]);

  if (user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</Text>
              <Text style={styles.subtitle}>{isLogin ? 'Login to continue' : 'Sign up to continue'}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{!isLogin ? 'Email' : 'Email or Username'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType={email.includes('@') ? 'email-address' : 'default'}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder={isLogin ? 'Enter password' : 'Create password'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {!isLogin && signupStep === 'credentials' && (
                <>
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
                </>
              )}

              {!isLogin && signupStep === 'profile' && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Your full name"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Choose a username"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Contact</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Phone or contact number"
                      value={contact}
                      onChangeText={setContact}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={gender}
                        onValueChange={(val) => setGender(val)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Select gender" value="" />
                        <Picker.Item label="Male" value="male" />
                        <Picker.Item label="Female" value="female" />
                        <Picker.Item label="Other" value="other" />
                      </Picker>
                    </View>
                  </View>
                </>
              )}

              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}

              <View style={styles.buttonRow}>
                {!isLogin && signupStep === 'profile' && (
                  <TouchableOpacity
                    style={[styles.secondaryButton, styles.backButton]}
                    onPress={() => setSignupStep('credentials')}
                    disabled={loading}
                  >
                    <Text style={styles.secondaryButtonText}>Back</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, (!isLogin && signupStep === 'credentials' && !termsAccepted) && styles.buttonDisabled, { flex: 1 }]}
                  onPress={handleAuth}
                  disabled={loading || (!isLogin && signupStep === 'credentials' && !termsAccepted)}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>{isLogin ? 'Login' : (signupStep === 'credentials' ? 'Next' : 'Create account')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>{isLogin ? 'or login with' : 'or sign up with'}</Text>
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
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={styles.link} onPress={() => {
                  const next = !isLogin;
                  setIsLogin(next);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setTermsAccepted(false);
                  setSignupStep('credentials');
                  // clear profile fields
                  setName('');
                  setContact('');
                  setGender('');
                  setUsername('');
                }}>
                  {isLogin ? 'Sign up' : 'Login'}
                </Text>
              </Text>
            </View>
            {__DEV__ && (
              <View style={styles.debugPanel}>
                <TouchableOpacity onPress={() => setShowRedirectUri(!showRedirectUri)}>
                  <Text style={styles.debugToggle}>{showRedirectUri ? 'Hide debug' : 'Show debug'}</Text>
                </TouchableOpacity>
                {showRedirectUri && (
                  <View style={styles.debugBox}>
                    <Text selectable style={styles.debugText}>{redirectUri}</Text>
                    <TouchableOpacity style={styles.copyButton} onPress={copyRedirectUri}>
                      <Text style={styles.copyButtonText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      <TermsAndConditionsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
        }}
      />
    </KeyboardAvoidingView>
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
  secondaryButton: {
    height: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  backButton: {
    width: 100,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 8,
  },
  debugPanel: {
    marginTop: 12,
    alignItems: 'center',
  },
  debugToggle: {
    color: '#007bff',
    textDecorationLine: 'underline',
    marginBottom: 6,
  },
  debugBox: {
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 8,
    width: '100%'
  },
  debugText: {
    color: '#333',
    fontSize: 12,
  },
  copyButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
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
  }
});

export default Login;