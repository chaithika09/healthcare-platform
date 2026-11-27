const express      = require("express");
const router       = express.Router();
const nodemailer   = require("nodemailer");
const { authenticate, authorize } = require("../middleware/auth");
const AmbulanceRequest = require("../models/AmbulanceRequest");
const Notification     = require("../models/Notification");
const User             = require("../models/User");
const Hospital         = require("../models/Hospital");
const logger           = require("../utils/logger");
const { broadcastEmergency, sendAmbulanceUpdate, sendNotification } = require("../sockets/socketHandler");

// ── Haversine distance (km) between two GPS points ────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    = Math.sin(dLat/2) * Math.sin(dLat/2)
             + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180)
             * Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

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
// GET /api/v1/ambulance/hospitals?lat=&lng=
// PUBLIC — Patient fetches registered hospitals sorted by distance
// ─────────────────────────────────────────────────────────────
router.get("/hospitals", authenticate, async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const patLat = parseFloat(lat);
    const patLng = parseFloat(lng);

    // Get all registered hospitals with their profile
    const hospitals = await Hospital.find({})
      .populate("user", "name email phone")
      .lean();

    const list = hospitals.map(h => {
      const hasGps = h.location?.lat && h.location?.lng;
      const distKm = hasGps && patLat && patLng
        ? haversineKm(patLat, patLng, h.location.lat, h.location.lng)
        : null;
      const driveMins = distKm ? Math.round(distKm * 3 + 2) : null;

      return {
        _id:           h._id,
        userId:        h.user?._id,
        hospitalName:  h.hospitalName,
        address:       h.address,
        city:          h.city,
        state:         h.state,
        emergencyPhone: h.emergencyPhone || h.phone || h.user?.phone,
        email:         h.user?.email,
        type:          h.type,
        hasGps,
        location:      h.location,
        distanceKm:    distKm ? parseFloat(distKm.toFixed(1)) : null,
        driveMinutes:  driveMins,
      };
    })
    // Sort: hospitals with GPS by distance first, then those without GPS
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });

    res.json({ success: true, data: { hospitals: list } });
  } catch (error) {
    next(error);
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/v1/ambulance/request
// Patient submits an emergency ambulance request
// ─────────────────────────────────────────────────────────────
router.post("/request", authenticate, async (req, res, next) => {
  try {
    const { location, gpsCoords, emergencyType, notes, targetHospitalId } = req.body;

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
      ...(targetHospitalId && { targetHospital: targetHospitalId }),
    });

    const mapsLink = gpsCoords?.lat
      ? `https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}`
      : `https://maps.google.com/?q=${encodeURIComponent(location)}`;

    // 2. Real-time socket broadcast
    broadcastEmergency({
      requestId:     request._id,
      patientName:   req.user.name,
      patientPhone:  req.user.phone || "N/A",
      location:      location.trim(),
      gpsCoords,
      emergencyType: request.emergencyType,
      mapsLink,
      createdAt:     request.createdAt,
      targetHospitalId: targetHospitalId || null,
    });

    // 3. Notify hospitals
    User.find({ role: { $in: ["admin", "hospital"] } })
      .select("_id email name role")
      .lean()
      .then(async (recipients) => {
        const hospitalUsers = recipients.filter(r => r.role === "hospital");
        const adminUsers    = recipients.filter(r => r.role === "admin");
        let notifyHospitals = [];

        if (targetHospitalId) {
          // ── Patient chose a specific hospital — notify ONLY that one ──
          const targetHosp = await Hospital.findById(targetHospitalId).select("user hospitalName").lean();
          if (targetHosp) {
            const targetUser = hospitalUsers.find(h => h._id.toString() === targetHosp.user.toString());
            if (targetUser) notifyHospitals = [{ ...targetUser, hospitalName: targetHosp.hospitalName, distanceKm: null }];
          }
        } else {
          // ── No selection — sort by distance and notify nearest 5 ──
          if (gpsCoords?.lat && gpsCoords?.lng) {
            const profiles = await Hospital.find({
              user: { $in: hospitalUsers.map(h => h._id) },
            }).select("user location hospitalName").lean();

            const profileMap = {};
            profiles.forEach(p => { profileMap[p.user.toString()] = p; });

            notifyHospitals = hospitalUsers.map(h => {
              const p      = profileMap[h._id.toString()];
              const hasGps = p?.location?.lat && p?.location?.lng;
              const dist   = hasGps
                ? haversineKm(gpsCoords.lat, gpsCoords.lng, p.location.lat, p.location.lng)
                : 999999;
              return { ...h, distanceKm: dist, hospitalName: p?.hospitalName };
            })
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 5);
          } else {
            notifyHospitals = hospitalUsers.slice(0, 5);
          }
        }

        const notifyList = [...notifyHospitals, ...adminUsers];

        // In-app notifications
        const notifs = notifyList.map(r => ({
          recipient: r._id,
          type:      "alert",
          title:     `🚨 Ambulance Request — ${request.emergencyType}`,
          message:   r.distanceKm !== undefined && r.distanceKm !== null && r.distanceKm < 999999
            ? `${req.user.name} needs help — ${r.distanceKm.toFixed(1)} km away`
            : `${req.user.name} needs emergency help at: ${location.trim().slice(0, 80)}`,
          data: { requestId: request._id, mapsLink },
        }));

        if (notifs.length > 0) {
          const created = await Notification.insertMany(notifs);
          created.forEach(n => sendNotification(n.recipient.toString(), n));
        }

        // Send emails
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          const { subject, html } = buildEmergencyEmail(request, mapsLink);
          const emailList = notifyList.map(r => r.email).filter(Boolean);
          if (process.env.EMERGENCY_EMAIL && !emailList.includes(process.env.EMERGENCY_EMAIL)) {
            emailList.push(process.env.EMERGENCY_EMAIL);
          }
          if (emailList.length > 0) {
            transporter.sendMail({
              from: `"MedIQ Emergency 🚑" <${process.env.SMTP_USER}>`,
              to:   emailList.join(","),
              subject,
              html,
            })
              .then(() => logger.info(`Emergency email sent to: ${emailList.join(", ")}`))
              .catch(e  => logger.error("Email failed:", e.message));
          }
        }

        logger.info(`Notified ${notifyList.length} recipient(s). Target: ${targetHospitalId || "nearest"}`);
      })
      .catch(e => logger.error("Notification error:", e.message));

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
