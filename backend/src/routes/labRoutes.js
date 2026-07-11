const express = require("express");
const router  = express.Router();
const labController = require("../controllers/labController");
const { authenticate } = require("../middleware/auth");

router.get("/", labController.getTests);

router.use(authenticate);
router.post("/book",     labController.book);
router.get("/bookings",  labController.getBookings);

module.exports = router;
