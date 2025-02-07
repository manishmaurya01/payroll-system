import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDn6H5TdEwf_ZyqqGIM1pyz8xAsa6-xbzY",
    authDomain: "payroll-d0ea9.firebaseapp.com",
    projectId: "payroll-d0ea9",
    storageBucket: "payroll-d0ea9.firebasestorage.app",
    messagingSenderId: "356283569066",
    appId: "1:356283569066:web:0e8edf90279516500291d3",
    measurementId: "G-ZM0ZKB56V8"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
