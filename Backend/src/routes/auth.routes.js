const express = require("express");
const json = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookies = require("cookie-parser")

const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/logout", authController.logout);

router.get("/me", authController.me);

module.exports = router;