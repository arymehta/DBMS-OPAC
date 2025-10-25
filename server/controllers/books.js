import sql, { connectDB } from "../db/dbconn.js";

const getBookDetails = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    console.log("Fetching book with ID:", id);

    const bookDetails = await sql`
      SELECT *
      FROM BOOKS
      JOIN ISBN ON BOOKS.isbn_id = ISBN.isbn_id
      WHERE BOOKS.book_id = ${id};
    `;

    if (!bookDetails) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(bookDetails);
  } catch (error) {
    console.error("Error fetching book details:", error);
    return res.status(500).json({ message: error.message });
  }
};

export { getBookDetails };