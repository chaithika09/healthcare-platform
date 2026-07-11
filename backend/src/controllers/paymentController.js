const Payment     = require("../models/Payment");
const Appointment = require("../models/Appointment");
const logger = require("../utils/logger");

// ── Initiate Payment ──────────────────────────────────────────
exports.initiate = async (req, res, next) => {
  try {
    const { appointmentId, method, amount } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    const payment = await Payment.create({
      patient:     req.user._id,
      doctor:      appointment.doctor,
      appointment: appointmentId,
      amount:      amount || appointment.fee,
      method,
      status:      "processing",
      description: `Consultation fee for appointment ${appointment.confirmationId}`,
    });

    // Simulate payment processing (replace with real Stripe/PayPal in production)
    setTimeout(async () => {
      try {
        payment.status = "paid";
        payment.gatewayPaymentId = "sim_" + Date.now();
        await payment.save();

        appointment.paymentStatus = "paid";
        appointment.paymentId = payment._id.toString();
        await appointment.save();

        logger.info(`Payment completed: ${payment.transactionId}`);
      } catch (e) {
        logger.error("Payment simulation error:", e.message);
      }
    }, 2000);

    res.status(201).json({
      success: true,
      message: "Payment initiated",
      data: { payment, clientSecret: "sim_secret_" + payment._id },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Payment History ───────────────────────────────────────
exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { patient: req.user._id };
    if (status) query.status = status;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate("doctor",      "name email")
      .populate("appointment", "date timeSlot type confirmationId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalSpent = await Payment.aggregate([
      { $match: { patient: req.user._id, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      success: true,
      data: {
        payments,
        totalSpent: totalSpent[0]?.total || 0,
        pagination: { total, page: parseInt(page), limit: parseInt(limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Single Payment ────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("doctor",      "name email")
      .populate("appointment", "date timeSlot type confirmationId");

    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.patient.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: { payment } });
  } catch (error) {
    next(error);
  }
};
