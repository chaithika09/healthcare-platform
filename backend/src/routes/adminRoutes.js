const express = require("express");
const router  = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate, authorize("admin"));

router.get("/users",              adminController.getUsers);
router.put("/users/:id",          adminController.updateUser);
router.delete("/users/:id",       adminController.deleteUser);

router.get("/doctors/pending",    adminController.getPendingDoctors);
router.patch("/doctors/:id/verify", adminController.verifyDoctor);

router.get("/analytics",          adminController.getAnalytics);
router.get("/logs",               adminController.getLogs);

module.exports = router;
