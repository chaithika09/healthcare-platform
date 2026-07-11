const express = require("express");
const router  = express.Router();
const { body } = require("express-validator");
const feedbackController = require("../controllers/feedbackController");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.use(authenticate);

router.post("/",
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
    body("feedback").notEmpty().withMessage("Feedback message required"),
  ],
  validate,
  feedbackController.submit
);

router.get("/", feedbackController.getAll);

module.exports = router;
