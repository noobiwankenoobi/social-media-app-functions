const functions = require("firebase-functions");

// Express //
const express = require("express");
const app = express();
// Firebase Auth //
const FBAuth = require("./util/fbAuth");

const { db } = require("./util/admin");

// Import handlers
const {
  getAllShouts,
  postOneShout,
  getShout,
  commentOnShout,
  likeShout,
  unlikeShout,
  deleteShout,
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
// Delete shout
app.delete("/shout/:shoutId", FBAuth, deleteShout);
// Like/unlike shout
app.get("/shout/:shoutId/like", FBAuth, likeShout);
app.get("/shout/:shoutId/unlike", FBAuth, unlikeShout);
// Comment on shout
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

exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate((snapshot) => {
    db.doc(`/shouts/${snapshot.data().shoutId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: "false",
            shoutId: doc.id,
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
