const bcrypt = require('bcryptjs');
const { getCollection, collections } = require('./firebase-models');
const { admin } = require('../config/firebase.config');

module.exports = async function() {
  try {
    const usersCollection = getCollection(collections.USERS);
    const roomsCollection = getCollection(collections.ROOMS);
    
    // Check if users exist
    const usersSnapshot = await usersCollection.limit(1).get();
    
    if (usersSnapshot.empty) {
      console.log("Creating initial data...");
      
      // Create initial users
      await usersCollection.add({
        username: "admin",
        email: "admin@ostfalia.de",
        password: bcrypt.hashSync("admin123", 8),
        role: "admin",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      await usersCollection.add({
        username: "teacher",
        email: "teacher@ostfalia.de",
        password: bcrypt.hashSync("teacher123", 8),
        role: "teacher",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      await usersCollection.add({
        username: "student",
        email: "student@ostfalia.de",
        password: bcrypt.hashSync("student123", 8),
        role: "student",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Create additional academic rooms
      await roomsCollection.add({
        name: "Lecture Hall A101",
        building: "Main Campus",
        floor: 1,
        capacity: 120,
        type: "lecture",
        hasComputers: false,
        hasProjector: true,
        description: "Large lecture hall with stadium seating and acoustic design",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Seminar Room B202",
        building: "Main Campus",
        floor: 2,
        capacity: 40,
        type: "lecture",
        hasComputers: false,
        hasProjector: true,
        description: "Medium-sized seminar room with modular tables",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Computer Lab C103",
        building: "Tech Building",
        floor: 1,
        capacity: 30,
        type: "lab",
        hasComputers: true,
        hasProjector: true,
        description: "Computer lab with high-performance workstations for programming courses",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Electronics Lab D105",
        building: "Engineering Building",
        floor: 1,
        capacity: 24,
        type: "lab",
        hasComputers: true,
        hasProjector: true,
        description: "Specialized lab for electronics experiments with test equipment",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Physics Lab P201",
        building: "Science Building",
        floor: 2,
        capacity: 28,
        type: "lab",
        hasComputers: true,
        hasProjector: true,
        description: "Physics laboratory with experiment stations and safety equipment",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Conference Room E301",
        building: "Administration Building",
        floor: 3,
        capacity: 20,
        type: "meeting",
        hasComputers: true,
        hasProjector: true,
        description: "Conference room with video conferencing equipment and whiteboard wall",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Workshop F102",
        building: "Technical Arts Building",
        floor: 1,
        capacity: 25,
        type: "lab",
        hasComputers: false,
        hasProjector: true,
        description: "Technical workshop with tools and equipment for practical projects",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Study Space G201",
        building: "Library Building",
        floor: 2,
        capacity: 30,
        type: "meeting",
        hasComputers: false,
        hasProjector: false,
        description: "Quiet study area with individual desks and good lighting",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Media Room H104",
        building: "Media Center",
        floor: 1,
        capacity: 15,
        type: "lab",
        hasComputers: true,
        hasProjector: true,
        description: "Media production room with audio/video editing workstations",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Language Lab L205",
        building: "Humanities Building",
        floor: 2,
        capacity: 24,
        type: "lab",
        hasComputers: true,
        hasProjector: true,
        description: "Language learning lab with audio equipment and language software",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Design Studio D301",
        building: "Arts Building",
        floor: 3,
        capacity: 22,
        type: "lab",
        hasComputers: true,
        hasProjector: true,
        description: "Creative design studio with drawing tables and design software",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Chemistry Lab C201",
        building: "Science Building",
        floor: 2,
        capacity: 24,
        type: "lab",
        hasComputers: true,
        hasProjector: true,
        description: "Chemistry laboratory with fume hoods and safety stations",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Group Room M101",
        building: "Student Center",
        floor: 1,
        capacity: 10,
        type: "meeting",
        hasComputers: false,
        hasProjector: true,
        description: "Small meeting room for student group work and discussions",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Auditorium A001",
        building: "Central Building",
        floor: 0,
        capacity: 300,
        type: "lecture",
        hasComputers: true,
        hasProjector: true,
        description: "Large auditorium for major lectures and university events",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await roomsCollection.add({
        name: "Robotics Lab R103",
        building: "Engineering Building",
        floor: 1,
        capacity: 20,
        type: "lab",
        hasComputers: true,
        hasProjector: true,
        description: "Specialized lab for robotics programming and hardware testing",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log("Initial data created successfully.");
    } else {
      console.log("Initial data already exists.");
    }
  } catch (error) {
    console.error("Error creating initial data:", error);
    throw error;
  }
};