const { getCollection, collections } = require('../utils/firebase-models');

const usersCollection = getCollection(collections.USERS);

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Check if email is from Ostfalia University
    const email = req.body.email;
    if (!email.endsWith('@ostfalia.de')) {
      return res.status(400).send({
        message: "Only Ostfalia University emails (@ostfalia.de) are allowed to register!"
      });
    }

    // Check for duplicate username
    const usernameSnapshot = await usersCollection.where('username', '==', req.body.username).get();
    if (!usernameSnapshot.empty) {
      return res.status(400).send({
        message: "Username is already in use!"
      });
    }

    // Check for duplicate email
    const emailSnapshot = await usersCollection.where('email', '==', req.body.email).get();
    if (!emailSnapshot.empty) {
      return res.status(400).send({
        message: "Email is already in use!"
      });
    }

    next();
  } catch (error) {
    res.status(500).send({
      message: "Error checking registration information!"
    });
  }
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail
};

module.exports = verifySignUp;