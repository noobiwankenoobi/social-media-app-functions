const functions = require('firebase-functions');

// Express //
const express = require('express');
const app = express();
// Firebase Auth //
const FBAuth = require('./util/fbAuth')
// Import handlers
const { getAllShouts, postOneShout } = require('./handlers/shouts');
const { signup, login, uploadImage } = require('./handlers/users');

////////////////////
// SHOUTS ROUTES //
//////////////////
app.get('/shouts', getAllShouts);
app.post('/shout', FBAuth, postOneShout);

///////////////////
// USERS ROUTES //
/////////////////
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage)

//////////////
// Exports //
////////////
exports.api = functions.https.onRequest(app);
