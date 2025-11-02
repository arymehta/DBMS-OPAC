import express from "express"
import { getNumMembers } from "../controllers/members.js";
import { connectDB } from "../db/dbconn.js"

const router = express.Router();

router.get("/num-members", getNumMembers);

export default router;

