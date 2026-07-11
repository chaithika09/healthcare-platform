const express = require("express");
const router  = express.Router();
const chatController = require("../controllers/chatController");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/conversations",                          chatController.getConversations);
router.post("/conversations",                         chatController.createOrGet);
router.get("/conversations/:id/messages",             chatController.getMessages);
router.post("/conversations/:id/messages",            chatController.sendMessage);

module.exports = router;
