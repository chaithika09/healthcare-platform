const Notification = require("../models/Notification");

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, unreadOnly } = req.query;
    const query = { recipient: req.user._id };
    if (unreadOnly === "true") query.isRead = false;

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    const notifications = await Notification.find(query)
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: { notifications, unreadCount, pagination: { total, page: parseInt(page), limit: parseInt(limit) } } });
  } catch (error) { next(error); }
};

exports.markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, data: { notification: notif } });
  } catch (error) { next(error); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) { next(error); }
};
