const bcrypt = require('bcryptjs');
const { getCollection, collections } = require('../utils/firebase-models');
const { admin } = require('../config/firebase.config');

// Users collection
const usersCollection = getCollection(collections.USERS);

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userDoc = await usersCollection.doc(req.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).send({
        message: "User not found!"
      });
    }
    
    const userData = userDoc.data();
    delete userData.password; // Remove password from return data
    
    res.status(200).send({
      id: userDoc.id,
      ...userData
    });
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving user information!"
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const updateData = {};
    
    if (username) {
      // Check for duplicate username
      const usernameSnapshot = await usersCollection
        .where('username', '==', username)
        .get();
      
      let isDuplicate = false;
      usernameSnapshot.forEach(doc => {
        if (doc.id !== req.userId) {
          isDuplicate = true;
        }
      });
      
      if (isDuplicate) {
        return res.status(400).send({
          message: "This username is already in use!"
        });
      }
      
      updateData.username = username;
    }
    
    if (email) {
      // Check for Ostfalia University email
      if (!email.endsWith('@ostfalia.de')) {
        return res.status(400).send({
          message: "Only Ostfalia University emails (@ostfalia.de) are allowed!"
        });
      }
      
      // Check for duplicate email
      const emailSnapshot = await usersCollection
        .where('email', '==', email)
        .get();
      
      let isDuplicate = false;
      emailSnapshot.forEach(doc => {
        if (doc.id !== req.userId) {
          isDuplicate = true;
        }
      });
      
      if (isDuplicate) {
        return res.status(400).send({
          message: "This email is already in use!"
        });
      }
      
      updateData.email = email;
    }
    
    if (password) {
      updateData.password = bcrypt.hashSync(password, 8);
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({
        message: "No information provided for update!"
      });
    }
    
    // Add update timestamp
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    // Update user info
    await usersCollection.doc(req.userId).update(updateData);
    
    res.status(200).send({
      message: "User information updated successfully!"
    });
  } catch (error) {
    res.status(500).send({
      message: "Error updating user information!"
    });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        message: "No file uploaded!"
      });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).send({
        message: "Only image files (JPEG, PNG, GIF) are allowed!"
      });
    }

    // Check file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).send({
        message: "File size must be less than 5MB!"
      });
    }

    // Convert file to base64
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    // Update user profile with profile picture
    await usersCollection.doc(req.userId).update({
      profilePicture: dataUrl,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).send({
      message: "Profile picture uploaded successfully!",
      profilePicture: dataUrl
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).send({
      message: "Error uploading profile picture!"
    });
  }
};

// Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
  try {
    // Remove profile picture from user document
    await usersCollection.doc(req.userId).update({
      profilePicture: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).send({
      message: "Profile picture deleted successfully!"
    });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).send({
      message: "Error deleting profile picture!"
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const usersSnapshot = await usersCollection.get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      delete userData.password; // Remove password from return data
      
      users.push({
        id: doc.id,
        ...userData
      });
    });
    
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error retrieving users!"
    });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const userDoc = await usersCollection.doc(req.params.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).send({
        message: "User not found!"
      });
    }
    
    const userData = userDoc.data();
    delete userData.password; // Remove password from return data
    
    res.status(200).send({
      id: userDoc.id,
      ...userData
    });
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving user information!"
    });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role = 'student' } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).send({
        message: "Username, email and password are required!"
      });
    }
    
    // Check if email is from Ostfalia University
    if (!email.endsWith('@ostfalia.de')) {
      return res.status(400).send({
        message: "Only Ostfalia University emails (@ostfalia.de) are allowed!"
      });
    }
    
    // Check for duplicate username
    const usernameSnapshot = await usersCollection.where('username', '==', username).get();
    if (!usernameSnapshot.empty) {
      return res.status(400).send({
        message: "Username is already in use!"
      });
    }
    
    // Check for duplicate email
    const emailSnapshot = await usersCollection.where('email', '==', email).get();
    if (!emailSnapshot.empty) {
      return res.status(400).send({
        message: "Email is already in use!"
      });
    }
    
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
    
    res.status(201).send({
      message: "User created successfully!",
      user: {
        id: userRef.id,
        username,
        email,
        role
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error creating user!"
    });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, password, role } = req.body;
    
    // Check if user exists
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).send({
        message: "User not found!"
      });
    }
    
    const updateData = {};
    
    if (username) {
      // Check for duplicate username
      const usernameSnapshot = await usersCollection
        .where('username', '==', username)
        .get();
      
      let isDuplicate = false;
      usernameSnapshot.forEach(doc => {
        if (doc.id !== userId) {
          isDuplicate = true;
        }
      });
      
      if (isDuplicate) {
        return res.status(400).send({
          message: "This username is already in use!"
        });
      }
      
      updateData.username = username;
    }
    
    if (email) {
      // Check for Ostfalia University email
      if (!email.endsWith('@ostfalia.de')) {
        return res.status(400).send({
          message: "Only Ostfalia University emails (@ostfalia.de) are allowed!"
        });
      }
      
      // Check for duplicate email
      const emailSnapshot = await usersCollection
        .where('email', '==', email)
        .get();
      
      let isDuplicate = false;
      emailSnapshot.forEach(doc => {
        if (doc.id !== userId) {
          isDuplicate = true;
        }
      });
      
      if (isDuplicate) {
        return res.status(400).send({
          message: "This email is already in use!"
        });
      }
      
      updateData.email = email;
    }
    
    if (password) {
      updateData.password = bcrypt.hashSync(password, 8);
    }
    
    if (role) {
      if (!['student', 'teacher', 'admin'].includes(role)) {
        return res.status(400).send({
          message: "Invalid role!"
        });
      }
      
      updateData.role = role;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({
        message: "No information provided for update!"
      });
    }
    
    // Add update timestamp
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    // Update user
    await usersCollection.doc(userId).update(updateData);
    
    res.status(200).send({
      message: "User updated successfully!"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error updating user!"
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).send({
        message: "User not found!"
      });
    }
    
    // Delete user
    await usersCollection.doc(userId).delete();
    
    res.status(200).send({
      message: "User deleted successfully!"
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error deleting user!"
    });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).send({
        message: "Invalid role!"
      });
    }
    
    const userDoc = await usersCollection.doc(req.params.id).get();
    
    if (!userDoc.exists) {
      return res.status(404).send({
        message: "User not found!"
      });
    }
    
    // Update user role
    await usersCollection.doc(req.params.id).update({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).send({
      message: "User role updated successfully!"
    });
  } catch (error) {
    res.status(500).send({
      message: "Error updating user role!"
    });
  }
};