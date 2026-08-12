const express = require("express");
const router  = express.Router();
const { body } = require("express-validator");
const appointmentController = require("../controllers/appointmentController");
const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.use(authenticate);

router.get("/slots/:doctorId", appointmentController.getSlots);

router.post("/",
  [
    body("doctorId").notEmpty().withMessage("Doctor ID required"),
    body("date").notEmpty().withMessage("Date required"),
    body("timeSlot").notEmpty().withMessage("Time slot required"),
    body("type").isIn(["video", "in-person"]).withMessage("Type must be video or in-person"),
  ],
  validate,
  appointmentController.book
);

router.get("/",       appointmentController.getAll);
router.get("/:id",    appointmentController.getById);
router.patch("/:id",  appointmentController.update);
router.patch("/:id/cancel", appointmentController.cancel);

module.exports = router;
