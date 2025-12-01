import express from "express";
import { addLibrary, getAllLibraries } from "../controllers/library.js";

const router = express.Router();
router.get("/all", getAllLibraries);
router.post("/add", addLibrary);
    
export default router;
