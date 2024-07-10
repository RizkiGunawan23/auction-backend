import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Nama harus diisi"],
  },
  username: {
    type: String,
    required: [true, "Username harus diisi"],
    unique: [true, "Username sudah digunakan"],
  },
  email: {
    type: String,
    required: [true, "Email harus diisi"],
    unique: [true, "Email sudah digunakan"],
    validate: {
      validator: validator.isEmail,
      message: "Input harus berformat email: contoh@mail.com",
    },
  },
  password: {
    type: String,
    required: [true, "Password harus diisi"],
    minLength: [8, "Password minimal 8 karakter"],
  },
  role: {
    type: String,
    enum: ["user", "owner"],
    default: "user",
  },
});

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
