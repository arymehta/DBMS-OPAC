import express from "express";
import { getBookDetails } from "../controllers/books.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching book with ID:", id);

    const bookDetails = await getBookDetails(id);

    if (!bookDetails || bookDetails.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json(bookDetails);
  } catch (error) {
    console.error("Error in /books/:id route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
