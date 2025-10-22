import express from "express";
import { getCatalog, searchCatalog } from "../controllers/catalog.js";

const router = express.Router();

router.get("/", getCatalog);
router.post("/", searchCatalog);

export default router;