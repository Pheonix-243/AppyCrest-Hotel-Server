// const express = require("express");
// const bcrypt = require("bcryptjs");
// const userModel = require("../models/userModel.js");

// const registerUser = async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     const userExists = await userModel.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new userModel({
//       name,
//       email,
//       password: hashedPassword,
//     });

//     const savedUser = await newUser.save();
//     // res.send("User registration succesfully");
//     res.status(201).json({
//       _id: savedUser._id,
//       name: savedUser.name,
//       email: savedUser.email,
//       isAdmin: savedUser.isAdmin,
//       createdAt: savedUser.createdAt,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await userModel.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     res.send(user);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Add this
const userModel = require("../models/userModel.js");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id }, "ohmyGod", {
      expiresIn: "30d", // Token expires in 30 days
    });

    // Send the response with the token
    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      isAdmin: savedUser.isAdmin,
      createdAt: savedUser.createdAt,
      token, // Include the token in the response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // Check if the user is active
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Please contact support." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, "ohmyGod", {
      expiresIn: "30d", // Token expires in 30 days
    });

    // Send the response with the token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token, // Include the token in the response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await userModel.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
