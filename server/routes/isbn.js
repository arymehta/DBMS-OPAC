import express from "express";
import { connectDB } from "../db/dbconn.js";
import { addBookByISBN, getBookDetailsByISBN } from "../controllers/isbn.js";

const router = express.Router();

router.post("/add", addBookByISBN);
router.get("/details/:id", getBookDetailsByISBN);


export default router;
