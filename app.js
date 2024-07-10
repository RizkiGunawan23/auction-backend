import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import auctionRouter from "./routes/auctionRouter.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auction", auctionRouter);

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(process.env.DATABASE, {})
  .then(() => {
    console.log("Database Connected");
    app.listen(process.env.PORT, () => {
      console.log(`Aplikasi jalan di port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    throw err;
  });
