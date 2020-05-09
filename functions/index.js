const functions = require("firebase-functions");

// Express //
const express = require("express");
const app = express();
// Firebase Auth //
const FBAuth = require("./util/fbAuth");

const { db } = require("./util/admin");

/////////////////////
// SHOUT HANDLERS //
//////////////////////////////
const {
  getAllShouts,
  postOneShout,
  getShout,
  commentOnShout,
  likeShout,
  unlikeShout,
  deleteShout,
} = require("./handlers/shouts");

////////////////////
// USER HANDLERS //
/////////////////////////////
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
} = require("./handlers/users");

////////////////////
// SHOUTS ROUTES //
////////////////////////////////////
app.get("/shouts", getAllShouts);
app.post("/shout", FBAuth, postOneShout);
app.get("/shout/:shoutId", getShout);
app.delete("/shout/:shoutId", FBAuth, deleteShout);
app.get("/shout/:shoutId/like", FBAuth, likeShout);
app.get("/shout/:shoutId/unlike", FBAuth, unlikeShout);
app.post("/shout/:shoutId/comment", FBAuth, commentOnShout);

///////////////////
// USERS ROUTES //
/////////////////
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

//////////////
// Exports //
////////////
exports.api = functions.https.onRequest(app);

//////////////////////////////////
// NOTIFICATION CREATE on Like //
////////////////////////////////////////////////////
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
/////////////////////////////////////////////

//////////////////////////////////
// DELETE NOTIFICATION on Like //
////////////////////////////////////////////////////
exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete((snapshot) => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
/////////////////////////////////////

/////////////////////////////////////
// NOTIFICATION CREATE on Comment //
////////////////////////////////////////////////////
exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate((snapshot) => {
    db.doc(`/shouts/${snapshot.data().shoutId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
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
///////////////////////////////////////////////
