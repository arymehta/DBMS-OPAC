import sql, { connectDB } from "../db/dbconn.js";

export const getCatalog = async () => {
    await connectDB();

    const catalog = await sql`
      SELECT *
      FROM CATALOG
      JOIN BOOKS ON CATALOG.book_id = BOOKS.book_id
      JOIN BOOK_DETAILS ON BOOKS.book_id = BOOK_DETAILS.book_id
      JOIN ISBN ON BOOK_DETAILS.isbn_id = ISBN.isbn_id
      JOIN LIBRARY ON CATALOG.library_id = LIBRARY.library_id;
    `;
    return catalog;
};


const authorFilter = (author, conditions) => {
  if (!author) {
    conditions.push(sql`TRUE`);
  } else {
    conditions.push(sql`ISBN.author ILIKE ${'%' + author + '%'}`);
  }
  return
};

const titleFilter = (title, conditions) => {
  if (!title) {
    conditions.push(sql`TRUE`);
  } else {
    conditions.push(sql`ISBN.title ILIKE ${'%' + title + '%'}`);
  }
  return
};

const genreFilter = (genre, conditions) => {
  if (!genre) {
    conditions.push(sql`TRUE`);
  } else {
    conditions.push(sql`ISBN.genre ILIKE ${'%' + genre + '%'}`);
  }
  return
};

const languageFilter = (language, conditions) => {
  if (!language) {
    conditions.push(sql`TRUE`);
  } else {
    conditions.push(sql`ISBN.language ILIKE ${'%' + language + '%'}`);
  }
  return;
};

const docTypeFilter = (docType, conditions) => {
  if (!docType) {
    conditions.push(sql`TRUE`);
  } else {
    conditions.push(sql`ISBN.document_type ILIKE ${'%' + docType + '%'}`);
  }
  return
};

const libraryFilter = (library_id, conditions) => {
  if (!library_id) {
    conditions.push(sql`TRUE`);
  } else {
    conditions.push(sql`LIBRARY.library_id = ${library_id}`);
  }
  return
};

const availabilityFilter = (availability, conditions) => {
  if (!availability) {
    conditions.push(sql`TRUE`);
  } else if (availability === "available") {
    conditions.push(sql`CATALOG.available_copies > 0`);
  } else if (availability === "unavailable") {
    conditions.push(sql`CATALOG.available_copies = 0`);
  }
  return;
};

const applyFilters = (q, conditions) => {
  authorFilter(q.author, conditions);
  titleFilter(q.title, conditions);
  genreFilter(q.genre, conditions);
  languageFilter(q.language, conditions);
  docTypeFilter(q.docType, conditions);
  libraryFilter(q.library_id, conditions);
  availabilityFilter(q.availability, conditions);
  return
};


export const searchCatalog = async (q) => {
    console.log("Search Catalog Called");
    
    console.log("Search Query:", q);

    const conditions = [sql`TRUE`]; 

    applyFilters(q, conditions);
    const whereClause = conditions.reduce((acc, condition, index) => {
      if (index === 0) return condition;
      return sql`${acc} AND ${condition}`;
    });

    const result = await sql`
      SELECT *
      FROM CATALOG
      JOIN BOOKS ON CATALOG.book_id = BOOKS.book_id
      JOIN BOOK_DETAILS ON BOOKS.book_id = BOOK_DETAILS.book_id
      JOIN ISBN ON BOOK_DETAILS.isbn_id = ISBN.isbn_id
      JOIN LIBRARY ON CATALOG.library_id = LIBRARY.library_id
      WHERE ${whereClause}
    `;
    return result
} 