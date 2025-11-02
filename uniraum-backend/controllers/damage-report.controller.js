const { getCollection, collections } = require('../utils/firebase-models');
const { admin } = require('../config/firebase.config');

// Required collections
const damageReportsCollection = getCollection(collections.DAMAGE_REPORTS);
const roomsCollection = getCollection(collections.ROOMS);
const usersCollection = getCollection(collections.USERS);

// Create new damage report
exports.createDamageReport = async (req, res) => {
  try {
    const { roomId, description, imageUrl } = req.body;
    const userId = req.userId;
    
    if (!roomId || !description) {
      return res.status(400).send({
        message: "Room ID and description are required!"
      });
    }
    
    // Check if room exists
    const roomDoc = await roomsCollection.doc(roomId).get();
    if (!roomDoc.exists) {
      return res.status(404).send({
        message: "Room not found!"
      });
    }
    
    // Create damage report
    const reportRef = await damageReportsCollection.add({
      roomId,
      userId,
      description,
      imageUrl: imageUrl || null,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const report = {
      id: reportRef.id,
      roomId,
      userId,
      description,
      imageUrl,
      status: 'pending'
    };
    
    res.status(201).send({
      message: "Damage report created successfully!",
      report
    });
  } catch (error) {
    console.error("Error creating damage report:", error);
    res.status(500).send({
      message: error.message || "Error creating damage report!"
    });
  }
};

// Get all damage reports (admin only)
exports.getAllDamageReports = async (req, res) => {
  try {
    const reportsSnapshot = await damageReportsCollection
      .orderBy('createdAt', 'desc')
      .get();
    
    const reports = [];
    const reportPromises = [];
    
    reportsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Get room and user info for each report
      const roomPromise = roomsCollection.doc(data.roomId).get();
      const userPromise = usersCollection.doc(data.userId).get();
      
      const combinedPromise = Promise.all([roomPromise, userPromise])
        .then(([roomDoc, userDoc]) => {
          const roomData = roomDoc.exists ? roomDoc.data() : {};
          const userData = userDoc.exists ? userDoc.data() : {};
          
          reports.push({
            id: doc.id,
            roomId: data.roomId,
            roomName: roomData.name || 'Unknown Room',
            building: roomData.building || '',
            userId: data.userId,
            userName: userData.username || userData.name || 'Unknown User',
            userEmail: userData.email || '',
            description: data.description,
            imageUrl: data.imageUrl,
            status: data.status,
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
          });
        });
      
      reportPromises.push(combinedPromise);
    });
    
    await Promise.all(reportPromises);
    
    // Sort by createdAt descending
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).send(reports);
  } catch (error) {
    console.error("Error getting damage reports:", error);
    res.status(500).send({
      message: error.message || "Error retrieving damage reports!"
    });
  }
};

// Update damage report status (admin only)
exports.updateDamageReportStatus = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['pending', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).send({
        message: "Valid status is required (pending, resolved, rejected)!"
      });
    }
    
    // Check if report exists
    const reportDoc = await damageReportsCollection.doc(reportId).get();
    if (!reportDoc.exists) {
      return res.status(404).send({
        message: "Damage report not found!"
      });
    }
    
    // Update status
    await damageReportsCollection.doc(reportId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).send({
      message: "Damage report status updated successfully!"
    });
  } catch (error) {
    console.error("Error updating damage report:", error);
    res.status(500).send({
      message: error.message || "Error updating damage report!"
    });
  }
};

// Delete damage report (admin only)
exports.deleteDamageReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    
    // Check if report exists
    const reportDoc = await damageReportsCollection.doc(reportId).get();
    if (!reportDoc.exists) {
      return res.status(404).send({
        message: "Damage report not found!"
      });
    }
    
    // Delete report
    await damageReportsCollection.doc(reportId).delete();
    
    res.status(200).send({
      message: "Damage report deleted successfully!"
    });
  } catch (error) {
    console.error("Error deleting damage report:", error);
    res.status(500).send({
      message: error.message || "Error deleting damage report!"
    });
  }
};