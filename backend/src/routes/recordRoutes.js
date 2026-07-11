const express = require("express");
const router  = express.Router();
const recordController = require("../controllers/recordController");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(authenticate);

router.get("/",       recordController.getAll);
router.get("/:id",    recordController.getById);
router.post("/",      upload.array("files", 5), recordController.upload);
router.delete("/:id", recordController.delete);

module.exports = router;
