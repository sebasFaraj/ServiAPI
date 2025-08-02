const express = require("express");
const router = express.Router();
const Bookings = require("../models/booking");
const checkAuth = require("../middleware/check-auth"); // ⬅️ not used yet

// ───────────────── GET ROUTES ─────────────────────────────────────────

// Get every booking
router.get("/", async (req, res) => {
  try {
    const bookings = await Bookings.find().lean();
    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
});

// Get one booking
router.get("/:bookingID", async (req, res) => {
  try {
    const booking = await Bookings.findById(req.params.bookingID).lean();
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json({ message: "Booking Found", booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
});

// Get bookings by user
router.get("/users/:userID", async (req, res) => {
  try {
    const bookings = await Bookings.find({ client: req.params.userID }).lean();
    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings under this User" });
    }
    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
});

// Get bookings by driver
router.get("/drivers/:driverID", async (req, res) => {
  try {
    const bookings = await Bookings.find({
      driver: req.params.driverID,
    }).lean();
    if (!bookings.length) {
      return res
        .status(404)
        .json({ message: "No bookings found under this Driver" });
    }
    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
});

// ───────────────── POST ROUTES ───────────────────────────────────────

// Create a new booking
router.post("/newBooking", async (req, res) => {
  try {
    const {
      userID,
      pickup,
      dropoff,
      bookingDuration,
      userPrice,
      carPreference, // 'user' | 'driver'
      carId, // rider-owned car if carPreference === 'user'
      scheduledStart,
    } = req.body;

    // ── validation ─────────────────────────────────────────────
    if (!userID || !pickup || !dropoff || !carPreference || !scheduledStart) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!["user", "driver"].includes(carPreference)) {
      return res
        .status(400)
        .json({ message: "carPreference must be 'user' or 'driver'" });
    }
    if (carPreference === "user" && !carId) {
      return res
        .status(400)
        .json({ message: "carId required when carPreference is 'user'" });
    }

    // ── create booking doc ─────────────────────────────────────
    const booking = new Bookings({
      driver: null, // assigned when a driver accepts
      client: userID,
      pickup,
      dropoff,
      bookingDuration,
      status: "pending",
      userPrice,
      driverEarnings: 0,
      carPreference,
      car: carId ?? null,
      scheduledStart: scheduledStart ?? null,
    });

    const saved = await booking.save();
    return res.status(201).json({ message: "Booking Created", booking: saved });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ───────────────── DELETE ROUTES ────────────────────────────────────

router.delete("/removeBooking/:bookingID", async (req, res) => {
  try {
    const result = await Bookings.deleteOne({ _id: req.params.bookingID });
    if (!result.deletedCount) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json({ message: "Booking deleted", result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
});

// ───────────────── PATCH ROUTES (STATUS) ────────────────────────────

const setStatus = (status) => async (req, res) => {
  try {
    const result = await Bookings.updateOne(
      { _id: req.params.bookingID },
      { status }
    );
    if (!result.matchedCount) {
      return res.status(404).json({ message: "Can't find Booking" });
    }
    if (!result.modifiedCount) {
      return res.status(500).json({ message: "Can't update Booking" });
    }
    return res.status(200).json({ message: `Booking ${status}`, result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};

router.patch("/accept/:bookingID", setStatus("accepted"));
router.patch("/inProgress/:bookingID", setStatus("in_progress"));
router.patch("/completed/:bookingID", setStatus("completed"));
router.patch("/cancelled/:bookingID", setStatus("cancelled"));
router.patch("/noShow/:bookingID", setStatus("no_show"));

module.exports = router;
