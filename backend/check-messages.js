require("dotenv").config();
const mongoose = require("mongoose");

async function checkMessages() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare_db");

  const Conversation = require("./src/models/Chat");
  const User = require("./src/models/User");

  const conv = await Conversation.findOne({})
    .populate("messages.sender", "name role")
    .sort({ updatedAt: -1 });

  if (!conv) { console.log("No conversations!"); return; }

  console.log(`Conversation: ${conv._id}`);
  console.log(`Messages (${conv.messages.length}):\n`);

  conv.messages.forEach((m, i) => {
    const name = m.sender?.name || m.sender;
    const role = m.sender?.role || "";
    console.log(`  [${i+1}] ${name} (${role}): "${m.content}" @ ${new Date(m.createdAt).toLocaleTimeString()}`);
  });

  await mongoose.disconnect();
}
checkMessages().catch(console.error);
