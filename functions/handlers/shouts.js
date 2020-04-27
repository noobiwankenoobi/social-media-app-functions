const { db } = require('../util/admin')

// GET All Shouts
exports.getAllShouts = (req, res) => {
  db
    .collection('shouts')
    , orderBy('createdAt', 'desc')
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
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
}

// POST One Shout
exports.postOneShout = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'Body must not be empty' });
  }

  const newShout = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString()
  };
  // put in db
  db.collection('shouts')
    // .orderBy('createdAt', 'desc')
    .add(newShout)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    })
}
