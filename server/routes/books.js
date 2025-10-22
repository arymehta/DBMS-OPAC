import express from "express";
import { getBookDetails } from "../controllers/books.js";

const router = express.Router();

router.get("/:id", getBookDetails);

export default router;
