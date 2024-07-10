import User from "../models/userModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");

  res.status(200).json(users);
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const user = await User.create({
      name,
      username,
      email,
      password,
    });

    res.status(201).json(user);
  } catch (err) {
    // Tangani error duplicate key
    if (err.code === 11000) {
      const keyValue = err.keyValue;
      if (keyValue.username) {
        res
          .status(400)
          .json({
            message: `Username '${keyValue.username}' sudah digunakan.`,
          });
      } else if (keyValue.email) {
        res
          .status(400)
          .json({ message: `Email '${keyValue.email}' sudah terdaftar.` });
      } else {
        res.status(400).json({ message: "Duplicate key error" });
      }
    } else {
      res.status(500).json({ message: err.message }); // Internal server error for other errors
    }
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, username, email } = req.body;

  // Cek apakah ID valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "ID user tidak valid" });
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, username, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    if (err.code === 11000) {
      const keyValue = err.keyValue;
      if (keyValue.username) {
        res
          .status(400)
          .json({
            message: `Username '${keyValue.username}' sudah digunakan.`,
          });
      } else if (keyValue.email) {
        res
          .status(400)
          .json({ message: `Email '${keyValue.email}' sudah terdaftar.` });
      } else {
        res.status(400).json({ message: "Duplicate key error" });
      }
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Cek apakah ID valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID user tidak valid");
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    res.status(404);
    throw new Error("User tidak ditemukan");
  }

  res.status(200).json({ message: "User berhasil dihapus" });
});
