const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { getCollection, collections } = require('../utils/firebase-models');

// Users collection
const usersCollection = getCollection(collections.USERS);

const verifyToken = (req, res, next) => {
  try {
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    
    let token = req.headers["x-access-token"] || req.headers["authorization"];
    console.log("Raw token:", token);
    
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
      console.log("Extracted token from Bearer:", token);
    }

    if (!token) {
      console.log("No token found in request");
      return res.status(403).send({
        message: "No token provided!"
      });
    }

    console.log("Verifying token with secret:", config.secret);
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).send({
          message: "Unauthorized!",
          error: err.message
        });
      }
      console.log("Token verified successfully, decoded ID:", decoded.id);
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.error("Error in verifyToken:", error);
    return res.status(500).send({
      message: "Error verifying token!",
      error: error.message
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    console.log("Checking if user is admin, userId:", req.userId);
    const userDoc = await usersCollection.doc(req.userId).get();
    
    if (!userDoc.exists) {
      console.log("User not found:", req.userId);
      return res.status(404).send({
        message: "User not found!"
      });
    }
    
    const userData = userDoc.data();
    console.log("User role:", userData.role);
    
    if (userData.role === "admin") {
      next();
      return;
    }

    console.log("User is not admin");
    res.status(403).send({
      message: "Admin role required!"
    });
  } catch (error) {
    console.error("Error checking user role:", error);
    res.status(500).send({
      message: "Error checking user role!"
    });
  }
};

const isTeacher = async (req, res, next) => {
  try {
    console.log("Checking if user is teacher, userId:", req.userId);
    const userDoc = await usersCollection.doc(req.userId).get();
    
    if (!userDoc.exists) {
      console.log("User not found:", req.userId);
      return res.status(404).send({
        message: "User not found!"
      });
    }
    
    const userData = userDoc.data();
    console.log("User role:", userData.role);
    
    if (userData.role === "teacher" || userData.role === "admin") {
      next();
      return;
    }

    console.log("User is not teacher or admin");
    res.status(403).send({
      message: "Teacher role required!"
    });
  } catch (error) {
    console.error("Error checking user role:", error);
    res.status(500).send({
      message: "Error checking user role!"
    });
  }
};

const authJwt = {
  verifyToken,
  isAdmin,
  isTeacher
};

module.exports = authJwt;