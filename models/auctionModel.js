import mongoose from "mongoose";

const { Schema } = mongoose;

const auctionSchema = new Schema({
  auctionerName: {
    type: String,
    required: [true, "Nama pelelang harus diisi"],
  },
  auctionAmount: {
    type: Number,
    required: [true, "Jumlah lelang harus diisi"],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;
