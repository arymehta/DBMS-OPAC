import sql, { connectDB } from "../db/dbconn.js";

const getBookDetailsByISBN = async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    console.log("Fetching book with ID:", id);

    const bookDetails = await sql`
            SELECT *
            FROM ISBN
            WHERE ISBN.isbn_id = ${id};
        `;
    console.log("Book details fetched:", bookDetails);
    if (!bookDetails || bookDetails.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(bookDetails);
  } catch (error) {
    console.error("Error fetching book details:", error);
    return res.status(500).json({ message: error.message });
  }
};


/* 
sample data to add book by isbn
{
    "isbn_id": 9780131103627,
    "title": "The C Programming Language",
    "author": "Brian W. Kernighan, Dennis M. Ritchie",
    "genre": "Programming",
    "publication": "Prentice Hall",
    "lang": "English",
    "pages": 272,
    "doc_type": "Paperback",
    "library_id": 1,
    "dewey_dec_loc": "005.13 KER"
}

*/

const addBookByISBN = async (req, res) => {
  try {
    const {
      isbn_id,
      title,
      author,
      genre,
      publication,
      lang,
      pages,
      doc_type,
      library_id,
      dewey_dec_loc,
    } = req.body;

    if (!isbn_id || !title || !author || !lang || !library_id) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: isbn_id, title, author, lang, library_id",
        });
    }

    if (pages && pages <= 0) {
      return res.status(400).json({ error: "Pages must be greater than 0" });
    }

    await connectDB();

    // Start transaction
    const result = await sql.begin(async (sql) => {
      // First, insert or get ISBN record
      const isbnResult = await sql`
                                INSERT INTO ISBN (isbn_id, title, author, genre, publication, lang, pages, doc_type)
                                VALUES (${isbn_id}, ${title}, ${author}, ${genre}, ${publication}, ${lang}, ${pages}, ${doc_type})
                                ON CONFLICT (isbn_id) DO NOTHING
                                RETURNING *;
                        `;

      // Create new physical book
      const bookResult = await sql`
                                INSERT INTO BOOKS (status, dewey_dec_loc, isbn_id)
                                VALUES ('AVAILABLE', ${dewey_dec_loc}, ${isbn_id})
                                RETURNING *;
                        `;

      const book_id = bookResult[0].book_id;
      // Add book to library catalog
      await sql`
                                INSERT INTO CATALOG (library_id, book_id)
                                VALUES (${library_id}, ${book_id});
                        `;

      return { isbn: isbnResult[0] || { isbn_id }, book: bookResult[0] };
    });

    res.status(201).json({
      message: "Book added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error adding book by ISBN:", error);
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: "Duplicate key constraint violation" });
    }
    if (error.code === "23503") {
      return res
        .status(400)
        .json({
          error: "Foreign key constraint violation - invalid library_id",
        });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export { getBookDetailsByISBN, addBookByISBN };
