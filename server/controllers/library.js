import sql, { connectDB } from "../db/dbconn.js";

const getAllLibraries = async (req, res) => {
  try {
    await connectDB();
    const libraries = await sql`SELECT library_id, name, city, state FROM LIBRARY ORDER BY name`;
    return res.status(200).json({ message: "Libraries fetched successfully", data: libraries });
  } catch (error) {
    console.error("Error fetching libraries:", error);
    return res.status(500).json({ message: error.message });
  }
};

const addLibrary = async (req, res) => {
  try {
    await connectDB();

    const { name, street, city, state, zip_code, contact_number, email, opening_hours, closing_hours } = req?.body;
    const query = await sql`
      INSERT INTO LIBRARY (name, street, city, state, zip_code, contact_number, email, opening_hours, closing_hours) VALUES
      (${name}, ${street}, ${city}, ${state}, ${zip_code}, ${contact_number}, ${email}, ${opening_hours}, ${closing_hours});
    `;
    return res.status(201).json({ message: "Library added successfully", data: query });
  } catch (error) {
    console.error("Error Adding library:", error);
    return res.status(500).json({ message: error.message });
  }
};

export { addLibrary, getAllLibraries };
