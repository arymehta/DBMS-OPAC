import sql, { connectDB } from "../db/dbconn.js";

export const getBookDetails = async (bookId) => {
  try {
    await connectDB();

    console.log("Fetching details for book ID:", bookId);
    const bookDetails = await sql`
      SELECT *
      FROM BOOKS
      JOIN BOOK_DETAILS ON BOOKS.book_id = BOOK_DETAILS.book_id
      JOIN ISBN ON BOOK_DETAILS.isbn_id = ISBN.isbn_id
      WHERE BOOKS.book_id = ${bookId};
    `;

    return bookDetails;
  } catch (error) {
    console.error("Error fetching book details:", error);
    throw error;
  }
};

export const getBookDetailsByISBN = async (isbnId) => {
  try {
    await connectDB();

    console.log("Fetching details for ISBN ID:", isbnId);
    const bookDetails = await sql`
      SELECT *
      FROM BOOKS
      JOIN BOOK_DETAILS ON BOOKS.book_id = BOOK_DETAILS.book_id
      JOIN ISBN ON BOOK_DETAILS.isbn_id = ISBN.isbn_id
      WHERE ISBN.isbn_id = ${isbnId}
    `;
    

    return bookDetails;
  } catch (error) {
    console.error("Error fetching book details by ISBN:", error);
    throw error;
  }
};