const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const multer = require('multer');

// Configure multer for profile picture upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get user profile
  app.get(
    "/api/user/profile",
    [authJwt.verifyToken],
    controller.getUserProfile
  );
  
  // Update user profile
  app.put(
    "/api/user/profile",
    [authJwt.verifyToken],
    controller.updateUserProfile
  );

  // Upload profile picture
  app.post(
    "/api/user/profile/picture",
    [authJwt.verifyToken, upload.single('profilePicture')],
    controller.uploadProfilePicture
  );

  // Delete profile picture
  app.delete(
    "/api/user/profile/picture",
    [authJwt.verifyToken],
    controller.deleteProfilePicture
  );
  
  // Get all users (admin only)
  app.get(
    "/api/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllUsers
  );
  
  // Get user by ID (admin only)
  app.get(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getUserById
  );
  
  // Create new user (admin only)
  app.post(
    "/api/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createUser
  );
  
  // Update user (admin only)
  app.put(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateUser
  );
  
  // Delete user (admin only)
  app.delete(
    "/api/users/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteUser
  );
  
  // Update user role (admin only)
  app.put(
    "/api/users/:id/role",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateUserRole
  );
};