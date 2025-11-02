const { authJwt } = require("../middlewares");
const controller = require("../controllers/booking.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create new booking
  app.post(
    "/api/bookings",
    [authJwt.verifyToken],
    controller.createBooking
  );
  
  // Get user bookings
  app.get(
    "/api/bookings/user",
    [authJwt.verifyToken],
    controller.getUserBookings
  );
  
  // Cancel booking
  app.put(
    "/api/bookings/:id/cancel",
    [authJwt.verifyToken],
    controller.cancelBooking
  );

  // Admin routes - Get all bookings
  app.get(
    "/api/admin/bookings",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllBookings
  );

  // Admin routes - Delete booking
  app.delete(
    "/api/admin/bookings/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteBooking
  );

  // Admin routes - Update booking
  app.put(
    "/api/admin/bookings/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateBooking
  );
};