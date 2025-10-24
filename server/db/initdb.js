import sql from './dbconn.js'
import { connectDB } from "./dbconn.js"
import {populateDB} from './populateDB.js'

// =========== ENTITY SETS ==============

const createUsers = async () => {
  return await sql`
    CREATE TABLE IF NOT EXISTS USERS (
      uid SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      books_issued INT DEFAULT 0,
      role VARCHAR(10) CHECK (role IN ('ISSUER', 'ADMIN')) DEFAULT 'ISSUER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
}

const createIssuerDetails = async () => {
  return await sql`
    CREATE TABLE IF NOT EXISTS ISSUER_DETAILS (
      uid INT PRIMARY KEY REFERENCES USERS(uid) ON DELETE CASCADE,
      max_books_allowed INT DEFAULT 5,
      penalty_rate DECIMAL(5,2) DEFAULT 2.00
    )
  `
}

const createAdminDetails = async () => {
  return await sql`
    CREATE TABLE IF NOT EXISTS ADMIN_DETAILS (
      uid INT PRIMARY KEY REFERENCES USERS(uid) ON DELETE CASCADE,
      permissions JSONB DEFAULT '{"can_add_books": true, "can_delete_users": true}'
    )
  `
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

// Users can reserve books (first-come, first-served)
const createReservations = async () => {
  const reservations = await sql`
    CREATE TABLE IF NOT EXISTS RESERVATIONS (
      reservation_id SERIAL PRIMARY KEY,
      book_id INT NOT NULL,
      library_id INT NOT NULL,
      uid INT NOT NULL,
      reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(10) CHECK (status IN ('ACTIVE', 'CANCELLED', 'ISSUED')) DEFAULT 'ACTIVE',
      FOREIGN KEY(book_id, library_id) REFERENCES CATALOG(book_id, library_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      FOREIGN KEY(uid) REFERENCES USERS(uid)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
    )
  `
  return reservations
}

const createOtpTable = async () => {
  return await sql`
    CREATE TABLE IF NOT EXISTS OTP (
      otp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      uid INT REFERENCES USERS(uid) ON DELETE CASCADE,
      otp_hash TEXT NOT NULL,
      purpose VARCHAR(20) CHECK (purpose IN ('SIGNUP', 'RESET_PASSWORD')) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
};



// export const deleteDB = async () => {
//     try {
//         await sql `DROP TABLE  LIBRARY, BOOKS, ISBN, BOOK_DETAILS, CATALOG, ISSUES;`
//     } catch (error) {
//         console.error("Error deleting tables:", error)
//     }   
//     return
// }

const checkIfTablesExist = async () => {
  const result = await sql`
    SELECT COUNT(*) as table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'library', 'isbn', 'books', 'catalog', 'book_details', 'issues', 'reservations', 'fine')
  `;
  return parseInt(result[0].table_count) === 9; //i have hardcoded 9 tables, maybe change later
};

const checkIfDataExists = async () => {
  try {
    const result = await sql`SELECT COUNT(*) as user_count FROM users LIMIT 1`;
    return parseInt(result[0].user_count) > 0;
  } catch (error) {
    return false; 
  }
};

export const initDB = async () => {
  try {
    await connectDB();

    // no need to create tables or populate if they already exist
    const tablesExist = await checkIfTablesExist();
    const dataExists = await checkIfDataExists();
    
    if (tablesExist && dataExists) {
      console.log("DB already initialized with data, skipping...");
      return;
    }
    
    if (!tablesExist) {
      console.log("Creating database tables...");
      await createUsers()
        await createIssuerDetails()
        await createAdminDetails()
        await createPasswordResets()
        await createOtpTable()

      await createLibrary()
      await createISBN()
      await createBooks()
      await createCatalog()
      await createBookDetails()
      await createIssues()
      await createReservations()
      await createFine()
    }
    
    if (!dataExists) {
      console.log("Populating database with initial data...");
      await populateDB()
    }
    
    console.log("DB initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
  }   
  return
}
