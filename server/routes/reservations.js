import express from "express";
import { connectDB } from "../db/dbconn.js"
import { createReservation, getReservationsByUid, cancelReservation } from "../controllers/reservations.js"

const router = express.Router();

router.post("/", createReservation);
router.get("/:uid", getReservationsByUid);
router.delete("/cancel/:reservation_id", cancelReservation);

export default router;
