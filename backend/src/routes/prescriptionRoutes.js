const express = require("express");
const router  = express.Router();
const { body } = require("express-validator");
const prescriptionController = require("../controllers/prescriptionController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.use(authenticate);

router.get("/",    prescriptionController.getAll);
router.get("/:id", prescriptionController.getById);

router.post("/",
  [
    body("patientId").notEmpty().withMessage("Patient ID required"),
    body("diagnosis").notEmpty().withMessage("Diagnosis required"),
    body("medicines").isArray({ min: 1 }).withMessage("At least one medicine required"),
    body("medicines.*.name").notEmpty().withMessage("Medicine name required"),
    body("medicines.*.dose").notEmpty().withMessage("Medicine dose required"),
    body("medicines.*.frequency").notEmpty().withMessage("Medicine frequency required"),
  ],
  validate,
  prescriptionController.create
);

module.exports = router;
