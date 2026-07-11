const express = require("express");
const router  = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.post("/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 100 }),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must include uppercase, lowercase, and number"),
    body("role").optional().isIn(["patient", "doctor"]).withMessage("Role must be patient or doctor"),
  ],
  validate,
  authController.register
);

router.post("/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login
);

router.post("/verify-otp",
  [
    body("email").isEmail().normalizeEmail(),
    body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("OTP must be 6 digits"),
  ],
  validate,
  authController.verifyOTP
);

router.post("/resend-otp",
  [body("email").isEmail().normalizeEmail()],
  validate,
  authController.resendOTP
);

router.post("/refresh",
  [body("refreshToken").notEmpty().withMessage("Refresh token required")],
  validate,
  authController.refreshToken
);

router.post("/logout",   authenticate, authController.logout);
router.get("/me",        authenticate, authController.getMe);

router.post("/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  validate,
  authController.forgotPassword
);

router.post("/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must include uppercase, lowercase, and number"),
  ],
  validate,
  authController.resetPassword
);

module.exports = router;
