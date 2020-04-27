const functions = require('firebase-functions');



const express = require('express');
const app = express();

const { getAllShouts, postOneShout } = require('./handlers/shouts');

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



////////////////////
// SHOUTS ROUTES //
//////////////////
// GET All Shouts Route //
app.get('/shouts', getAllShouts);
// POST One Shout Route //
app.post('/shout', FBAuth, postOneShout);



// /////////////////////
// FBAuth middleware ////////////////////
const FBAuth = (req, res, next) => {
  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found')
    return res.status(403).json({ error: 'Unauthorized' })
  }

  admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      console.log('decodedToken is ', decodedToken);
      return db.collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch((err) => {
      console.error('Error while verifying token ', err);
      return res.status(403).json(err);
    })
}


// ///////////
// HELPERS ////////
// Checks if email is valid using regular expression
const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
}

// Checks if a field is empty
const isEmpty = (string) => {
  if (string.trim() === '') return true;
  else return false;
}

// ///////////////////////
// Signup Route (POST) ////////////
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  // Validation on front end
  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = 'Must not be empty'
  } else if (!isEmail(user.email)) {
    errors.email = 'Must be a valid email address'
  }

  if (isEmpty(newUser.password)) errors.password = 'Must not be empty';
  if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
  if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

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


// //////////////////////
// Login Route (POST) ////////////
app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  let errors = {};

  if (isEmpty(user.email)) errors.email = 'Must not be empty';
  if (isEmpty(user.password)) errors.password = 'Must not be empty';

  if (Object.keys(errors).length > 0) return res.status(400).json(errors)

  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return res.status(403).json({ general: 'Wrong credentials, please try again' });
      } else return res.status(500).json({ error: err.code });
    })

})

//////////////
// Exports //////////
exports.api = functions.https.onRequest(app);
