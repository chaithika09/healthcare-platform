const express = require("express");
const router  = express.Router();
const doctorController = require("../controllers/doctorController");
const { authenticate, authorize, optionalAuth } = require("../middleware/auth");

// ── Public routes (specific paths BEFORE /:id wildcard) ──────
router.get("/",          optionalAuth, doctorController.getAll);

// ── Protected specific routes (must come BEFORE /:id) ────────
router.use(authenticate);
router.get("/dashboard",    authorize("doctor"), doctorController.getDashboard);
router.get("/appointments", authorize("doctor"), doctorController.getAppointments);
router.get("/me",           authorize("doctor"), doctorController.getMyProfile);
router.put("/me",           authorize("doctor"), doctorController.updateProfile);

// ── Wildcard /:id route LAST ──────────────────────────────────
router.get("/:id", optionalAuth, doctorController.getById);

module.exports = router;
