import postgres from 'postgres'
import dotenv from 'dotenv'
dotenv.config();

const connstring = process.env.DATABASE_URL;

const sql = postgres(connstring);

export const connectDB = async () => {
  try {
    await sql`SELECT 1`;
    console.log("Database connected successfully");
    return sql;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

export default sql;