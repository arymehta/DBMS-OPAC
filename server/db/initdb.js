// Your table creation file
import sql from './dbconn.js'
import { connectDB } from "./dbconn.js"
import {populateDB} from './populateDB.js'
// =========== ENTITY SETS ==============


// Represents the students who can issue books and the admin who have special permissions
const createUser = async () => {
    const users = await sql`
    CREATE TABLE IF NOT EXISTS USERS
    (
      uid SERIAL, -- postgres uses SERIAL instead of AUTO_INCREMENT
      name VARCHAR(255) NOT NULL,
      books_issued INT DEFAULT 0,
      role VARCHAR(10) CHECK (role IN ('ISSUER', 'ADMIN')) DEFAULT 'ISSUER',
      PRIMARY KEY(uid)
    )
  `
    return users
}

// A library entity -- has multiple books associated with a single library
const createLibrary = async () => {
    const libraries = await sql`
    CREATE TABLE IF NOT EXISTS LIBRARY
    (
      library_id SERIAL,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      PRIMARY KEY(library_id)
    )
  `
    return libraries
}


// Represents a physical copy of a book, associated with a SINGLE LIBRARY
const createBooks = async () => {
    const books = await sql`
    CREATE TABLE IF NOT EXISTS BOOKS
    (
      book_id SERIAL,
      status VARCHAR(10) CHECK (status IN ('ISSUED', 'AVAILABLE')) DEFAULT 'AVAILABLE',
      dewey_dec_loc VARCHAR(255),
      PRIMARY KEY(book_id)
    )
  `
    return books
}


// Common information associated to each physical copy of a book stored in this entity set
const createISBN = async () => {
    const isbns = await sql`
    CREATE TABLE IF NOT EXISTS ISBN
    (
      isbn_id BIGINT,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      genre VARCHAR(255),
      publication VARCHAR(255),
      lang VARCHAR(255) NOT NULL,
      pages INT CHECK(pages > 0),
      doc_type VARCHAR(255),
      PRIMARY KEY(isbn_id)
    )
  `
    return isbns
}

const createFine = async () => {
    const fines = await sql`
    CREATE TABLE IF NOT EXISTS FINE
    (
      fine_id SERIAL,
      issue_id INT NOT NULL,
      amount DECIMAL(4,2) DEFAULT 0.0,
      paid_status BOOLEAN DEFAULT FALSE,
      paid_date DATE,
      reason VARCHAR(255),
      FOREIGN KEY (issue_id) REFERENCES ISSUES(issue_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      PRIMARY KEY(fine_id)
    )
  `
    return fines
}

// =========== RELATION SCHEMAS ==============

// One-many relation between book and library!
// Here primary key is kept only book because a SINGULAR BOOK CANNOT BELONG TO MULTIPLE LIBRARIES
const createCatalog = async () => {
    const catalog = await sql`
    CREATE TABLE IF NOT EXISTS CATALOG
    (
      library_id INT NOT NULL,
      book_id INT NOT NULL,
      FOREIGN KEY (library_id) REFERENCES LIBRARY(library_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
      FOREIGN KEY (book_id) REFERENCES BOOKS(book_id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
      PRIMARY KEY(book_id, library_id)
    )
  `
    return catalog
}

// One-many relation that relating Books(Physical copy) to ISBN number
const createBookDetails = async () => {
    const bookDetails = await sql`
    CREATE TABLE IF NOT EXISTS BOOK_DETAILS
    (
      isbn_id BIGINT NOT NULL,
      book_id INT NOT NULL,
      PRIMARY KEY(book_id),
      FOREIGN KEY (isbn_id) REFERENCES ISBN(isbn_id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
      FOREIGN KEY (book_id) REFERENCES BOOKS(book_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `
    return bookDetails
}

// Every issue is associated with a unique entry of catalog
const createIssues = async () => {
    const issues = await sql`
    CREATE TABLE IF NOT EXISTS ISSUES
    (
      issue_id SERIAL,
      book_id INT NOT NULL,
      library_id INT NOT NULL,
      uid INT NOT NULL,
      issued_on DATE NOT NULL,
      due_date DATE NOT NULL,
      FOREIGN KEY(book_id, library_id) REFERENCES CATALOG(book_id, library_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      FOREIGN KEY(library_id) REFERENCES LIBRARY(library_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      FOREIGN KEY(book_id) REFERENCES BOOKS(book_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      FOREIGN KEY (uid) REFERENCES USERS(uid)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
      PRIMARY KEY(issue_id)
    )
  `
    return issues
}


// export const deleteDB = async () => {
//     try {
//         await sql `DROP TABLE  LIBRARY, BOOKS, ISBN, BOOK_DETAILS, CATALOG, ISSUES;`
//     } catch (error) {
//         console.error("Error deleting tables:", error)
//     }   
//     return
// }

export const initDB = async () => {
    try {
        await connectDB();
        await createUser()
        await createLibrary()
        await createISBN()
        await createBooks()
        await createCatalog()
        await createBookDetails()
        await createIssues()
        await createFine()
        await populateDB()
        console.log("DB initialized successfully")
    } catch (error) {
        console.error("Error creating tables:", error)
    }   
    return
}