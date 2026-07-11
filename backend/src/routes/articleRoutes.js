const express = require("express");
const router  = express.Router();
const articleController = require("../controllers/articleController");
const { optionalAuth } = require("../middleware/auth");

router.get("/",    optionalAuth, articleController.getAll);
router.get("/:id", optionalAuth, articleController.getById);

module.exports = router;
