const User        = require("../models/User");
const Doctor      = require("../models/Doctor");
const Patient     = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Payment     = require("../models/Payment");
const Notification= require("../models/Notification");
const logger = require("../utils/logger");

// ── Get All Users ─────────────────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role)   query.role = role;
    if (status === "active")   query.isActive = true;
    if (status === "inactive") query.isActive = false;
    if (search) {
      const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name:  { $regex: sanitized, $options: "i" } },
        { email: { $regex: sanitized, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpiry -refreshTokens")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: { users, pagination: { total, page: parseInt(page), limit: parseInt(limit) } } });
  } catch (error) { next(error); }
};

// ── Update User ───────────────────────────────────────────────
exports.updateUser = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive, role } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: { user } });
  } catch (error) { next(error); }
};

// ── Delete User ───────────────────────────────────────────────
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    logger.info(`Admin deleted user: ${user.email}`);
    res.json({ success: true, message: "User deleted" });
  } catch (error) { next(error); }
};

// ── Get Pending Doctors ───────────────────────────────────────
exports.getPendingDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ verificationStatus: "pending" })
      .populate("user", "name email phone createdAt")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { doctors } });
  } catch (error) { next(error); }
};

// ── Verify Doctor ─────────────────────────────────────────────
exports.verifyDoctor = async (req, res, next) => {
  try {
    const { action, reason } = req.body; // action: "approve" | "reject"

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.params.id },
      {
        $set: {
          verificationStatus: action === "approve" ? "approved" : "rejected",
          verifiedAt:         action === "approve" ? new Date() : undefined,
          verifiedBy:         action === "approve" ? req.user._id : undefined,
          rejectionReason:    action === "reject"  ? reason : undefined,
        },
      },
      { new: true }
    ).populate("user", "name email");

    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // Notify doctor
    await Notification.create({
      recipient: req.params.id,
      sender:    req.user._id,
      type:      "system",
      title:     action === "approve" ? "Account Approved!" : "Application Rejected",
      message:   action === "approve"
        ? "Congratulations! Your doctor account has been verified. You can now accept appointments."
        : `Your application was rejected. Reason: ${reason}`,
    });

    logger.info(`Doctor ${action}d: ${doctor.user.email} by admin ${req.user.email}`);
    res.json({ success: true, message: `Doctor ${action}d successfully`, data: { doctor } });
  } catch (error) { next(error); }
};

// ── Get Analytics ─────────────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    const now   = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers, totalDoctors, totalPatients,
      totalAppointments, monthlyAppointments,
      totalRevenue, monthlyRevenue,
      pendingDoctors,
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments({ verificationStatus: "approved" }),
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ createdAt: { $gte: month } }),
      Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Payment.aggregate([{ $match: { status: "paid", createdAt: { $gte: month } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Doctor.countDocuments({ verificationStatus: "pending" }),
    ]);

    // Monthly breakdown (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers, totalDoctors, totalPatients,
          totalAppointments, monthlyAppointments,
          totalRevenue:   totalRevenue[0]?.total   || 0,
          monthlyRevenue: monthlyRevenue[0]?.total  || 0,
          pendingDoctors,
        },
        monthlyData,
      },
    });
  } catch (error) { next(error); }
};

// ── Get Activity Logs ─────────────────────────────────────────
exports.getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    // In production, read from a dedicated audit log collection
    // For now, return recent user activity
    const recentUsers = await User.find()
      .select("name email role lastLogin createdAt isActive")
      .sort({ lastLogin: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: { logs: recentUsers } });
  } catch (error) { next(error); }
};
