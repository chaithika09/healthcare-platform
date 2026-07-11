const LabBooking = require("../models/LabTest");

exports.getTests = async (req, res, next) => {
  try {
    const tests = [
      { id: 1, name: "Complete Blood Count (CBC)", category: "Hematology",    price: 25, duration: "Same day", fasting: false },
      { id: 2, name: "Lipid Profile",              category: "Biochemistry",  price: 35, duration: "Same day", fasting: true  },
      { id: 3, name: "HbA1c (Diabetes)",           category: "Endocrinology", price: 30, duration: "Same day", fasting: false },
      { id: 4, name: "Thyroid Function (TSH)",     category: "Endocrinology", price: 40, duration: "Same day", fasting: false },
      { id: 5, name: "Liver Function Test (LFT)",  category: "Biochemistry",  price: 45, duration: "Same day", fasting: true  },
      { id: 6, name: "Kidney Function Test",       category: "Nephrology",    price: 40, duration: "Same day", fasting: false },
      { id: 7, name: "Urine Routine Analysis",     category: "Pathology",     price: 15, duration: "2 hours",  fasting: false },
      { id: 8, name: "COVID-19 RT-PCR",            category: "Virology",      price: 50, duration: "24 hours", fasting: false },
    ];
    res.json({ success: true, data: { tests } });
  } catch (error) { next(error); }
};

exports.book = async (req, res, next) => {
  try {
    const { tests, date, timeSlot, homeCollection, address } = req.body;
    const totalAmount = tests.reduce((s, t) => s + t.price, 0) + (homeCollection ? 10 : 0);

    const booking = await LabBooking.create({
      patient: req.user._id,
      tests, date: new Date(date), timeSlot,
      homeCollection, address, totalAmount,
    });

    res.status(201).json({ success: true, message: "Lab tests booked", data: { booking } });
  } catch (error) { next(error); }
};

exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await LabBooking.find({ patient: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { bookings } });
  } catch (error) { next(error); }
};
