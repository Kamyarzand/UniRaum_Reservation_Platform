const { getCollection, collections } = require('../utils/firebase-models');
const { admin } = require('../config/firebase.config');

// Required collections
const bookingsCollection = getCollection(collections.BOOKINGS);
const roomsCollection = getCollection(collections.ROOMS);
const usersCollection = getCollection(collections.USERS);

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const { roomId, startTime, endTime, purpose, responsibilityAccepted } = req.body;
    const userId = req.userId;
    
    if (!roomId || !startTime || !endTime) {
      return res.status(400).send({
        message: "Room ID, start time and end time must be specified!"
      });
    }
    
    // Check if user accepted responsibility
    if (!responsibilityAccepted) {
      return res.status(400).send({
        message: "You must accept responsibility for the room condition!"
      });
    }
    
    // Convert date strings to Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    // Validate time values
    if (startDate >= endDate) {
      return res.status(400).send({
        message: "End time must be after start time!"
      });
    }
    
    // Check if user already has a booking at this time
    const userBookingsSnapshot = await bookingsCollection
      .where('userId', '==', userId)
      .where('status', '==', 'confirmed')
      .get();
    
    // Convert to Firestore Timestamps for comparison
    const newStartTimestamp = admin.firestore.Timestamp.fromDate(startDate);
    const newEndTimestamp = admin.firestore.Timestamp.fromDate(endDate);
    
    // Check for time conflicts with existing bookings
    let hasConflict = false;
    userBookingsSnapshot.forEach(doc => {
      const booking = doc.data();
      
      // Check if the new booking overlaps with an existing booking
      if (
        (newStartTimestamp.toMillis() >= booking.startTime.toMillis() && 
         newStartTimestamp.toMillis() < booking.endTime.toMillis()) ||
        (newEndTimestamp.toMillis() > booking.startTime.toMillis() && 
         newEndTimestamp.toMillis() <= booking.endTime.toMillis()) ||
        (newStartTimestamp.toMillis() <= booking.startTime.toMillis() && 
         newEndTimestamp.toMillis() >= booking.endTime.toMillis())
      ) {
        hasConflict = true;
      }
    });
    
    if (hasConflict) {
      return res.status(400).send({
        message: "You already have a booking during this time period. You cannot book multiple rooms at the same time."
      });
    }
    
    // Create booking
    const bookingRef = await bookingsCollection.add({
      roomId,
      userId,
      startTime: admin.firestore.Timestamp.fromDate(startDate),
      endTime: admin.firestore.Timestamp.fromDate(endDate),
      purpose,
      status: 'confirmed',
      responsibilityAccepted: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update room's last user info
    await roomsCollection.doc(roomId).update({
      lastUserId: userId,
      lastUsedAt: admin.firestore.Timestamp.fromDate(endDate),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const booking = {
      id: bookingRef.id,
      roomId,
      userId,
      startTime,
      endTime,
      purpose,
      status: 'confirmed'
    };
    
    res.status(201).send({
      message: "Booking successfully created!",
      booking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).send({
      message: error.message || "Error creating booking!"
    });
  }
};

// Get all bookings for a user - با اطلاعات بیشتر اتاق
exports.getUserBookings = async (req, res) => {
  try {
    console.log("Getting bookings for user:", req.userId);
    
    // Get basic booking info
    const bookingsSnapshot = await bookingsCollection
      .where('userId', '==', req.userId)
      .get();
    
    console.log("Found bookings:", bookingsSnapshot.size);
    
    // Create array for bookings
    const bookings = [];
    const bookingPromises = [];
    
    // Process each booking and fetch room details
    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      const roomId = data.roomId;
      
      // Convert timestamps safely
      const startTime = data.startTime ? data.startTime.toDate().toISOString() : new Date().toISOString();
      const endTime = data.endTime ? data.endTime.toDate().toISOString() : new Date().toISOString();
      
      // Only fetch room info if we have a roomId
      if (roomId) {
        const promise = roomsCollection.doc(roomId).get()
          .then(roomDoc => {
            if (roomDoc.exists) {
              const roomData = roomDoc.data();
              
              bookings.push({
                id: doc.id,
                roomId: roomId,
                roomName: roomData.name || 'Unknown Room',
                building: roomData.building || '',
                floor: roomData.floor || '',
                purpose: data.purpose || "",
                status: data.status || "confirmed",
                startTime: startTime,
                endTime: endTime
              });
            } else {
              // Room not found, still add booking with default room info
              bookings.push({
                id: doc.id,
                roomId: roomId,
                roomName: 'Unknown Room',
                building: '',
                floor: '',
                purpose: data.purpose || "",
                status: data.status || "confirmed",
                startTime: startTime,
                endTime: endTime
              });
            }
          })
          .catch(err => {
            console.error("Error fetching room:", err);
            // Still add booking even if room fetch fails
            bookings.push({
              id: doc.id,
              roomId: roomId,
              roomName: 'Unknown Room',
              building: '',
              floor: '',
              purpose: data.purpose || "",
              status: data.status || "confirmed",
              startTime: startTime,
              endTime: endTime
            });
          });
        
        bookingPromises.push(promise);
      } else {
        // No roomId, just add booking with minimal info
        bookings.push({
          id: doc.id,
          roomId: 'unknown',
          roomName: 'Unknown Room',
          purpose: data.purpose || "",
          status: data.status || "confirmed",
          startTime: startTime,
          endTime: endTime
        });
      }
    });
    
    // Wait for all room fetches to complete
    if (bookingPromises.length > 0) {
      await Promise.all(bookingPromises);
    }
    
    console.log("Sending bookings with room info:", bookings.length);
    res.status(200).send(bookings);
  } catch (error) {
    console.error("Error in getUserBookings:", error);
    res.status(500).send({
      message: error.message || "Error retrieving bookings!"
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.userId;
    
    // Get booking information
    const bookingDoc = await bookingsCollection.doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      return res.status(404).send({
        message: "Booking not found!"
      });
    }
    
    const bookingData = bookingDoc.data();
    
    // Check user's access to booking
    if (bookingData.userId !== userId) {
      // Check if user is admin
      const userDoc = await usersCollection.doc(userId).get();
      const userData = userDoc.data();
      
      if (userData.role !== 'admin') {
        return res.status(403).send({
          message: "You don't have permission to cancel this booking!"
        });
      }
    }
    
    // Cancel booking
    await bookingsCollection.doc(bookingId).update({
      status: 'cancelled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(200).send({
      message: "Booking successfully cancelled!",
      booking: {
        id: bookingId,
        ...bookingData,
        status: 'cancelled'
      }
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).send({
      message: "Error cancelling booking!"
    });
  }
};

// Admin: Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    console.log("Admin getting all bookings");
    
    // Get all bookings
    const bookingsSnapshot = await bookingsCollection.get();
    
    console.log("Found total bookings:", bookingsSnapshot.size);
    
    // Create array for bookings
    const bookings = [];
    const bookingPromises = [];
    
    // Process each booking and fetch room + user details
    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      const roomId = data.roomId;
      const userId = data.userId;
      
      // Convert timestamps safely
      const startTime = data.startTime ? data.startTime.toDate().toISOString() : new Date().toISOString();
      const endTime = data.endTime ? data.endTime.toDate().toISOString() : new Date().toISOString();
      
      // Fetch both room and user info
      const promise = Promise.all([
        roomId ? roomsCollection.doc(roomId).get() : Promise.resolve(null),
        userId ? usersCollection.doc(userId).get() : Promise.resolve(null)
      ]).then(([roomDoc, userDoc]) => {
        let roomData = {};
        let userData = {};
        
        if (roomDoc && roomDoc.exists) {
          roomData = roomDoc.data();
        }
        
        if (userDoc && userDoc.exists) {
          userData = userDoc.data();
        }
        
        bookings.push({
          id: doc.id,
          userId: userId,
          username: userData.username || 'Unknown User',
          roomId: roomId,
          roomName: roomData.name || 'Unknown Room',
          building: roomData.building || '',
          floor: roomData.floor || '',
          purpose: data.purpose || "",
          status: data.status || "confirmed",
          startTime: startTime,
          endTime: endTime,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
        });
      }).catch(err => {
        console.error("Error fetching room/user details:", err);
        // Still add booking even if fetch fails
        bookings.push({
          id: doc.id,
          userId: userId,
          username: 'Unknown User',
          roomId: roomId,
          roomName: 'Unknown Room',
          building: '',
          floor: '',
          purpose: data.purpose || "",
          status: data.status || "confirmed",
          startTime: startTime,
          endTime: endTime,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
        });
      });
      
      bookingPromises.push(promise);
    });
    
    // Wait for all room/user fetches to complete
    await Promise.all(bookingPromises);
    
    // Sort bookings by creation date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log("Sending all bookings with details:", bookings.length);
    res.status(200).send(bookings);
  } catch (error) {
    console.error("Error in getAllBookings:", error);
    res.status(500).send({
      message: error.message || "Error retrieving all bookings!"
    });
  }
};

