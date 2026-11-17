const express      = require("express");
const router       = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const Hospital         = require("../models/Hospital");
const AmbulanceRequest = require("../models/AmbulanceRequest");
const Notification     = require("../models/Notification");
const { sendAmbulanceUpdate, sendNotification } = require("../sockets/socketHandler");
const logger = require("../utils/logger");

// All hospital routes require authentication + hospital role
router.use(authenticate, authorize("hospital"));

// ── GET /hospital/profile ─────────────────────────────────────
// Get this hospital's own profile
router.get("/profile", async (req, res, next) => {
  try {
    const hospital = await Hospital.findOne({ user: req.user._id })
      .populate("user", "name email phone");
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital profile not found" });
    }
    res.json({ success: true, data: { hospital } });
  } catch (error) { next(error); }
});

// ── PUT /hospital/profile ─────────────────────────────────────
// Update this hospital's profile
router.put("/profile", async (req, res, next) => {
  try {
    const {
      hospitalName, address, city, state, pincode,
      emergencyPhone, type, specialties,
      totalBeds, emergencyBeds, hasAmbulance, ambulanceCount, location,
    } = req.body;

    const hospital = await Hospital.findOneAndUpdate(
      { user: req.user._id },
      {
        ...(hospitalName    && { hospitalName }),
        ...(address         && { address }),
        ...(city            && { city }),
        ...(state           && { state }),
        ...(pincode         && { pincode }),
        ...(emergencyPhone  && { emergencyPhone }),
        ...(type            && { type }),
        ...(specialties     && { specialties }),
        ...(totalBeds       !== undefined && { totalBeds }),
        ...(emergencyBeds   !== undefined && { emergencyBeds }),
        ...(hasAmbulance    !== undefined && { hasAmbulance }),
        ...(ambulanceCount  !== undefined && { ambulanceCount }),
        ...(location        && { location }),
      },
      { new: true }
    ).populate("user", "name email phone");

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital profile not found" });
    }
    res.json({ success: true, data: { hospital } });
  } catch (error) { next(error); }
});

// ── GET /hospital/emergencies ─────────────────────────────────
// Get all incoming ambulance/emergency requests (live feed)
router.get("/emergencies", async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = status && status !== "all" ? { status } : {};

    const total    = await AmbulanceRequest.countDocuments(query);
    const requests = await AmbulanceRequest.find(query)
      .populate("patient", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Count by status
    const counts = await AmbulanceRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusCounts = counts.reduce((acc, c) => {
      acc[c._id] = c.count;
      return acc;
    }, {});

    res.json({ success: true, data: { requests, total, statusCounts } });
  } catch (error) { next(error); }
});

// ── PATCH /hospital/emergencies/:id ──────────────────────────
// Hospital responds to an emergency — update status, dispatch unit
router.patch("/emergencies/:id", async (req, res, next) => {
  try {
    const { status, assignedUnit, eta, responseNotes } = req.body;

    const hospital = await Hospital.findOne({ user: req.user._id });
    const hospitalName = hospital?.hospitalName || req.user.name;

    const request = await AmbulanceRequest.findByIdAndUpdate(
      req.params.id,
      {
        ...(status       && { status }),
        ...(assignedUnit && { assignedUnit }),
        ...(eta          && { eta }),
        ...(responseNotes && { notes: responseNotes }),
        respondedAt: new Date(),
        ...(status === "completed" && { completedAt: new Date() }),
      },
      { new: true }
    ).populate("patient", "name email phone _id");

    if (!request) {
      return res.status(404).json({ success: false, message: "Emergency request not found" });
    }

    // Build the message the patient will see
    const statusMessages = {
      dispatched: `🚑 ${hospitalName} has dispatched ${assignedUnit || "an ambulance"}! ETA: ${eta || "8–12 minutes"}. Stay calm.`,
      arrived:    `🏥 Ambulance from ${hospitalName} has arrived at your location.`,
      completed:  `✅ Emergency case handled by ${hospitalName}. Please ensure you receive proper care.`,
      cancelled:  `⚠️ ${hospitalName} cancelled the request. Please call 108 immediately.`,
    };

    const patientMessage = statusMessages[status] || `${hospitalName}: Ambulance status updated to ${status}`;

    // Push socket update to patient
    if (request.patient?._id) {
      sendAmbulanceUpdate(request.patient._id.toString(), {
        requestId:    request._id,
        status,
        assignedUnit,
        eta,
        message:      patientMessage,
        hospitalName,
      });

      // Create in-app notification for patient
      const notif = await Notification.create({
        recipient: request.patient._id,
        type:      "alert",
        title:     status === "dispatched"
          ? `🚑 Ambulance Dispatched by ${hospitalName}!`
          : `Emergency Update from ${hospitalName}`,
        message:   patientMessage,
        data:      { requestId: request._id, hospitalName },
      });
      sendNotification(request.patient._id.toString(), notif);
    }

    logger.info(`Hospital ${hospitalName} updated emergency ${request._id} to ${status}`);
    res.json({ success: true, message: "Emergency updated", data: { request } });
  } catch (error) { next(error); }
});

// ── GET /hospital/dashboard ───────────────────────────────────
// Dashboard stats for the hospital
router.get("/dashboard", async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCount, pending, dispatched, completed, hospital] = await Promise.all([
      AmbulanceRequest.countDocuments({}),
      AmbulanceRequest.countDocuments({ createdAt: { $gte: today } }),
      AmbulanceRequest.countDocuments({ status: "pending" }),
      AmbulanceRequest.countDocuments({ status: "dispatched" }),
      AmbulanceRequest.countDocuments({ status: "completed" }),
      Hospital.findOne({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: {
        stats: { total, todayCount, pending, dispatched, completed },
        hospital,
      },
    });
  } catch (error) { next(error); }
});

module.exports = router;
