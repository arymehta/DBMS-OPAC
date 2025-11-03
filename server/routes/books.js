import express from "express";
import { getBookDetails, getTotalNumBooks } from "../controllers/books.js";

const router = express.Router();

router.get("/:id", getBookDetails);
router.get("/get/total-books", getTotalNumBooks);


export default router;
