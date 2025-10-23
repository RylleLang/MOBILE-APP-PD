import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useTaskContext } from '../components/TaskContext';
import { getDatabase, ref, set, get } from 'firebase/database';

type LoginProps = {
  navigation: any;
};

function Login({ navigation }: LoginProps) {
  const { isDarkMode } = useTaskContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCreationPassword, setAdminCreationPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!isLogin && isAdmin && adminCreationPassword !== 'admin') {
      Alert.alert('Error', 'Invalid admin creation password');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        await AsyncStorage.setItem('userLoggedIn', 'true');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const db = getDatabase();
        const userRef = ref(db, 'users/' + user.uid);
        await set(userRef, {
          email: user.email,
          name: '',
          contact: '',
          gender: '',
          faceUri: null,
          isAdmin: isAdmin,
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

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>{isLogin ? 'Login' : 'Create Account'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {!isLogin && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsAdmin(!isAdmin)}>
            <View style={[styles.checkbox, isAdmin && styles.checkboxChecked]}>
              {isAdmin && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxText, isDarkMode && styles.darkText]}>Create as Admin Account</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TextInput
              style={styles.input}
              placeholder="Admin Creation Password"
              value={adminCreationPassword}
              onChangeText={setAdminCreationPassword}
              secureTextEntry
            />
          )}
        </>
      )}
      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Create Account'}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin ? "Don't have an account? Create one" : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#121212', // Dark background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 30,
  },
  darkText: {
    color: '#FFFFFF', // White text for dark mode
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchText: {
    color: '#1976D2',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  adminButton: {
    marginTop: 10,
    padding: 10,
  },
  adminButtonText: {
    color: '#1976D2',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1976D2',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#1976D2',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 16,
    color: '#424242',
  },
});

export default Login;
