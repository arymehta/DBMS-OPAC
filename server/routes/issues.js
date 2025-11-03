import express from "express"
import { connectDB } from "../db/dbconn.js"
import { getActiveIssuesByUid, getPastIssuesByUid, createIssue, returnBook, getTotalNumIssues } from "../controllers/issues.js"

const router = express.Router();

router.get("/active/:uid", getActiveIssuesByUid);
router.get("/past/:uid", getPastIssuesByUid);
router.post("/", createIssue);
router.patch("/:book_id/return", returnBook);
router.get("/total-issues", getTotalNumIssues);
export default router;
