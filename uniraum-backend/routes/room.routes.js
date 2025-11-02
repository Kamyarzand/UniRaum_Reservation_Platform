const { authJwt } = require("../middlewares");
const controller = require("../controllers/room.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get all rooms
  app.get("/api/rooms", controller.getAllRooms);
  
  // Get available rooms with filters
  app.get("/api/rooms/available", controller.getAvailableRooms);
  
  // Get room by ID
  app.get("/api/rooms/:id", controller.getRoomById);

  // Get room bookings
  app.get("/api/rooms/:id/bookings", controller.getRoomBookings);
  
  // Create new room (admin only)
  app.post(
    "/api/rooms",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createRoom
  );

  // Update a room (admin only)
  app.put(
    "/api/rooms/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateRoom
  );

  // Delete a room (admin only)
  app.delete(
    "/api/rooms/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteRoom
  );
};