// Admin: Delete booking permanently
exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    // Get booking information first
    const bookingDoc = await bookingsCollection.doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      return res.status(404).send({
        message: "Booking not found!"
      });
    }
    
    // Delete booking permanently
    await bookingsCollection.doc(bookingId).delete();
    
    res.status(200).send({
      message: "Booking successfully deleted!"
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).send({
      message: "Error deleting booking!"
    });
  }
};

// Admin: Update booking
exports.updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { startTime, endTime, purpose, status } = req.body;
    
    // Get booking information first
    const bookingDoc = await bookingsCollection.doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      return res.status(404).send({
        message: "Booking not found!"
      });
    }
    
    // Prepare update data
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (startTime) {
      updateData.startTime = admin.firestore.Timestamp.fromDate(new Date(startTime));
    }
    
    if (endTime) {
      updateData.endTime = admin.firestore.Timestamp.fromDate(new Date(endTime));
    }
    
    if (purpose) {
      updateData.purpose = purpose;
    }
    
    if (status) {
      updateData.status = status;
    }
    
    // Update booking
    await bookingsCollection.doc(bookingId).update(updateData);
    
    // Get updated booking
    const updatedDoc = await bookingsCollection.doc(bookingId).get();
    const updatedData = updatedDoc.data();
    
    res.status(200).send({
      message: "Booking successfully updated!",
      booking: {
        id: bookingId,
        ...updatedData,
        startTime: updatedData.startTime ? updatedData.startTime.toDate().toISOString() : null,
        endTime: updatedData.endTime ? updatedData.endTime.toDate().toISOString() : null
      }
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).send({
      message: "Error updating booking!"
    });
  }
};