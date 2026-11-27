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
// Feed rules:
//   - "pending" AND not yet claimed by any hospital → ALL hospitals see
//   - claimed (non-pending) → ONLY the hospital that claimed it sees it
router.get("/emergencies", async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    let query;
    if (status && status !== "all") {
      if (status === "pending") {
        // Pending = not yet claimed by anyone
        query = { status: "pending" };
      } else {
        // Non-pending = only THIS hospital's claimed requests
        query = { status, respondedBy: req.user._id };
      }
    } else {
      // "all" tab:
      //   pending requests that have NOT been claimed yet (no respondedBy)
      //   OR requests this hospital has claimed (any status)
      query = {
        $or: [
          { status: "pending", respondedBy: { $exists: false } },
          { status: "pending", respondedBy: null },
          { respondedBy: req.user._id },
        ],
      };
    }

    const total    = await AmbulanceRequest.countDocuments(query);
    const requests = await AmbulanceRequest.find(query)
      .populate("patient", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Count for THIS hospital's view
    const [pendingCount, dispatchedCount, arrivedCount, completedCount] = await Promise.all([
      // Pending = unclaimed by anyone
      AmbulanceRequest.countDocuments({
        status: "pending",
        $or: [{ respondedBy: { $exists: false } }, { respondedBy: null }],
      }),
      AmbulanceRequest.countDocuments({ status: "dispatched", respondedBy: req.user._id }),
      AmbulanceRequest.countDocuments({ status: "arrived",    respondedBy: req.user._id }),
      AmbulanceRequest.countDocuments({ status: "completed",  respondedBy: req.user._id }),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        total,
        statusCounts: {
          pending:    pendingCount,
          dispatched: dispatchedCount,
          arrived:    arrivedCount,
          completed:  completedCount,
        },
      },
    });
  } catch (error) { next(error); }
});

// ── PATCH /hospital/emergencies/:id ──────────────────────────
// Hospital responds — record which hospital claimed it
router.patch("/emergencies/:id", async (req, res, next) => {
  try {
    const { status, assignedUnit, eta, responseNotes } = req.body;

    const hospital     = await Hospital.findOne({ user: req.user._id });
    const hospitalName = hospital?.hospitalName || req.user.name;

    // If dispatching, check request isn't already claimed by another hospital
    const existing = await AmbulanceRequest.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Emergency request not found" });
    }
    if (
      existing.status !== "pending" &&
      existing.respondedBy &&
      existing.respondedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(409).json({
        success: false,
        message: `This emergency has already been claimed by ${existing.respondedByName || "another hospital"}.`,
      });
    }

    const request = await AmbulanceRequest.findByIdAndUpdate(
      req.params.id,
      {
        ...(status       && { status }),
        ...(assignedUnit && { assignedUnit }),
        ...(eta          && { eta }),
        ...(responseNotes && { notes: responseNotes }),
        // Record which hospital claimed this request
        respondedBy:     req.user._id,
        respondedByName: hospitalName,
        respondedAt:     new Date(),
        ...(status === "completed" && { completedAt: new Date() }),
      },
      { new: true }
    ).populate("patient", "name email phone _id");

    // Status messages shown to patient
    const statusMessages = {
      dispatched: `🚑 ${hospitalName} has dispatched ${assignedUnit || "an ambulance"}! ETA: ${eta || "8–12 minutes"}. Stay calm.`,
      arrived:    `🏥 Ambulance from ${hospitalName} has arrived at your location.`,
      completed:  `✅ Emergency case handled by ${hospitalName}. Please ensure you receive proper care.`,
      cancelled:  `⚠️ ${hospitalName} cancelled the request. Please call 108 immediately.`,
    };
    const patientMessage = statusMessages[status] || `${hospitalName}: status updated to ${status}`;

    // Notify patient via socket + in-app notification
    if (request.patient?._id) {
      sendAmbulanceUpdate(request.patient._id.toString(), {
        requestId: request._id,
        status,
        assignedUnit,
        eta,
        message:   patientMessage,
        hospitalName,
      });

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

    logger.info(`Hospital "${hospitalName}" updated emergency ${request._id} → ${status}`);
    res.json({ success: true, message: "Emergency updated", data: { request } });
  } catch (error) { next(error); }
});

// ── GET /hospital/dashboard ───────────────────────────────────
router.get("/dashboard", async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const myId = req.user._id;

    const [total, todayCount, pending, dispatched, arrived, completed, hospital] = await Promise.all([
      // Total = unclaimed pending + this hospital's claimed
      AmbulanceRequest.countDocuments({
        $or: [
          { status: "pending", $or: [{ respondedBy: { $exists: false } }, { respondedBy: null }] },
          { respondedBy: myId },
        ],
      }),
      // Today
      AmbulanceRequest.countDocuments({
        createdAt: { $gte: today },
        $or: [
          { status: "pending", $or: [{ respondedBy: { $exists: false } }, { respondedBy: null }] },
          { respondedBy: myId },
        ],
      }),
      // Unclaimed pending
      AmbulanceRequest.countDocuments({
        status: "pending",
        $or: [{ respondedBy: { $exists: false } }, { respondedBy: null }],
      }),
      AmbulanceRequest.countDocuments({ status: "dispatched", respondedBy: myId }),
      AmbulanceRequest.countDocuments({ status: "arrived",    respondedBy: myId }),
      AmbulanceRequest.countDocuments({ status: "completed",  respondedBy: myId }),
      Hospital.findOne({ user: myId }),
    ]);

    res.json({
      success: true,
      data: {
        stats: { total, todayCount, pending, dispatched, arrived, completed },
        hospital,
      },
    });
  } catch (error) { next(error); }
});

module.exports = router;
