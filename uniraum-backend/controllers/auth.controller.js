const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const { getCollection, collections } = require('../utils/firebase-models');
const { admin } = require('../config/firebase.config');

// Users collection
const usersCollection = getCollection(collections.USERS);

exports.signup = async (req, res) => {
  try {
    const { username, email, password, role = 'student' } = req.body;

    // Email validation is handled in middleware (verifySignUp.js)

    // Create new user
    const hashedPassword = bcrypt.hashSync(password, 8);
    
    const userRef = await usersCollection.add({
      username,
      email,
      password: hashedPassword,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const userData = {
      id: userRef.id,
      username,
      email,
      role
    };

    res.status(201).send({ 
      message: "User registered successfully!",
      user: userData
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Search for user with username
    const userSnapshot = await usersCollection.where('username', '==', username).get();
    
    if (userSnapshot.empty) {
      return res.status(404).send({ message: "User not found!" });
    }

    // Get user data
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Check if user has Ostfalia email
    if (!userData.email.endsWith('@ostfalia.de')) {
      return res.status(401).send({ 
        message: "This account has been deactivated because it does not have an Ostfalia University email (@ostfalia.de)!" 
      });
    }
    
    // Check password
    const passwordIsValid = bcrypt.compareSync(password, userData.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid password!" });
    }

    // Create token
    const token = jwt.sign({ id: userDoc.id }, config.secret, {
      expiresIn: config.jwtExpiration
    });

    res.status(200).send({
      id: userDoc.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};