import express from "express";

import { getBookDetailsByISBN } from "../controllers/books.js";
import { connectDB } from "../db/dbconn.js";

const router = express.Router();

router.get("/:isbn", async (req, res) => {
  try {
    const { isbn } = req.params;
    console.log(isbn);

    const bookDetails = await getBookDetailsByISBN(isbn);
    if (!bookDetails || bookDetails.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json(bookDetails);
  } catch (error) {
    console.error("Error in /isbn/:isbn route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

        


export default router;
