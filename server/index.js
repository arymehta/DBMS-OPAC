import express from "express";
import dotenv from "dotenv";
import { initDB } from "./db/initdb.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

// deleteDB()
app.get("/", (req, res) => {
  res.send("Welcome to the DBMS OPAC API");
});

app.listen(PORT, () => {
  initDB();
  console.log(`Server is running on port ${PORT}`);
});