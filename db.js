const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const creds = require('./podcast-therapy-api.json');

// Initialize Firebase
const authApp = initializeApp({
    credential: cert(creds)
  });
  
const db = getFirestore(authApp);
module.exports = db;