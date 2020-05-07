const functions = require("firebase-functions");

// Express //
const express = require("express");
const app = express();
// Firebase Auth //
const FBAuth = require("./util/fbAuth");
// Import handlers
const {
  getAllShouts,
  postOneShout,
  getShout,
  commentOnShout,
} = require("./handlers/shouts");

const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

////////////////////
// SHOUTS ROUTES //
//////////////////
app.get("/shouts", getAllShouts);
app.post("/shout", FBAuth, postOneShout);
app.get("/shout/:shoutId", getShout);
// TODO:
// delete shout
// like shout
// unlike shout
app.post("/shout/:shoutId/comment", FBAuth, commentOnShout);

///////////////////
// USERS ROUTES //
/////////////////
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

//////////////
// Exports //
////////////
exports.api = functions.https.onRequest(app);
