const express = require("express");
const router  = express.Router();
const { body } = require("express-validator");
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.use(authenticate);

router.post("/initiate",
  [
    body("appointmentId").notEmpty().withMessage("Appointment ID required"),
    body("method").isIn(["card","paypal","apple-pay","google-pay"]).withMessage("Invalid payment method"),
  ],
  validate,
  paymentController.initiate
);

router.get("/",    paymentController.getHistory);
router.get("/:id", paymentController.getById);

module.exports = router;
