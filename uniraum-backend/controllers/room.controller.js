const { getCollection, collections } = require('../utils/firebase-models');
const { admin } = require('../config/firebase.config');

// Required collections
const roomsCollection = getCollection(collections.ROOMS);
const bookingsCollection = getCollection(collections.BOOKINGS);

// Create a new room (admin only)
exports.createRoom = async (req, res) => {
  try {
    const { name, building, floor, capacity, type, hasComputers = false, hasProjector = false, description } = req.body;
    
    const roomRef = await roomsCollection.add({
      name,
      building,
      floor: parseInt(floor),
      capacity: parseInt(capacity),
      type,
      hasComputers,
      hasProjector,
      description,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const room = {
      id: roomRef.id,
      name,
      building,
      floor,
      capacity,
      type,
      hasComputers,
      hasProjector,
      description
    };

    res.status(201).send({
      message: "Room created successfully!",
      room
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error creating room!"
    });
  }
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const roomsSnapshot = await roomsCollection.get();
    const rooms = [];
    
    roomsSnapshot.forEach(doc => {
      rooms.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).send(rooms);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error retrieving rooms!"
    });
  }
};

// Get a room by ID
exports.getRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;
    const roomDoc = await roomsCollection.doc(roomId).get();
    
    if (!roomDoc.exists) {
      return res.status(404).send({
        message: "Room not found!"
      });
    }
    
    const room = {
      id: roomDoc.id,
      ...roomDoc.data()
    };
    
    res.status(200).send(room);
  } catch (error) {
    res.status(500).send({
      message: "Error retrieving room!"
    });
  }
};

