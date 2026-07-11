const Patient     = require("../models/Patient");
const User        = require("../models/User");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription  = require("../models/Prescription");

// ── Get Patient Profile ───────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate("user", "name email phone avatar");
    if (!patient) return res.status(404).json({ success: false, message: "Patient profile not found" });
    res.json({ success: true, data: { patient } });
  } catch (error) {
    next(error);
  }
};

// ── Update Patient Profile ────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { dateOfBirth, gender, bloodGroup, height, weight, address, emergencyContact, medicalHistory, insurance } = req.body;

    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      { $set: { dateOfBirth, gender, bloodGroup, height, weight, address, emergencyContact, medicalHistory, insurance } },
      { new: true, runValidators: true }
    ).populate("user", "name email phone avatar");

    if (!patient) return res.status(404).json({ success: false, message: "Patient profile not found" });

    // Update user name/phone if provided
    if (req.body.name || req.body.phone) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: { name: req.body.name, phone: req.body.phone },
      });
    }

    res.json({ success: true, message: "Profile updated", data: { patient } });
  } catch (error) {
    next(error);
  }
};

// ── Get Patient Dashboard ─────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalApts, upcomingApts, totalRecords, activePrescriptions] = await Promise.all([
      Appointment.countDocuments({ patient: req.user._id }),
      Appointment.find({ patient: req.user._id, status: { $in: ["confirmed", "pending"] }, date: { $gte: new Date() } })
        .populate("doctor", "name email avatar")
        .sort({ date: 1 })
        .limit(3),
      MedicalRecord.countDocuments({ patient: req.user._id }),
      Prescription.countDocuments({ patient: req.user._id, status: "active" }),
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalAppointments: totalApts, totalRecords, activePrescriptions },
        upcomingAppointments: upcomingApts,
      },
    });
  } catch (error) {
    next(error);
  }
};
