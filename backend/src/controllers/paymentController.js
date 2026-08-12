const Payment     = require("../models/Payment");
const Appointment = require("../models/Appointment");
const logger = require("../utils/logger");
const stripe = process.env.STRIPE_SECRET_KEY ? require("stripe")(process.env.STRIPE_SECRET_KEY) : null;

// ── Initiate Payment (Stripe) ──────────────────────────────────
exports.initiate = async (req, res, next) => {
  try {
    const { appointmentId, amount } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    const finalAmount = amount || appointment.fee;

    // 1. Create entry in our DB
    const payment = await Payment.create({
      patient:     req.user._id,
      doctor:      appointment.doctor,
      appointment: appointmentId,
      amount:      finalAmount,
      method:      "stripe",
      status:      "pending",
      description: `Consultation fee for appointment ${appointment.confirmationId}`,
    });

    // 2. If Stripe is configured, create a PaymentIntent
    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount * 100), // Stripe expects cents
        currency: "usd",
        metadata: { paymentId: payment._id.toString(), appointmentId: appointmentId },
        automatic_payment_methods: { enabled: true },
      });

      res.status(201).json({
        success: true,
        message: "Payment initiated",
        data: {
          payment,
          clientSecret: paymentIntent.client_secret,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        },
      });
    } else {
      // Fallback/Demo mode if no API key provided
      logger.warn("Stripe API key missing. Using simulated payment.");

      setTimeout(async () => {
        payment.status = "paid";
        payment.gatewayPaymentId = "sim_" + Date.now();
        await payment.save();
        appointment.paymentStatus = "paid";
        await appointment.save();
      }, 2000);

      res.status(201).json({
        success: true,
        message: "Payment initiated (Demo Mode)",
        data: { payment, clientSecret: "demo_secret_" + payment._id },
      });
    }
  } catch (error) {
    next(error);
  }
};

// ── Webhook to confirm payment ───────────────────────────────
exports.webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const paymentId = intent.metadata.paymentId;

    const payment = await Payment.findById(paymentId);
    if (payment) {
      payment.status = "paid";
      payment.gatewayPaymentId = intent.id;
      await payment.save();

      await Appointment.findByIdAndUpdate(payment.appointment, { paymentStatus: "paid" });
      logger.info(`Stripe Payment Succeeded: ${paymentId}`);
    }
  }

  res.json({ received: true });
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

    res.json({
      success: true,
      data: {
        payments,
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
