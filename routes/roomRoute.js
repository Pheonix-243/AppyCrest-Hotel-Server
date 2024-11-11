const express = require("express");
const router = express.Router();
const Room = require("../models/roomModel");

router.get("/getallrooms", async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.send(rooms);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/getroombyid", async (req, res) => {
  const roomid = req.query.roomid.trim();

  try {
    const room = await Room.findOne({ _id: roomid });
    res.send(room);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
