const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// Import the database connection function
const connectDB = require("./config/db");

// Initialize the express app
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Import Routes
const roomsRoutes = require("./routes/roomRoute");
const userRoute = require("./routes/userRoute");
const bookingRoute = require("./routes/bookingRoute"); // Make sure to use this
const adminRoutes = require("./routes/adminRoute"); // ADD the admin routes here

// Define the port
const PORT = process.env.PORT || 5003;

// Connect to the database
connectDB();

// API routes
app.use("/api/rooms", roomsRoutes);
app.use("/api/users", userRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api", adminRoutes); // Add this line to include admin routes
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`); // Log the error message
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
