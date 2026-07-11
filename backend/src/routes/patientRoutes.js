const express = require("express");
const router  = express.Router();
const patientController = require("../controllers/patientController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.get("/me",        authorize("patient", "admin"), patientController.getProfile);
router.put("/me",        authorize("patient"),          patientController.updateProfile);
router.get("/dashboard", authorize("patient"),          patientController.getDashboard);

module.exports = router;
