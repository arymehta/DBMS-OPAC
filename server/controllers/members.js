import express from "express"
import sql from "../db/dbconn.js"
import { connectDB } from "../db/dbconn.js"

const getNumMembers = async (req, res) => {
  try {
    await connectDB();
    const result = await sql`
        SELECT COUNT(*)::int AS total_members
        FROM USERS
        WHERE role = 'ISSUER'
    `;
    console.log("Total members fetched:", result[0].total_members);
    res.status(200).json({data : result[0].total_members});
  } catch (error) {
    console.error("Error fetching number of members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { getNumMembers };