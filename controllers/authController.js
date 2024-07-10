import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "6d",
  });
};

const createSendResToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const isDev = process.env.NODE_ENV === "development" ? false : true;

  const cookiesOption = {
    expire: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    security: isDev,
  };

  res.cookie("jwt", token, cookiesOption);

  user.password = undefined;

  res.status(statusCode).json({
    user,
    token,
  });
};

export const checkUser = asyncHandler(async (req, res) => {
  const hasUser = (await User.countDocuments()) > 0;

  res.json({ hasUser });
});

export const registerUser = asyncHandler(async (req, res) => {
  // Periksa apakah sudah ada user terdaftar
  const anyUserRegistered = await isAnyUserRegistered();

  // Jika sudah ada user terdaftar, kirim pesan kesalahan
  if (anyUserRegistered) {
    res.status(403); // Forbidden
    throw new Error("Registrasi tidak diizinkan.");
  }

  const { name, username, email, password } = req.body;

  const role = "owner";

  const createUser = await User.create({
    name: name,
    username: username,
    email: email,
    password: password,
    role: role,
  });

  // Kirim respons seperti sebelumnya
  createSendResToken(createUser, 201, res);
});

export const loginUser = asyncHandler(async (req, res) => {
  const { credential, password } = req.body;

  if (!credential || !password) {
    res.status(400);
    throw new Error("Kolom input tidak boleh kosong");
  }

  const userData = await User.findOne({
    $or: [{ username: credential }, { email: credential }],
  });

  if (userData && (await userData.comparePassword(password))) {
    createSendResToken(userData, 200, res);
  } else {
    res.status(400);
    throw new Error("User tidak valid");
  }
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  if (req.user) {
    console.log({
      user: req.user,
    });
    return res.status(200).json({
      user: req.user,
    });
  } else {
    res.status(404);
    throw new Error("User tidak ditemukan");
  }
});

export const logoutUser = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json({
    message: "Logout berhasil",
  });
};
