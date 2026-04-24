const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");


const register = (req, res) => {
    const { name, email, password , role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide name, email and password" });
    }
    userModel.findOne({ email }).then((user) => {
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Hash the password
        bcrypt.hash(password, 10).then((hashedPassword) => {
            // Create a new user
            const newUser = new userModel({
                name,
                email,
                password: hashedPassword,
                role
            });
            // Save the user to the database
            newUser.save().then((savedUser) => {
                return res.status(201).json({ message: "User created successfully", user: savedUser });
            }).catch((err) => {
                return res.status(500).json({ message: "Error creating user", error: err });
            });
        });
    }).catch((err) => {
        return res.status(500).json({ message: "Error finding user", error: err });
    });

};

const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" });
    }
    userModel.findOne({ email }).then((user) => {
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        bcrypt.compare(password, user.password).then((isMatch) => {
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.cookie("token", token, { httpOnly: true });
            return res.status(200).json({ message: "Login successful", token, user });
        });
    }).catch((err) => {
        return res.status(500).json({ message: "Error finding user", error: err });
    });

};

const me = (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
        userModel.findById(decoded.id).then((user) => {
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            return res.status(200).json({ user });
        }).catch((err) => {
            return res.status(500).json({ message: "Error finding user", error: err });
        });
    });
};

const logout = (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
};

module.exports = { register, login, me, logout };
