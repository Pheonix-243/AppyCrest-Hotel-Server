const express = require("express");
const router = express.Router();
const axios = require("axios"); // To verify payment via Paystack API
const Booking = require("../models/bookingModel");
const Room = require("../models/roomModel");

// Assuming the Paystack secret key is stored in an environment variable
const PAYSTACK_SECRET_KEY = "sk_test_32062853cfea07c46202bba1b3600995f67c4c40";

// Route to create a booking (now including Paystack payment)
router.post("/", async (req, res) => {
  const {
    room,
    roomid,
    userid,
    fromDate,
    toDate,
    totalAmount,
    totalDays,
    transactionId,
  } = req.body;

  try {
    // Verify Paystack payment using the payment reference
    const verificationResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, amount } = verificationResponse.data.data;

    if (status === "success" && amount === totalAmount * 100) {
      // Create a new booking after payment success
      const newBooking = new Booking({
        room: room.name,
        roomid,
        userid,
        fromDate,
        toDate,
        totalAmount,
        totalDays,
        transactionId: transactionId,
      });

      const booking = await newBooking.save();

      // Update the room's currentBookings
      const roomTemp = await Room.findOne({ _id: roomid });
      roomTemp.currentBookings.push({
        bookingid: booking._id,
        fromDate,
        toDate,
        userid,
        status: booking.status,
      });

      await roomTemp.save();
      res.status(201).json(booking); // Send the booking response
    } else {
      res.status(400).json({ error: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error creating booking or verifying payment:", error);
    res.status(500).json({ error: "Booking failed" });
  }
});

// Paystack webhook for payment verification (in case of event triggers)
router.post("/paystack-webhook", async (req, res) => {
  const { event, data } = req.body;

  if (event === "charge.success") {
    const { reference } = data;

    try {
      const verificationResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const { status, amount } = verificationResponse.data.data;

      if (status === "success") {
        const booking = await Booking.findOne({ transactionId: reference });

        if (booking) {
          booking.status = "confirmed";
          await booking.save();
          res.status(200).send("Payment confirmed and booking updated");
        } else {
          res.status(400).send("Invalid booking reference");
        }
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).send("Server error");
    }
  } else {
    res.status(400).send("Unhandled event type");
  }
});

// Route to get all bookings
router.get("/getallbookings", async (req, res) => {
  try {
    const bookings = await Booking.find(); // Fetch all bookings
    res.status(200).json(bookings); // Send all bookings in the response
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Route to get bookings by user ID
router.get("/getbookingsbyuserid/:userid", async (req, res) => {
  const { userid } = req.params;
  try {
    const bookings = await Booking.find({ userid }); // Find bookings by user ID
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings for user" });
  }
});

router.post("/cancelbooking", async (req, res) => {
  const { bookingId } = req.body;

  try {
    // Find the booking by ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if the booking is already cancelled
    if (booking.status === "Cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    // Refund the payment using Paystack's refund API
    // const refundResponse = await axios.post(
    //   `https://api.paystack.co/refund`,
    //   { transaction: booking.transactionId, amount: booking.totalAmount * 100 }, // Amount in kobo (smallest unit)
    //   { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    // );

    // if (refundResponse.data.status !== "success") {
    //   return res.status(400).json({ error: "Refund failed" });
    // }

    // Mark the booking as cancelled
    booking.status = "Cancelled";
    await booking.save();

    // Remove the booking from the room's currentBookings
    const room = await Room.findOne({ _id: booking.roomid });
    if (room) {
      room.currentBookings = room.currentBookings.filter(
        (currentBooking) => currentBooking.bookingid.toString() !== bookingId
      );
      await room.save();
    }

    res
      .status(200)
      .json({ message: "Booking cancelled and refund issued successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

module.exports = router;
