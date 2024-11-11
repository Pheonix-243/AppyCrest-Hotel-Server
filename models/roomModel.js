const mongoose = require("mongoose");

const roomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    maxCount: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    rentPerDay: { type: Number, required: true },
    imageUrls: [],
    amenities: [],
    currentBookings: [],
    type: { type: String, required: true },
    desc: { type: String, required: true },
    longDesc: { type: String },
  },
  {
    timestamps: true,
  }
);

const roomModel = mongoose.model("rooms", roomSchema);

module.exports = roomModel;
