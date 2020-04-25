const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

const firebaseConfig = {
  apiKey: "AIzaSyDC_esLx9natikWK59l6BRHy7sZrrhw1L8",
  authDomain: "social-media-app-v01.firebaseapp.com",
  databaseURL: "https://social-media-app-v01.firebaseio.com",
  projectId: "social-media-app-v01",
  storageBucket: "social-media-app-v01.appspot.com",
  messagingSenderId: "1063384140539",
  appId: "1:1063384140539:web:1382d9ca6abd37de5efe5e",
  measurementId: "G-ZRD24CNTWZ"
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// GET Shouts Route
// first parameter is the route, second is the handler
app.get('/shouts', (req, res) => {
  db
    .collection('shouts')
    .get()
    .then((data) => {
      let shouts = [];
      data.forEach((doc) => {
        shouts.push({
          shoutId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount
        });
      })
      return res.json(shouts);
    })
    .catch((err) => console.error(err));
})

// POST Shout Route
app.post('/shout', (req, res) => {
  const newShout = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };
  // put in db
  db
    .collection('shouts')
    .orderBy('createdAt', 'desc')
    .add(newShout)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    })
});

// Signup Route (POST)
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  // Validate signup data and post to db
  let token, userId;
  db.doc(`/users/${newUser.handle}`).get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials)
    })
    .then(() => {
      return res.status(201).json({ token })
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already in use' })
      } else {
        return res.status(500).json({ error: err.code });
      }
    })
});

exports.api = functions.https.onRequest(app);
