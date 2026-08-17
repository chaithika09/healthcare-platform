require("dotenv").config();
const mongoose = require("mongoose");

async function checkChats() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare_db");
  console.log("✅ Connected to MongoDB\n");

  const Conversation = require("./src/models/Chat");
  const User = require("./src/models/User");

  const convs = await Conversation.find({})
    .populate("participants", "name email role")
    .sort({ updatedAt: -1 });

  console.log(`Found ${convs.length} conversation(s):\n`);

  convs.forEach((c, i) => {
    console.log(`--- Conversation ${i + 1} ---`);
    console.log(`  ID: ${c._id}`);
    console.log(`  Participants:`);
    c.participants.forEach(p => {
      console.log(`    - ${p.name} (${p.role}) [${p.email}]`);
    });
    console.log(`  Messages: ${c.messages.length}`);
    if (c.lastMessage?.content) {
      console.log(`  Last message: "${c.lastMessage.content}"`);
    }
    console.log(`  Active: ${c.isActive}`);
    console.log();
  });

  if (convs.length === 0) {
    console.log("⚠️  No conversations found in database!");
    console.log("This means the chat was never saved.");
    console.log("\nPossible reasons:");
    console.log("  1. Socket connection failed (token issue)");
    console.log("  2. The conversation was never created via POST /chat/conversations");
    console.log("  3. Messages sent via socket but socket auth failed");
  }

  // Check all users
  const users = await User.find({}, "name email role");
  console.log("\n--- All Users ---");
  users.forEach(u => console.log(`  ${u.name} (${u.role}) [${u._id}]`));

  await mongoose.disconnect();
}

checkChats().catch(console.error);
