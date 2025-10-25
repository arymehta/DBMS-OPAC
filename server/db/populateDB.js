import sql from './dbconn.js'
import { connectDB } from "./dbconn.js"

// TO BE DIRECTLY CALLED AS A SCRIPT TO POPULATE THE DB WITH SAMPLE DATA
// ---------- INSERT FUNCTIONS ----------

const insertUsers = async () => {
  await sql`
    INSERT INTO USERS (name, books_issued, role) VALUES
      ('Alice Johnson', 2, 'ISSUER'),
      ('Bob Smith', 0, 'ISSUER'),
      ('Charlie Admin', 0, 'ADMIN'),
      ('Diana Prince', 1, 'ISSUER')
    ON CONFLICT DO NOTHING;
  `
}

const insertLibraries = async () => {
  await sql`
    INSERT INTO LIBRARY (name, street, city, state, zip_code, contact_number, email, opening_hours, closing_hours) VALUES
      ('Central Library', '123 Main Street', 'Metropolis', 'NY', '10001', '555-1234', 'central@library.com', '09:00', '17:00'),
      ('City Branch', '456 Elm Street', 'Metropolis', 'NY', '10002', '555-5678', 'city@library.com', '10:00', '18:00');
    --ON CONFLICT DO NOTHING;
  `
}

const insertISBNs = async () => {
  await sql`
    INSERT INTO ISBN (isbn_id, title, author, genre, publication, lang, pages, doc_type)
    VALUES
      (9783161484100, 'The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 'Scribner', 'English', 180, 'Hardcover'),
      (9780439139601, 'Harry Potter and the Goblet of Fire', 'J.K. Rowling', 'Fantasy', 'Bloomsbury', 'English', 636, 'Paperback'),
      (9780140449266, 'Meditations', 'Marcus Aurelius', 'Philosophy', 'Penguin Classics', 'English', 254, 'Paperback'),
      (9789386538619, 'Wings of Fire', 'A.P.J. Abdul Kalam', 'Biography', 'Universities Press', 'English', 180, 'Paperback')
    ON CONFLICT DO NOTHING;
  `
}
/* sample json


*/

const insertBooks = async () => {
  await sql`
    INSERT INTO BOOKS (status, dewey_dec_loc, isbn_id)
    VALUES
      ('AVAILABLE', '823.912 FIT', 9783161484100),
      ('ISSUED', '823.914 ROW', 9780439139601),
      ('AVAILABLE', '188.2 AUR', 9780140449266),
      ('AVAILABLE', '920 KAL', 9789386538619)
    ON CONFLICT DO NOTHING;
  `
}

const insertCatalog = async () => {
  await sql`
    INSERT INTO CATALOG (library_id, book_id) VALUES
      (1, 1),
      (1, 2),
      (2, 3),
      (2, 4)
    ON CONFLICT DO NOTHING;
  `}

// const insertBookDetails = async () => {
//   await sql`
//     INSERT INTO BOOK_DETAILS (isbn_id, book_id) VALUES
//       (9783161484100, 1),
//       (9780439139601, 2),
//       (9780140449266, 3),
//       (9789386538619, 4)
//     ON CONFLICT DO NOTHING;
//   `
// }

const insertIssues = async () => {
  await sql`
    INSERT INTO ISSUES (book_id, library_id, uid, issued_on, due_date)
    VALUES
      (2, 1, 1, '2025-10-01', '2025-10-20'),
      (4, 2, 4, '2025-09-25', '2025-10-10')
    ON CONFLICT DO NOTHING;
  `
}

const insertReservations = async() => {
	await sql`
		INSERT INTO RESERVATIONS (isbn_id, library_id, uid)
		VALUES
			(9780439139601, 1, 2),
			(9780140449266, 2, 3)
		ON CONFLICT DO NOTHING;
	`
}

const insertFines = async () => {
  await sql`
    INSERT INTO FINE (issue_id, amount, paid_status, paid_date, reason)
    VALUES
      (1, 15.00, FALSE, NULL, 'Late return'),
      (2, 0.00, TRUE, '2025-10-12', 'No fine')
    ON CONFLICT DO NOTHING;
  `
}

// ---------- MASTER POPULATION FUNCTION ----------
export const populateDB = async () => {
  try {
    await connectDB()

    await insertUsers()
    await insertLibraries()
    await insertISBNs()
    await insertBooks()
    await insertCatalog()
    // await insertBookDetails()
    await insertIssues()
    await insertFines()
    await insertReservations()

    console.log("Database populated successfully!")
  } catch (error) {
    console.error("Error populating database:", error)
  }
}

