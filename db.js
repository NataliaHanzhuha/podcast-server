const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const creds = require('./podcast-therapy-api.json');

// Initialize Firebase
const authApp = initializeApp({
    credential: cert(creds)
  });
  
const db = getFirestore(authApp);

const getBooks = async() => {
  return await db.collection('books').get();
}

const setBook = (id) => {
  return db.collection("books").doc(id);
}

const getVideos = async () => {
 return await db.collection('videos').get()
}

const setVideo = (id) => {
  return db.collection("videos").doc(id);
}

module.exports = {
  db,
  getBooks,
  setBook,
  getVideos,
  setVideo
};