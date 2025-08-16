import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/relations.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      // sameSite: 'None',
      // secure: true
    });

    const userId = user.id;
    return res.status(201).json({
      success: true,
      user: { id: userId, name, email },
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      // sameSite: 'None',
      // secure: true
    });

    const { id, name } = user;

    return res.status(200).json({
      success: true,
      user: { id, name, email },
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
});

router.post("/refresh", async (req, res) => {
  if (!req.cookies.refreshToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const refreshToken = req.cookies.refreshToken;
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findByPk(decoded.id);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      // sameSite: 'None',
      // secure: true
    });

    const { id, name, email } = user;
    return res.status(200).json({
      success: true,
      user: { id, name, email },
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(403).json({ error: "Forbidden" });
  }
});

router.post("/logout", (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ error: "No token provided." });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      // sameSite: 'None',
      // secure: true
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
});

export default router;
