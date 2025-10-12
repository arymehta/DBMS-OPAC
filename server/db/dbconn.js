import postgres from 'postgres'
import dotenv from 'dotenv'
dotenv.config();

const connstring = process.env.DATABASE_URL;

const connectDB = async () => {
  try {
    const sql = postgres(connstring);
    console.log("Database connected successfully");
    return sql;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

const sql = connectDB();
export default sql