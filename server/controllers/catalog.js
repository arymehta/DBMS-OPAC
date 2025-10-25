import sql, { connectDB } from "../db/dbconn.js";

const getCatalog = async (req, res) => {
  try {
    await connectDB();
    const catalog = await sql`
      SELECT *
      FROM CATALOG
      JOIN BOOKS ON CATALOG.book_id = BOOKS.book_id
      JOIN ISBN ON BOOKS.isbn_id = ISBN.isbn_id
      JOIN LIBRARY ON CATALOG.library_id = LIBRARY.library_id;
    `;
    return res.status(200).json(catalog);
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return res.status(500).json({ error: "Failed to fetch catalog" });
  }
};

const authorFilter = (author, conditions) => {
  if (author) {
    conditions.push(sql`ISBN.author ILIKE ${'%' + author + '%'}`);
  }
};

const titleFilter = (title, conditions) => {
  if (title) {
    conditions.push(sql`ISBN.title ILIKE ${'%' + title + '%'}`);
  }
};

const genreFilter = (genre, conditions) => {
  if (genre) {
    conditions.push(sql`ISBN.genre ILIKE ${'%' + genre + '%'}`);
  }
};

const languageFilter = (language, conditions) => {
  if (language) {
    conditions.push(sql`ISBN.lang ILIKE ${'%' + language + '%'}`);
  }
};

const docTypeFilter = (docType, conditions) => {
  if (docType) {
    conditions.push(sql`ISBN.doc_type ILIKE ${'%' + docType + '%'}`);
  }
};

const libraryFilter = (library_id, conditions) => {
  if (library_id) {
    conditions.push(sql`LIBRARY.library_id = ${library_id}`);
  }
};

const publicationFilter = (publication, conditions) => {
  if (publication) {
    conditions.push(sql`ISBN.publication ILIKE ${'%' + publication + '%'}`);
  }
};

const availabilityFilter = (availability, conditions) => {
  if (availability) {
    if (availability === "available") {
      conditions.push(sql`BOOKS.status = 'AVAILABLE'`);
    } else if (availability === "unavailable") {
      conditions.push(sql`BOOKS.status = 'ISSUED'`);
    }
  };
}


const applyFilters = (q, conditions) => {
  authorFilter(q.author, conditions);
  titleFilter(q.title, conditions);
  genreFilter(q.genre, conditions);
  languageFilter(q.language, conditions);
  docTypeFilter(q.docType, conditions);
  libraryFilter(q.library_id, conditions);
  availabilityFilter(q.availability, conditions);
  publicationFilter(q.publication, conditions);
};

const searchCatalog = async (req, res) => {
  try {
    const q = req.body || {};
    console.log("Search Catalog Called");
    console.log("Search Query:", q);

    await connectDB();

    const conditions = [];
    applyFilters(q, conditions);

    // Build WHERE clause - if no conditions, select all
    const whereClause = conditions.length > 0
      ? conditions.reduce((acc, condition, index) => {
          if (index === 0) return condition;
          return sql`${acc} AND ${condition}`;
        })
      : sql`TRUE`;

    const result = await sql`
      SELECT *
      FROM CATALOG
      JOIN BOOKS ON CATALOG.book_id = BOOKS.book_id
      JOIN ISBN ON BOOKS.isbn_id = ISBN.isbn_id
      JOIN LIBRARY ON CATALOG.library_id = LIBRARY.library_id
      WHERE ${whereClause}
    `;

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error searching catalog:", error);
    return res.status(500).json({ error: "Failed to search catalog" });
  }
};

export { getCatalog, searchCatalog };