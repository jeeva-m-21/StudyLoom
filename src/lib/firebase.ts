// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCL_YWNosr32asihwKKZL5DfCFGEl8Ny1g',
  authDomain: 'studysync-953e4.firebaseapp.com',
  projectId: 'studysync-953e4',
  storageBucket: 'studysync-953e4.firebasestorage.app',
  messagingSenderId: '970793601393',
  appId: '1:970793601393:web:c1abb66908fcd50cf74ed0',
  measurementId: 'G-VCYM0SDYV2'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
