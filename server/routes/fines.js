import express from "express";
import { getFinesByUser, getFineDetails, payFine } from "../controllers/fines.js";

const router = express.Router();

router.get("/user/:userId", getFinesByUser);
router.get("/:fineId", getFineDetails);
router.post("/pay/:fineId", payFine);

export default router;
