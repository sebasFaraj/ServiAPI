const mongoose = require('mongoose');

//Slot (Availability) Schema
const slotSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true, min: 0, max: 6 },               // 0 = Sunday
    start: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ }, // HH:MM
    end: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ }
  },
  { _id: false }
);

//This schema 

/* Optional – make sure end is after start */
slotSchema.pre('validate', function (next) {
  if (this.start && this.end && this.start >= this.end) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

/* ---------- Independent Provider schema ---------- */
const independentProviderSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match:
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    password: { type: String, required: true, select: false },
    phone: {
      type: String,
      required: true,
      match: /^\+504\s\d{4}-\d{4}$/ // +504 ####-####
    },
    birthdate: {
      type: Date,
      required: true,
      validate: {
        validator: (d) => d instanceof Date && d < new Date(),
        message: 'Birthdate must be in the past'
      }
    },
    address: { type: String, required: true },
    serviceType: {
      type: String,
      required: true,
      enum: ['Driver', 'Cleaning']   // adjust as needed
    },
    bio: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    availability: {
      type: [slotSchema],
      default: [],
      validate: {
        validator: (arr) =>
          new Set(arr.map((s) => `${s.day}-${s.start}`)).size === arr.length,
        message: 'Duplicate day/start entries in availability'
      }
    }
  },
  { timestamps: true }
);

/* ---------- Model export ---------- */
module.exports = mongoose.model('indProvider', independentProviderSchema);
