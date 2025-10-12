import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  id: string;
  priority: 'NORMAL' | 'URGENT';
  source: string;
  destination: string;
  items: string[];
  requester: string;
  timestamp: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'timestamp'>) => void;
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

  const addTask = (newTask: Omit<Task, 'id' | 'timestamp'>) => {
    const task: Task = {
      ...newTask,
      id: `MED-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
    };
    setTasks((prev) => [...prev, task]);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask }}>
      {children}
    </TaskContext.Provider>
  );
};
