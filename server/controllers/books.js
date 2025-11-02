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


const getTotalNumBooks = async (req, res) => {
  try {
    await connectDB();
    const result = await sql`
        SELECT COUNT(*)::int AS total_books
        FROM BOOKS
    `;
    res.status(200).json({data : result[0].total_books});
  } catch (error) {
    console.error("Error fetching total number of books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { getBookDetails, getTotalNumBooks };