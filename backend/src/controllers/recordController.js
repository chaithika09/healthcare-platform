const MedicalRecord = require("../models/MedicalRecord");
const path = require("path");
const fs   = require("fs");

// ── Upload Record ─────────────────────────────────────────────
exports.upload = async (req, res, next) => {
  try {
    const {
      title, description, type, category,
      reportDate, date,
      doctor, doctorName, hospital, notes, tags
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one file is required" });
    }

    const files = req.files.map((f) => ({
      originalName: f.originalname,
      storedName:   f.filename,
      path:         f.path,
      mimeType:     f.mimetype,
      size:         f.size,
      url:          `/uploads/${req.user._id}/${f.filename}`,
    }));

    const record = await MedicalRecord.create({
      patient:    req.user._id,
      uploadedBy: req.user._id,
      title:      title || "Untitled Report",
      description,
      type:       type || "other",
      category,
      files,
      reportDate: reportDate || date ? new Date(reportDate || date) : new Date(),
      doctor:     doctor || doctorName || "",
      hospital,
      notes,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    });

    res.status(201).json({ success: true, message: "Record uploaded", data: { record } });
  } catch (error) {
    next(error);
  }
};

// ── Get All Records ───────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20, search } = req.query;
    const query = { patient: req.user._id };
    if (type) query.type = type;
    if (search) query.title = { $regex: search, $options: "i" };

    const total   = await MedicalRecord.countDocuments(query);
    const records = await MedicalRecord.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { records, pagination: { total, page: parseInt(page), limit: parseInt(limit) } },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Single Record ─────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    if (record.patient.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, data: { record } });
  } catch (error) {
    next(error);
  }
};

// ── Delete Record ─────────────────────────────────────────────
exports.delete = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    if (record.patient.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Delete physical files
    record.files.forEach((f) => {
      if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
    });

    await record.deleteOne();
    res.json({ success: true, message: "Record deleted" });
  } catch (error) {
    next(error);
  }
};
