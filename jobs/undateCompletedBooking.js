const cron = require("node-cron");
const Booking = require("../models/bookingModel"); // Ensure this path is correct
const moment = require("moment");

// This function will run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Checking for bookings to update status...");

    // Find all bookings where the 'toDate' is in the past and status is not 'completed'
    const bookings = await Booking.find({
      toDate: { $lt: moment().format("YYYY-MM-DD") },
      status: { $ne: "Completed" },
    });

    if (bookings.length > 0) {
      for (const booking of bookings) {
        // Update the status to 'Completed' if the 'toDate' has passed
        booking.status = "Completed";
        await booking.save();
        console.log(`Booking ${booking._id} status updated to 'Completed'.`);
      }
    } else {
      console.log("No bookings to update.");
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});
