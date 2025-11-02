import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import bodyParser from 'body-parser';


import { initDB } from "./db/initdb.js";
import catalogRoutes from "./routes/catalog.js";
import bookRoutes from "./routes/books.js";
import isbnRoutes from "./routes/isbn.js";
import authRoutes from "./routes/auth.js";
import reservationRoutes from "./routes/reservations.js";
import fineRoutes from "./routes/fines.js";
import scheduleFineJob from "./utils/fineCronJob.js";
import issueRoutes from "./routes/issues.js";
import memberRoutes from "./routes/members.js";


const app = express();

dotenv.config();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/catalog", catalogRoutes);
app.use("/books", bookRoutes);
app.use("/isbn", isbnRoutes);
app.use("/auth", authRoutes);
app.use("/reservations", reservationRoutes);
app.use("/fines", fineRoutes);
app.use("/members", memberRoutes);



scheduleFineJob();

app.use("/issues", issueRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the DBMS OPAC API");
});

app.listen(PORT, async () => {
  await initDB();
  console.log(`Server is running on port ${PORT}`);
});