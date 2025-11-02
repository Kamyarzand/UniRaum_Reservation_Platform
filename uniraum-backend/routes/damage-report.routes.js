const controller = require('../controllers/damage-report.controller');
const { authJwt } = require('../middlewares');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create damage report (authenticated users)
  app.post(
    "/api/damage-reports",
    [authJwt.verifyToken],
    controller.createDamageReport
  );

  // Get all damage reports (admin only)
  app.get(
    "/api/damage-reports",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllDamageReports
  );

  // Update damage report status (admin only)
  app.put(
    "/api/damage-reports/:id/status",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateDamageReportStatus
  );

  // Delete damage report (admin only)
  app.delete(
    "/api/damage-reports/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteDamageReport
  );
};