const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    if (!username || !firstname || !lastname || !password) {
      return res.status(400).json({
        success: false,
        message: "please fill all fields"
      });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "username already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      password: hashed
    });

    return res.status(201).json({
      success: true,
      message: "signup successful",
      user: {
        _id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        createdon: user.createdon
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "username already exists" });
    }
    return res.status(500).json({ success: false, message: "server error", error: err.message });
  }
});

module.exports = router;
