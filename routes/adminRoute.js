const express = require("express");
const router = express.Router();
const { protect, adminMiddleware } = require("../middleware/authMiddleware");
const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");
const User = require("../models/userModel");

// Get all bookings
router.get(
  "/admin/getallbookings",
  protect,
  adminMiddleware,
  async (req, res) => {
    try {
      const bookings = await Booking.find();
      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  }
);

// Route to get live bookings
router.get(
  "/admin/getlivebookings",
  protect,
  adminMiddleware,
  async (req, res) => {
    try {
      const liveBookings = await Booking.find({ status: "Booked" });
      res.status(200).json(liveBookings);
    } catch (error) {
      console.error("Error fetching live bookings:", error);
      res.status(500).json({ error: "Failed to fetch live bookings" });
    }
  }
);

// Get all users
router.get("/admin/getallusers", protect, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Toggle admin status
router.put(
  "/admin/toggleadmin/:id",
  protect,
  adminMiddleware,
  async (req, res) => {
    const { id } = req.params;
    const { isAdmin } = req.body;

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.isAdmin = isAdmin;
      await user.save();
      res.status(200).json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  }
);

// Toggle user active status
router.put(
  "/admin/toggleuser/:id",
  protect,
  adminMiddleware,
  async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.isActive = !user.isActive; // Toggle the isActive status
      await user.save();

      res.status(200).json({
        message: `User ${
          user.isActive ? "activated" : "deactivated"
        } successfully`,
        user,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ error: "Failed to toggle user status" });
    }
  }
);

// Delete a user
router.delete(
  "/admin/deleteuser/:id",
  protect,
  adminMiddleware,
  async (req, res) => {
    const { id } = req.params;

    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
);

module.exports = router;

// Cancel a booking
router.post(
  "/admin/cancelbooking",
  protect,
  adminMiddleware,
  async (req, res) => {
    const { bookingId } = req.body;

    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status === "Cancelled") {
        return res.status(400).json({ error: "Booking is already cancelled" });
      }

      booking.status = "Cancelled";
      await booking.save();

      const room = await Room.findOne({ _id: booking.roomid });
      if (room) {
        room.currentBookings = room.currentBookings.filter(
          (currentBooking) => currentBooking.bookingid.toString() !== bookingId
        );
        await room.save();
      }

      res.status(200).json({ message: "Booking cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ error: "Failed to cancel booking" });
    }
  }
);

// Add a room
router.post("/admin/addroom", protect, adminMiddleware, async (req, res) => {
  const {
    name,
    maxCount,
    phoneNumber,
    rentPerDay,
    imageUrls,
    amenities,
    type,
    desc,
  } = req.body;

  try {
    const processedImageUrls = Array.isArray(imageUrls)
      ? imageUrls
      : typeof imageUrls === "string"
      ? imageUrls.split(",").map((url) => url.trim())
      : [];

    const processedAmenities = Array.isArray(amenities)
      ? amenities
      : typeof amenities === "string"
      ? amenities.split(",").map((url) => url.trim())
      : [];

    const newRoom = new Room({
      name,
      maxCount,
      phoneNumber,
      rentPerDay,
      imageUrls: processedImageUrls,
      amenities: processedAmenities,
      type,
      desc,
    });

    const room = await newRoom.save();
    res.status(201).json(room);
  } catch (error) {
    console.error("Error adding room:", error);
    res.status(500).json({ error: "Failed to add room" });
  }
});

// Edit a room
router.put(
  "/admin/editroom/:id",
  protect,
  adminMiddleware,
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      maxCount,
      phoneNumber,
      rentPerDay,
      imageUrls,
      amenities,
      type,
      desc,
    } = req.body;

    try {
      const room = await Room.findById(id);

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const processedImageUrls = Array.isArray(imageUrls)
        ? imageUrls
        : typeof imageUrls === "string"
        ? imageUrls.split(",").map((url) => url.trim())
        : room.imageUrls;

      const processedAmenities = Array.isArray(amenities)
        ? amenities
        : typeof amenities === "string"
        ? amenities.split(",").map((url) => url.trim())
        : room.amenities;

      room.name = name;
      room.maxCount = maxCount;
      room.phoneNumber = phoneNumber;
      room.rentPerDay = rentPerDay;
      room.imageUrls = processedImageUrls;
      room.amenities = processedAmenities;
      room.type = type;
      room.desc = desc;

      await room.save();

      res.status(200).json(room);
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ error: "Failed to update room" });
    }
  }
);

// Delete a booking
router.delete(
  "/admin/deletebooking/:id",
  protect,
  adminMiddleware,
  async (req, res) => {
    const { id } = req.params;

    try {
      const booking = await Booking.findByIdAndDelete(id);

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Failed to delete booking" });
    }
  }
);

// Get all rooms

router.get("/admin/getallrooms", protect, adminMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

module.exports = router;
