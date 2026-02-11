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

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "username and password are required"
        });
        }

        const user = await User.findOne({ username: username.trim() });
        if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
            _id: user._id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            createdon: user.createdon
        }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

module.exports = router;
