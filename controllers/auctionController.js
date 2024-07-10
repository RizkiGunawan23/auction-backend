import Auction from "../models/auctionModel.js";
import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";
import xlsx from "xlsx";
import fs from "fs"; // Untuk menghapus file sementara

// Membuat lelang baru
export const createAuction = asyncHandler(async (req, res) => {
  const { auctionerName, auctionAmount } = req.body;

  const auction = await Auction.create({
    auctionerName,
    auctionAmount,
    createdBy: req.user._id, // Menyimpan ID user yang membuat lelang
  });

  res.status(201).json(auction);
});

// Mendapatkan lelang milik user tertentu
export const getAuctionByUser = asyncHandler(async (req, res) => {
  const auctions = await Auction.find({ createdBy: req.user._id });

  res.status(200).json(auctions);
});

// Mengupdate lelang berdasarkan ID
export const updateAuction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { auctionerName, auctionAmount } = req.body;

  // Cek apakah ID valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID lelang tidak valid");
  }

  // Temukan lelang berdasarkan ID
  let auction = await Auction.findById(id);

  if (!auction) {
    res.status(404);
    throw new Error("Lelang tidak ditemukan");
  }

  // Periksa kepemilikan lelang
  if (auction.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Anda tidak diizinkan mengupdate lelang ini");
  }

  // Update lelang
  auction = await Auction.findByIdAndUpdate(
    id,
    { auctionerName, auctionAmount },
    { new: true, runValidators: true }
  );

  res.status(200).json(auction);
});

// Menghapus lelang berdasarkan ID
export const deleteAuction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Cek apakah ID valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("ID lelang tidak valid");
  }

  // Temukan lelang berdasarkan ID
  let auction = await Auction.findById(id);

  if (!auction) {
    res.status(404);
    throw new Error("Lelang tidak ditemukan");
  }

  // Periksa kepemilikan lelang
  if (auction.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Anda tidak diizinkan menghapus lelang ini");
  }

  // Hapus lelang
  await Auction.findByIdAndDelete(id);

  res.status(200).json({ message: "Lelang berhasil dihapus" });
});

// Mengimpor data lelang dari file Excel
export const importExcelAuction = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("File Excel tidak ditemukan");
  }

  // Hapus data lelang yang terkait dengan req.user._id sebelum mengimpor data baru
  await Auction.deleteMany({ createdBy: req.user._id });

  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0]; // Ambil sheet pertama saja
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Baris header dalam Excel (indeks 3 dalam array JSON)
  const headerRow = jsonData[3];
  const snameIndex = headerRow.indexOf("SNAME");
  const auctionAmountIndex = headerRow.indexOf("BERAPA X LELANG");

  if (snameIndex === -1 || auctionAmountIndex === -1) {
    res.status(400);
    throw new Error(
      "Kolom 'SNAME' atau 'BERAPA X LELANG' tidak ditemukan dalam file Excel"
    );
  }

  // Mulai membaca data dari baris kelima (indeks 4 dalam array JSON)
  const startRow = 4;
  const dataToProcess = jsonData.slice(startRow);

  // Proses setiap baris data dari Excel
  for (let row of dataToProcess) {
    const SNAME = row[snameIndex];
    const auctionAmount = row[auctionAmountIndex];

    // Validasi data
    if (!SNAME || !auctionAmount) {
      continue; // Lewati baris yang tidak valid
    }

    try {
      // Cari lelang yang sesuai dengan nama pelelang (SNAME) dan ID pengguna yang sedang melakukan aksi
      const updatedAuction = await Auction.findOneAndUpdate(
        { auctionerName: SNAME, createdBy: req.user._id },
        { auctionerName: SNAME, auctionAmount: auctionAmount },
        { new: true, upsert: true } // Jika tidak ada, buat baru
      );
    } catch (error) {
      console.error(error);
    }
  }

  // Hapus file sementara setelah selesai
  fs.unlinkSync(req.file.path);

  res.status(200).json({ message: "Import Excel berhasil" });
});
