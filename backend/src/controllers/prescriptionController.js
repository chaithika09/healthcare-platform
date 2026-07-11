const Prescription = require("../models/Prescription");
const Notification = require("../models/Notification");

// ── Create Prescription ───────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Only doctors can create prescriptions" });
    }

    const { patientId, appointmentId, diagnosis, medicines, notes, followUpDate } = req.body;

    const prescription = await Prescription.create({
      patient:     patientId,
      doctor:      req.user._id,
      appointment: appointmentId,
      diagnosis, medicines, notes,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      expiryDate:   new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await prescription.populate([
      { path: "patient", select: "name email" },
      { path: "doctor",  select: "name email" },
    ]);

    // Notify patient
    await Notification.create({
      recipient: patientId,
      sender:    req.user._id,
      type:      "record",
      title:     "New Prescription",
      message:   `Dr. ${req.user.name} has issued a new prescription for you.`,
      data:      { prescriptionId: prescription._id },
    });

    res.status(201).json({ success: true, message: "Prescription created", data: { prescription } });
  } catch (error) {
    next(error);
  }
};

// ── Get All Prescriptions ─────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === "patient") query.patient = req.user._id;
    else if (req.user.role === "doctor") query.doctor = req.user._id;

    if (status) query.status = status;

    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate("patient", "name email avatar")
      .populate("doctor",  "name email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { prescriptions, pagination: { total, page: parseInt(page), limit: parseInt(limit) } },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Single Prescription ───────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patient", "name email avatar")
      .populate("doctor",  "name email avatar");

    if (!prescription) return res.status(404).json({ success: false, message: "Prescription not found" });

    const isOwner =
      prescription.patient._id.toString() === req.user._id.toString() ||
      prescription.doctor._id.toString()  === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: { prescription } });
  } catch (error) {
    next(error);
  }
};
