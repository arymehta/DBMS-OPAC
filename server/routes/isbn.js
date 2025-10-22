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

        


const addBookByISBN = async ({ isbn_id, title, author, genre, publication, lang, pages, doc_type }) => {
    try{
        await connectDB();

        const result = await sql`
            INSERT INTO ISBN (isbn_id, title, author, genre, publication, lang, pages, doc_type)
            VALUES (${isbn_id}, ${title}, ${author}, ${genre}, ${publication}, ${lang}, ${pages}, ${doc_type})
            RETURNING *;
        `;

        return result[0];
    } catch (error) {
        console.error("Error adding book by ISBN:", error);
        throw error;
    }
}

router.post("/", async (req, res) => {
    try {
        const { isbn_id, title, author, genre, publication, lang, pages, doc_type } = req.body;

        if (!isbn_id || !title || !author || !lang) {
            return res.status(400).json({ error: "Missing required fields: isbn_id, title, author, lang" });
        }
        
        if (pages && pages <= 0) {
            return res.status(400).json({ error: "Pages must be greater than 0" });
        }
        
        const result = await addBookByISBN({ isbn_id, title, author, genre, publication, lang, pages, doc_type });
        
        res.status(201).json({ message: "Book added successfully", book: result });
    } catch (error) {
        console.error("Error in POST /isbn route:", error);
        if (error.code === '23505') {
            return res.status(409).json({ error: "Book with this ISBN already exists" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});


export default router;
