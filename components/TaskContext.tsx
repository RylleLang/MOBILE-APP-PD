import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';
import { auth } from '../firebaseConfig';

export interface Task {
  id: string;
  priority: 'NORMAL' | 'URGENT';
  source: string;
  destination: string;
  items: string[];
  requester: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  contact: string;
  email: string;
  gender: string;
  faceUri?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'timestamp'>) => void;
  isFaceAuthenticated: boolean;
  setIsFaceAuthenticated: (authenticated: boolean) => void;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  savedFaces: any[];
  setSavedFaces: (faces: any[]) => void;
  updateFace: (index: number, updatedFace: any) => void;
  deleteFace: (index: number) => void;
  userProfile: { name: string; contact: string; email: string; gender: string; faceUri?: string };
  updateUserProfile: (profile: { name: string; contact: string; email: string; gender: string; faceUri?: string }) => Promise<void>;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (index: number, updatedUser: User) => void;
  deleteUser: (index: number) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'MED-20015',
      priority: 'NORMAL',
      source: 'Storage Room',
      destination: 'Room A1',
      items: ['Gloves'],
      requester: 'Jessie',
      timestamp: '10/11/2025, 8:00:28 PM',
    },
    {
      id: 'MED-20016',
      priority: 'URGENT',
      source: 'Pharmacy',
      destination: 'ICU',
      items: ['Morphine 10mg', 'IV Fluids'],
      requester: 'Alice',
      timestamp: '10/11/2025, 8:15:45 PM',
    },
  ]);

  const [isFaceAuthenticated, setIsFaceAuthenticated] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedFaces, setSavedFaces] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<{ name: string; contact: string; email: string; gender: string; faceUri?: string }>({ name: '', contact: '', email: '', gender: '' });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users/');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList: User[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setUsers(userList);
      } else {
        setUsers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user profile from Firebase when user is authenticated
  useEffect(() => {
    if (auth.currentUser) {
      setIsLoadingProfile(true);
      const db = getDatabase();
      const userProfileRef = ref(db, `userProfiles/${auth.currentUser.uid}`);
      const unsubscribe = onValue(userProfileRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserProfile(data);
        }
        setIsLoadingProfile(false);
      });

      return () => unsubscribe();
    } else {
      setUserProfile({ name: '', contact: '', email: '', gender: '' });
      setIsLoadingProfile(false);
    }
  }, [auth.currentUser]);

  const addTask = (newTask: Omit<Task, 'id' | 'timestamp'>) => {
    const task: Task = {
      ...newTask,
      id: `MED-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
    };
    setTasks((prev) => [...prev, task]);
  };

  const updateFace = (index: number, updatedFace: any) => {
    setSavedFaces((prev) => prev.map((face, i) => (i === index ? updatedFace : face)));
  };

  const deleteFace = (index: number) => {
    setSavedFaces((prev) => prev.filter((_, i) => i !== index));
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    const user: User = {
      ...newUser,
      id: `USER-${Date.now()}`,
    };
    setUsers((prev) => [...prev, user]);
  };

  const updateUser = (index: number, updatedUser: User) => {
    setUsers((prev) => prev.map((user, i) => (i === index ? updatedUser : user)));
  };

  const deleteUser = (index: number) => {
    setUsers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateUserProfile = async (profile: { name: string; contact: string; email: string; gender: string; faceUri?: string }) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      console.log('Updating profile:', profile);
      const db = getDatabase();
      const userProfileRef = ref(db, `userProfiles/${auth.currentUser.uid}`);
      await set(userProfileRef, profile);
      setUserProfile(profile);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error; // Re-throw so caller can handle
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      isFaceAuthenticated,
      setIsFaceAuthenticated,
      isVoiceEnabled,
      setIsVoiceEnabled,
      isDarkMode,
      setIsDarkMode,
      savedFaces,
      setSavedFaces,
      updateFace,
      deleteFace,
      userProfile,
      updateUserProfile,
      users,
      addUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </TaskContext.Provider>
  );
};