// Get available rooms with filters
exports.getAvailableRooms = async (req, res) => {
  try {
    // Requested time parameters
    const { startTime, endTime, capacity, type, building, hasComputers, hasProjector } = req.query;
    
    if (!startTime || !endTime) {
      return res.status(400).send({
        message: "Start time and end time must be specified!"
      });
    }

    console.log('Requested times:', { startTime, endTime });

    // Convert date strings to Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    console.log('Converted dates:', { startDate, endDate });
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).send({
        message: "Invalid date format. Please use ISO format (YYYY-MM-DDTHH:MM:SS)."
      });
    }
    
    // Build query
    let roomsQuery = roomsCollection;
    
    if (capacity) {
      roomsQuery = roomsQuery.where('capacity', '>=', parseInt(capacity));
    }
    
    if (type) {
      roomsQuery = roomsQuery.where('type', '==', type);
    }
    
    if (building) {
      roomsQuery = roomsQuery.where('building', '==', building);
    }
    
    if (hasComputers === 'true') {
      roomsQuery = roomsQuery.where('hasComputers', '==', true);
    }
    
    if (hasProjector === 'true') {
      roomsQuery = roomsQuery.where('hasProjector', '==', true);
    }
    
    // Get rooms with applied filters
    const roomsSnapshot = await roomsQuery.get();
    const rooms = [];
    
    roomsSnapshot.forEach(doc => {
      rooms.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${rooms.length} rooms matching criteria`);
    
    // Get overlapping bookings
    // Convert dates to Firestore Timestamps for the query
    const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

    console.log('Converted timestamps:', { startTimestamp, endTimestamp });

    const bookingsSnapshot = await bookingsCollection
      .where('status', '==', 'confirmed')
      .get();

    console.log(`Found ${bookingsSnapshot.size} confirmed bookings`);
    
    // Extract IDs of booked rooms for the specified time range
    const bookedRoomIds = [];
    bookingsSnapshot.forEach(doc => {
      const booking = doc.data();
      const bookingStart = booking.startTime.toDate();
      const bookingEnd = booking.endTime.toDate();

      // Check if booking overlaps with requested time
      if (bookingStart < endDate && bookingEnd > startDate) {
        bookedRoomIds.push(booking.roomId);
        console.log(`Room ${booking.roomId} is booked from ${bookingStart} to ${bookingEnd}`);
      }
    });
    
    console.log(`Found ${bookedRoomIds.length} rooms already booked`);
    
    // Filter available rooms
    const availableRooms = rooms.filter(room => !bookedRoomIds.includes(room.id));
    
    console.log(`Returning ${availableRooms.length} available rooms`);
    
    res.status(200).send(availableRooms);
  } catch (error) {
    console.error("Error in getAvailableRooms:", error);
    res.status(500).send({
      message: error.message || "Error retrieving available rooms!"
    });
  }
};

// Get bookings for a specific room
exports.getRoomBookings = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { startDate, endDate } = req.query;
    
    // Convert date strings to Date objects if provided
    let startDateTime = startDate ? new Date(startDate) : null;
    let endDateTime = endDate ? new Date(endDate) : null;
    
    // Check if room exists
    const roomDoc = await roomsCollection.doc(roomId).get();
    
    if (!roomDoc.exists) {
      return res.status(404).send({
        message: "Room not found!"
      });
    }
    
    // Build query for bookings
    let bookingsQuery = bookingsCollection
      .where('roomId', '==', roomId)
      .where('status', '==', 'confirmed');
    
    // If date range specified, filter by date range
    if (startDateTime && endDateTime) {
      const startTimestamp = admin.firestore.Timestamp.fromDate(startDateTime);
      const endTimestamp = admin.firestore.Timestamp.fromDate(endDateTime);
      
      bookingsQuery = bookingsQuery
        .where('startTime', '<=', endTimestamp)
        .where('endTime', '>=', startTimestamp);
    }
    
    const bookingsSnapshot = await bookingsQuery.get();
    const bookings = [];
    
    bookingsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Format dates
      const startTime = data.startTime ? data.startTime.toDate().toISOString() : null;
      const endTime = data.endTime ? data.endTime.toDate().toISOString() : null;
      
      bookings.push({
        id: doc.id,
        startTime,
        endTime,
        purpose: data.purpose || '',
        status: data.status || 'confirmed'
      });
    });
    
    res.status(200).send(bookings);
  } catch (error) {
    console.error("Error retrieving room bookings:", error);
    res.status(500).send({
      message: "Error retrieving room bookings!"
    });
  }
};

// Update a room (admin only)
exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { name, building, floor, capacity, type, hasComputers, hasProjector, description } = req.body;
    
    // Check if room exists
    const roomDoc = await roomsCollection.doc(roomId).get();
    
    if (!roomDoc.exists) {
      return res.status(404).send({
        message: "Room not found!"
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (building !== undefined) updateData.building = building;
    if (floor !== undefined) updateData.floor = parseInt(floor);
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (type !== undefined) updateData.type = type;
    if (hasComputers !== undefined) updateData.hasComputers = hasComputers;
    if (hasProjector !== undefined) updateData.hasProjector = hasProjector;
    if (description !== undefined) updateData.description = description;
    
    // Add timestamp
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    // Update room
    await roomsCollection.doc(roomId).update(updateData);
    
    res.status(200).send({
      message: "Room updated successfully!"
    });
  } catch (error) {
    res.status(500).send({
      message: "Error updating room!"
    });
  }
};

// Delete a room (admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    
    // Check if room exists
    const roomDoc = await roomsCollection.doc(roomId).get();
    
    if (!roomDoc.exists) {
      return res.status(404).send({
        message: "Room not found!"
      });
    }
    
    // Check if room has any bookings
    const bookingsSnapshot = await bookingsCollection
      .where('roomId', '==', roomId)
      .limit(1)
      .get();
    
    if (!bookingsSnapshot.empty) {
      return res.status(400).send({
        message: "Cannot delete room with existing bookings!"
      });
    }
    
    // Delete room
    await roomsCollection.doc(roomId).delete();
    
    res.status(200).send({
      message: "Room deleted successfully!"
    });
  } catch (error) {
    res.status(500).send({
      message: "Error deleting room!"
    });
  }
};