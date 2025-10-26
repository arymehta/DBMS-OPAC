import express from "express"
import { connectDB } from "../db/dbconn.js"
import { getActiveIssuesByUid, getPastIssuesByUid, createIssue, returnBook } from "../controllers/issues.js"

const router = express.Router();

router.get("/active/:uid", getActiveIssuesByUid);
router.get("/past/:uid", getPastIssuesByUid);
router.post("/", createIssue);
router.patch("/:book_id/return", returnBook);

export default router;
