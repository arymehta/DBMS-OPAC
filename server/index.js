import express from "express";
import dotenv from "dotenv";
import { initDB } from "./db/initdb.js";
import catalogRoutes from "./routes/catalog.js";
import bookRoutes from "./routes/books.js";
import authRoutes from "./routes/auth.js";

const app = express();

dotenv.config();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use("/catalog", catalogRoutes);
app.use("/books", bookRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the DBMS OPAC API");
});

app.listen(PORT, () => {
  initDB();
  console.log(`Server is running on port ${PORT}`);
});