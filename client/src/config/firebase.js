import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration (Free tier)
const firebaseConfig = {
  apiKey: "AIzaSyBvmYRwxW8sN6Q7jLHKx5Hy_example",
  authDomain: "foodbridge-tracking.firebaseapp.com",
  databaseURL: "https://foodbridge-tracking-default-rtdb.firebaseio.com",
  projectId: "foodbridge-tracking",
  storageBucket: "foodbridge-tracking.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:exampleappid"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Realtime Database instance
export const database = getDatabase(app);

export default app;
