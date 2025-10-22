import express from "express";
import { getCatalog, searchCatalog } from "../controllers/catalog.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log("here");
    const catalog = await getCatalog();
    return res.status(200).json({ data: catalog });
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return res.status(500).json({ error: "Failed to fetch catalog" });
  }
});


router.post("/", async (req, res) => {

  try {
    const q = req?.body || {};
    const searchResults = await searchCatalog(q);
    // console.log(searchResults);
    // console.log("Returning search results");
    return res.status(200).json({data: searchResults});
  } catch (error) {
    console.error("Error searching catalog:", error);
    return res.status(500).json({ error: "Failed to search catalog" });
  }
});

export default router;