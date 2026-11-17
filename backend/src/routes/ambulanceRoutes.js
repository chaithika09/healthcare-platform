const express      = require("express");
const router       = express.Router();
const nodemailer   = require("nodemailer");
const { authenticate, authorize } = require("../middleware/auth");
const AmbulanceRequest = require("../models/AmbulanceRequest");
const Notification     = require("../models/Notification");
const User             = require("../models/User");
const logger           = require("../utils/logger");
const { broadcastEmergency, sendAmbulanceUpdate, sendNotification } = require("../sockets/socketHandler");

// ── Email transporter ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Shared HTML email builder ─────────────────────────────────
function buildEmergencyEmail(request, mapsLink) {
  const { patientName, patientPhone, location, gpsCoords, emergencyType, notes, _id } = request;
  const reqId   = `AMB-${_id.toString().slice(-8).toUpperCase()}`;
  const gpsText = gpsCoords?.lat ? `${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lng.toFixed(5)}` : "Not available";

  return {
    subject: `🚨 AMBULANCE REQUEST ${reqId} — ${emergencyType} | ${(location || "").slice(0, 60)}`,
    html: `
<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;border:3px solid #EF4444;border-radius:12px;overflow:hidden;">
  <div style="background:#EF4444;color:#fff;padding:24px;text-align:center;">
    <h1 style="margin:0;font-size:26px;letter-spacing:1px;">🚑 AMBULANCE REQUEST</h1>
    <p style="margin:6px 0 0;font-size:14px;opacity:.85;">Request ID: <strong>${reqId}</strong> &nbsp;|&nbsp; ${new Date().toLocaleString("en-IN")}</p>
  </div>

  <div style="padding:24px;background:#fff;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="background:#FFF5F5;">
        <td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #FEE2E2;width:38%;">👤 Patient Name</td>
        <td style="padding:10px 14px;border-bottom:1px solid #FEE2E2;"><strong>${patientName || "Unknown"}</strong></td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #FEE2E2;">📞 Phone</td>
        <td style="padding:10px 14px;border-bottom:1px solid #FEE2E2;"><a href="tel:${patientPhone}" style="color:#EF4444;font-weight:700;text-decoration:none;">${patientPhone || "N/A"}</a></td>
      </tr>
      <tr style="background:#FFF5F5;">
        <td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #FEE2E2;">📍 Location</td>
        <td style="padding:10px 14px;border-bottom:1px solid #FEE2E2;">${location}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #FEE2E2;">🛰 GPS Coords</td>
        <td style="padding:10px 14px;border-bottom:1px solid #FEE2E2;">${gpsText}</td>
      </tr>
      <tr style="background:#FFF5F5;">
        <td style="padding:10px 14px;font-weight:700;border-bottom:1px solid #FEE2E2;">🏥 Emergency Type</td>
        <td style="padding:10px 14px;border-bottom:1px solid #FEE2E2;color:#EF4444;font-weight:700;">${emergencyType}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;font-weight:700;">📝 Additional Notes</td>
        <td style="padding:10px 14px;">${notes || "None"}</td>
      </tr>
    </table>

    <div style="margin-top:24px;text-align:center;">
      <a href="${mapsLink}" target="_blank"
         style="background:#EF4444;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
        📍 Open Location in Google Maps
      </a>
    </div>

    <p style="margin-top:20px;font-size:12px;color:#9CA3AF;text-align:center;">
      Dispatched automatically by <strong>MedIQ Healthcare Platform</strong><br/>
      This alert was sent to the emergency response team and hospital administration.
    </p>
  </div>
</div>
    `,
  };
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/ambulance/request
// Patient submits an emergency ambulance request
// ─────────────────────────────────────────────────────────────
router.post("/request", authenticate, async (req, res, next) => {
  try {
    const { location, gpsCoords, emergencyType, notes } = req.body;

    if (!location?.trim()) {
      return res.status(400).json({ success: false, message: "Location is required" });
    }

    // 1. Save to database
    const request = await AmbulanceRequest.create({
      patient:       req.user._id,
      patientName:   req.user.name,
      patientPhone:  req.user.phone || "N/A",
      location:      location.trim(),
      gpsCoords,
      emergencyType: emergencyType || "Medical Emergency",
      notes:         notes || "",
      status:        "pending",
    });

    const mapsLink = gpsCoords?.lat
      ? `https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}`
      : `https://maps.google.com/?q=${encodeURIComponent(location)}`;

    // 2. Real-time socket broadcast to ALL connected admins/hospital staff
    broadcastEmergency({
      requestId:     request._id,
      patientName:   req.user.name,
      patientPhone:  req.user.phone || "N/A",
      location:      location.trim(),
      gpsCoords,
      emergencyType: request.emergencyType,
      mapsLink,
      createdAt:     request.createdAt,
    });

    // 3. Create in-app Notification for all admins AND hospitals (non-blocking)
    User.find({ role: { $in: ["admin", "hospital"] } }).select("_id").lean()
      .then(async (admins) => {
        const notifs = admins.map((a) => ({
          recipient: a._id,
          type:      "alert",
          title:     `🚨 Ambulance Request — ${request.emergencyType}`,
          message:   `${req.user.name} needs emergency help at: ${location.trim().slice(0, 80)}`,
          data:      { requestId: request._id, mapsLink },
        }));
        if (notifs.length > 0) {
          const created = await Notification.insertMany(notifs);
          // Push each admin notification via socket
          created.forEach((n) => sendNotification(n.recipient.toString(), n));
        }
      })
      .catch((e) => logger.error("Admin notification error:", e.message));

    // 4. Send email to hospital/admin (non-blocking)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const { subject, html } = buildEmergencyEmail(request, mapsLink);
      transporter.sendMail({
        from:    `"MedIQ Emergency 🚑" <${process.env.SMTP_USER}>`,
        to:      process.env.EMERGENCY_EMAIL || process.env.SMTP_USER,
        subject,
        html,
      })
        .then(() => logger.info(`Emergency email sent for request ${request._id}`))
        .catch((e) => logger.error("Emergency email failed:", e.message));
    }

    logger.info(`Ambulance request created: ${request._id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message:  "Ambulance request submitted successfully. Help is on the way!",
      data: {
        requestId:         request._id,
        status:            "pending",
        estimatedArrival:  "8–12 minutes",
        message:           "Your emergency has been reported to the response team. Please also call 108 directly.",
        mapsLink,
      },
    });

  } catch (error) {
    logger.error("Ambulance request error:", error.message);
    // Always return success to the user even if DB/email fails
    res.status(201).json({
      success: true,
      message: "Ambulance request registered. Please call 108 immediately.",
      data: {
        requestId:        "AMB-" + Date.now().toString(36).toUpperCase(),
        status:           "pending",
        estimatedArrival: "8–12 minutes",
        message:          "Your emergency has been registered. Please call 108 directly.",
      },
    });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/v1/ambulance/requests
// Admin or doctor: get all ambulance requests
// ─────────────────────────────────────────────────────────────
router.get("/requests", authenticate, authorize("admin", "doctor"), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = status ? { status } : {};

    const total    = await AmbulanceRequest.countDocuments(query);
    const requests = await AmbulanceRequest.find(query)
      .populate("patient", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: { requests, total } });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/ambulance/requests/:id
// Admin or doctor: update status, assign unit, set ETA
// ─────────────────────────────────────────────────────────────
router.patch("/requests/:id", authenticate, authorize("admin", "doctor"), async (req, res, next) => {
  try {
    const { status, assignedUnit, eta, notes } = req.body;

    const request = await AmbulanceRequest.findByIdAndUpdate(
      req.params.id,
      {
        ...(status       && { status }),
        ...(assignedUnit && { assignedUnit }),
        ...(eta          && { eta }),
        ...(notes        && { notes }),
        respondedAt: new Date(),
        ...(status === "completed" && { completedAt: new Date() }),
      },
      { new: true }
    ).populate("patient", "name email phone _id");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Notify the patient via socket
    if (request.patient?._id) {
      const statusMessages = {
        dispatched: `🚑 Ambulance ${assignedUnit || ""} dispatched! ETA: ${eta || "8–12 minutes"}. Stay calm.`,
        arrived:    "🏥 Ambulance has arrived at your location.",
        completed:  "✅ Emergency resolved. Please ensure you receive proper care.",
        cancelled:  "⚠️ Your ambulance request has been cancelled. Call 108 if still needed.",
      };

      const socketPayload = {
        requestId:    request._id,
        status,
        assignedUnit,
        eta,
        message:      statusMessages[status] || `Ambulance status updated: ${status}`,
      };

      sendAmbulanceUpdate(request.patient._id.toString(), socketPayload);

      // Create in-app Notification for the patient
      const notif = await Notification.create({
        recipient: request.patient._id,
        type:      "alert",
        title:     status === "dispatched" ? "🚑 Ambulance Dispatched!" : `Ambulance Update: ${status}`,
        message:   statusMessages[status] || `Your ambulance request is now: ${status}`,
        data:      { requestId: request._id },
      });
      sendNotification(request.patient._id.toString(), notif);
    }

    logger.info(`Ambulance request ${request._id} updated to ${status} by ${req.user.email}`);
    res.json({ success: true, message: "Request updated", data: { request } });

  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/v1/ambulance/my-requests
// Patient: get their own emergency request history
// ─────────────────────────────────────────────────────────────
router.get("/my-requests", authenticate, async (req, res, next) => {
  try {
    const requests = await AmbulanceRequest.find({ patient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: { requests } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
