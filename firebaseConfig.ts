import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLgpyBtIyUi-ybVMl05B0zakCUlVqPCjc",
  authDomain: "lulan-web-app-dashboard.firebaseapp.com",
  projectId: "lulan-web-app-dashboard",
  storageBucket: "lulan-web-app-dashboard.firebasestorage.app",
  messagingSenderId: "760333405255",
  appId: "1:760333405255:web:fce411c4a36d256807f562",
  measurementId: "G-H8GKN21413",
  databaseURL: "https://lulan-web-app-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize and export Realtime Database instance
export const db = getDatabase(app);
