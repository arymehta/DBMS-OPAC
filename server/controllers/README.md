# Overview

This project implements a library management system with features for user authentication, book cataloging, fine management, issue tracking, and reservations. It uses PostgreSQL as the database and interacts with it using the `postgres` Node.js library. The system includes user signup/login, book searching and details retrieval, fine tracking, book issuing and returning, and reservation management. It leverages JSON Web Tokens (JWT) for authentication and `bcryptjs` for password hashing. Email verification using OTP is implemented during signup and password reset.

# File Documentation

## auth.js

This module handles user authentication, registration, and password reset functionalities.

- **Dependencies:**
    - `bcryptjs`: For password hashing.
    - `jsonwebtoken`: For generating and verifying JWT tokens.
    - `../db/dbconn.js`: Provides the SQL connection.
    - `../utils/sendMail.js`: For sending emails (OTP verification, password reset).
    - `process.env.JWT_SECRET`: JWT secret stored in environment variables. *Assumption: `JWT_SECRET` is a non-empty string.*
    - `process.env.SUPER_ADMIN_TOKEN`: Super admin token stored in environment variables. *Assumption: `SUPER_ADMIN_TOKEN` is a non-empty string.*

### signup

- **Purpose:** Registers a new user in the system. Handles both regular user and admin user creation, with admin creation requiring a super admin token. Sends an OTP to the user's email for verification.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.body` to contain `name`, `email`, `password`, and optionally `role`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Verifies if the user is an admin, checking `process.env.SUPER_ADMIN_TOKEN` for authorization.
    - Handles cases where a user with the same email exists but is not verified, deleting the old record and OTP before creating a new one.
    - Generates an OTP and sends it to the user's email using `sendMail`.
- **Snippet:**

```javascript
const signup = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		let userRole = 'ISSUER';

		if (role === 'ADMIN') {
			const authHeader = req.headers['authorization'] || '';
			const token = authHeader.replace('Bearer ', '').trim();

			if (token !== process.env.SUPER_ADMIN_TOKEN) {
				return res.status(403).json({ message: 'Unauthorized to create admin users' });
			}
			userRole = 'ADMIN';
		}
```

### verifyOtp

- **Purpose:** Verifies the OTP entered by the user, activates the user account, and generates a JWT token for authentication.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.body` to contain `email`, `otp`, and `purpose`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Checks for user existence and verification status.
    - Validates OTP against stored hash and expiry.
    - Creates entries in `ISSUER_DETAILS` or `ADMIN_DETAILS` tables based on user role.
- **Snippet:**

```javascript
const verifyOtp = async (req, res) => {
	try {
		const { email, otp, purpose } = req.body;

		const [user] = await sql`SELECT uid, is_verified, role FROM USERS WHERE email = ${email}`;
		if (!user) return res.status(404).json({ message: 'User not found' });
		if (user.is_verified) return res.status(400).json({ message: 'User already verified. Please login.' });
```

### resendOtp

- **Purpose:** Resends OTP to the user's email.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.body` to contain `email` and `purpose`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Deletes existing OTP before generating and sending a new one.
- **Snippet:**

```javascript
const resendOtp = async (req, res) => {
	try {
		const { email, purpose } = req.body;

		const [user] = await sql`SELECT uid, name, is_verified FROM USERS WHERE email = ${email}`;
		if (!user) return res.status(404).json({ message: 'User not found' });
		if (user.is_verified && purpose === 'SIGNUP')
			return res.status(400).json({ message: 'User already verified. Please login.' });
```

### login

- **Purpose:** Logs in an existing user by verifying the password and generating a JWT token.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.body` to contain `email` and `password`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Fetches user by email and compares the provided password with the stored password hash.
- **Snippet:**

```javascript
const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const [user] = await sql`SELECT * FROM USERS WHERE email = ${email}`;
		if (!user) return res.status(400).json({ message: 'Invalid credentials' });

		const isMatch = await bcrypt.compare(password, user.password_hash);
		if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
```

### requestResetPassword

- **Purpose:** Initiates the password reset process by sending an OTP to the user's email.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.body` to contain `email`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Generates and stores an OTP with 'RESET_PASSWORD' purpose.
- **Snippet:**

```javascript
const requestResetPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const [user] = await sql`SELECT uid, name FROM USERS WHERE email = ${email}`;
		if (!user) return res.status(404).json({ message: 'User not found' });

		const otp = generateOtp();
		const otpHash = await bcrypt.hash(otp, 10);
		const expiresAt = addMinutes(new Date(), 5);

		await sql`
			INSERT INTO OTP (uid, otp_hash, purpose, expires_at)
			VALUES (${user.uid}, ${otpHash}, 'RESET_PASSWORD', ${expiresAt});
    	`;
```

### confirmResetPassword

- **Purpose:** Confirms the password reset by verifying the OTP and updating the user's password.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.body` to contain `email`, `otp`, and `newPassword`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Validates OTP and updates password hash.
- **Snippet:**

```javascript
const confirmResetPassword = async (req, res) => {
	try {
		const { email, otp, newPassword } = req.body;
		const [user] = await sql`SELECT uid FROM USERS WHERE email = ${email}`;
		if (!user) return res.status(404).json({ message: 'User not found' });

		const [otpRecord] = await sql`
			SELECT * FROM OTP
			WHERE uid = ${user.uid} AND purpose = 'RESET_PASSWORD'
			ORDER BY created_at DESC LIMIT 1;
    	`;
		if (!otpRecord) return res.status(400).json({ message: 'No OTP found' });
		if (otpRecord.verified) return res.status(400).json({ message: 'OTP already used' });
		if (new Date(otpRecord.expires_at) < new Date()) return res.status(400).json({ message: 'OTP expired' });

		const valid = await bcrypt.compare(otp, otpRecord.otp_hash);
		if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

		const newHash = await bcrypt.hash(newPassword, 10);
		await sql`UPDATE USERS SET password_hash = ${newHash} WHERE uid = ${user.uid}`;
		await sql`DELETE FROM OTP WHERE otp_id = ${otpRecord.otp_id}`;

		res.json({ message: 'Password reset successful' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Password reset failed' });
	}
};
```

### checkAuth

- **Purpose:** Checks if the user is authenticated by verifying the JWT token.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.headers['authorization']` to contain the JWT token.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Extracts the token from the Authorization header.
    - Verifies the token using `jwt.verify` and `JWT_SECRET`.
    - Retrieves user information based on the decoded user ID.
    - Checks if the user is verified.
- **Snippet:**

```javascript
const checkAuth = async (req, res) => {
	try {
		const authHeader = req.headers['authorization'] || '';
		const token = authHeader.replace('Bearer ', '').trim();

		if (!token) {
			return res.status(401).json({ message: 'No token provided' });
		}

		const decoded = jwt.verify(token, JWT_SECRET);
		
		const [user] = await sql`SELECT uid, name, email, role, is_verified FROM USERS WHERE uid = ${decoded.uid}`;
		
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		if (!user.is_verified) {
			return res.status(403).json({ message: 'User not verified' });
		}

		res.json({ 
			message: 'Token is valid',
			data: {
				uid: user.uid,
				name: user.name,
				email: user.email,
				role: user.role
			}
		});
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Token expired' });
		}
		if (err.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'Invalid token' });
		}
		console.error(err);
		res.status(500).json({ message: 'Authentication check failed' });
	}
};
```

## books.js

This module handles book-related operations such as retrieving book details and total number of books.

- **Dependencies:**
    - `../db/dbconn.js`: Provides the SQL connection.

### getBookDetails

- **Purpose:** Retrieves details of a book based on its ID.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.params` to contain `id` (book ID).
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Joins `BOOKS` and `ISBN` tables to fetch complete book details.
- **Snippet:**

```javascript
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
```

### getTotalNumBooks

- **Purpose:** Retrieves the total number of books in the system.
- **Parameters:**
    - `req` (`object`): Express request object.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Counts the total number of entries in the `BOOKS` table.
- **Snippet:**

```javascript
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
```

## catalog.js

This module provides functionalities to retrieve and search the book catalog.

- **Dependencies:**
    - `../db/dbconn.js`: Provides the SQL connection.

### getCatalog

- **Purpose:** Retrieves the entire book catalog with details from `CATALOG`, `BOOKS`, `ISBN`, and `LIBRARY` tables.
- **Parameters:**
    - `req` (`object`): Express request object.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Joins multiple tables to provide comprehensive catalog information.
- **Snippet:**

```javascript
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
```

### searchCatalog

- **Purpose:** Searches the book catalog based on various filters provided in the request body.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.body` to contain filter parameters like `author`, `title`, `genre`, `language`, `docType`, `library_id`, `availability`, and `publication`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Uses helper functions (`authorFilter`, `titleFilter`, etc.) to build the SQL `WHERE` clause dynamically.
    - Applies filters using `ILIKE` for case-insensitive matching.
- **Snippet:**

```javascript
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
```

## fines.js

This module manages fines related to book issues.

- **Dependencies:**
    - `../db/dbconn.js`: Provides the SQL connection.

### getFinesByUser

- **Purpose:** Retrieves all fines for a given user.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.params` to contain `userId`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Joins `FINE`, `ISSUES`, `BOOKS`, and `ISBN` tables to fetch fine details along with associated book and issue information.
- **Snippet:**

```javascript
const getFinesByUser = async (req, res) => {
    try {
        await connectDB();
        const { userId } = req.params;
        console.log("Fetching fines for user ID:", userId);

        const fines = await sql`
            SELECT 
                f.fine_id as id,
                f.amount,
                CASE WHEN f.paid_status THEN 'PAID' ELSE 'UNPAID' END as status,
                f.paid_date,
                f.reason,
                f.issue_id,
                i.book_id,
                isbn.title as book_title,
                i.library_id,
                i.issued_on,
                i.due_date
            FROM FINE f
            JOIN ISSUES i ON f.issue_id = i.issue_id
            LEFT JOIN BOOKS b ON i.book_id = b.book_id
            LEFT JOIN ISBN isbn ON b.isbn_id = isbn.isbn_id
            WHERE i.uid = ${userId};
        `;
```

### getFineDetails

- **Purpose:** Retrieves details of a specific fine.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.params` to contain `fineId`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Joins tables to fetch comprehensive fine details.
- **Snippet:**

```javascript
const getFineDetails = async (req, res) => {
    try {
        await connectDB();
        const { fineId } = req.params;
        console.log("Fetching fine with ID:", fineId);
        
        const fineDetails = await sql`
            SELECT 
                f.fine_id as id,
                f.amount,
                CASE WHEN f.paid_status THEN 'PAID' ELSE 'UNPAID' END as status,
                f.paid_date,
                f.reason,
                i.uid AS user_id,
                i.book_id,
                isbn.title as book_title,
                i.library_id,
                i.issued_on,
                i.due_date
            FROM FINE f
            JOIN ISSUES i ON f.issue_id = i.issue_id
            LEFT JOIN BOOKS b ON i.book_id = b.book_id
            LEFT JOIN ISBN isbn ON b.isbn_id = isbn.isbn_id
            WHERE f.fine_id = ${fineId};
        `;
```

### payFine

- **Purpose:** Marks a fine as paid.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.params` to contain `fineId` and `req.body` to contain `sbi_dtu`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Updates the `paid_status` and `paid_date` in the `FINE` table.
- **Snippet:**

```javascript
const payFine = async (req, res) => {
    try {
        await connectDB();
        const { fineId } = req.params;
        const {sbi_dtu} = req.body;
        console.log("Paying fine with ID:", fineId);

        const result = await sql`
            UPDATE FINE
            SET paid_status = TRUE,
                paid_date = CURRENT_DATE
                , sbi_dtu = ${sbi_dtu}
            WHERE fine_id = ${fineId}
            RETURNING fine_id as id, amount, 
                     CASE WHEN paid_status THEN 'PAID' ELSE 'UNPAID' END as status, 
                     paid_date;
        `;
```

## isbn.js

This module handles ISBN-related operations such as retrieving book details by ISBN and adding a new book using ISBN information.

- **Dependencies:**
    - `../db/dbconn.js`: Provides the SQL connection.

### getBookDetailsByISBN

- **Purpose:** Retrieves book details based on ISBN ID.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.params` to contain `id` (ISBN ID).
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Fetches book details from the `ISBN` table.
- **Snippet:**

```javascript
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
```

### addBookByISBN

- **Purpose:** Adds a new book to the system using ISBN information.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.body` to contain ISBN details like `isbn_id`, `title`, `author`, `genre`, `publication`, `lang`, `pages`, `doc_type`, `library_id`, and `dewey_dec_loc`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Inserts data into the `ISBN`, `BOOKS`, and `CATALOG` tables within a transaction.
    - Handles conflict scenarios for ISBN and foreign key constraints.
- **Snippet:**

```javascript
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
```

## issues.js

This module handles book issuing and returning functionalities.

- **Dependencies:**
    - `../db/dbconn.js`: Provides the SQL connection.
    - `./reservations.js`: For `getExpirationDate` and `updateQueue` functions.

### getActiveIssuesByUid

- **Purpose:** Retrieves all active issues for a given user.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.params` to contain `uid` (user ID).
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Joins `ISSUES`, `BOOKS`, `ISBN`, `CATALOG`, `LIBRARY`, and `FINE` tables to fetch issue details along with book, library, and fine information.
    - Filters issues with `status = 'ACTIVE'`.
- **Snippet:**

```javascript
const getActiveIssuesByUid = async (req, res) => {
	try {
		const { uid } = req.params

		if (!uid) {
			return res.status(400).json({
				error: "Missing required field: uid"
			});
		}

		await connectDB();
		const issues = await sql`
			SELECT
				iss.book_id,
				i.isbn_id,
				i.title,
				i.author,
				l.name AS library_name,
				iss.issued_on,
				iss.due_date,
				iss.uid,
				COALESCE(f.amount, 0) AS fine_amount
			FROM ISSUES iss
			JOIN BOOKS b ON iss.book_id = b.book_id
			JOIN ISBN i ON b.isbn_id = i.isbn_id
			JOIN CATALOG c ON b.book_id = c.book_id
			JOIN LIBRARY l ON c.library_id = l.library_id
			LEFT JOIN FINE f ON iss.issue_id = f.issue_id
			WHERE iss.uid = ${uid}
				AND iss.status = 'ACTIVE'
			ORDER BY iss.issued_on DESC
		`;
```

### getPastIssuesByUid

- **Purpose:** Retrieves all past (returned) issues for a given user.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.params` to contain `uid` (user ID).
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Filters issues with `status = 'RETURNED'`.
- **Snippet:**

```javascript
const getPastIssuesByUid = async (req, res) => {
	try {
		const { uid } = req.params

		if (!uid) {
			return res.status(400).json({
				error: "Missing required field: uid"
			});
		}

		await connectDB();
		const issues = await sql`
			SELECT
				i.isbn_id,
				i.title,
				i.author,
				l.name AS library_name,
				iss.issued_on,
				iss.due_date,
				COALESCE(f.amount, 0) AS fine_amount
			FROM ISSUES iss
			JOIN BOOKS b ON iss.book_id = b.book_id
			JOIN ISBN i ON b.isbn_id = i.isbn_id
			JOIN CATALOG c ON b.book_id = c.book_id
			JOIN LIBRARY l ON c.library_id = l.library_id
			LEFT JOIN FINE f ON iss.issue_id = f.issue_id
			WHERE iss.uid = ${uid}
				AND iss.status = 'RETURNED'
			ORDER BY iss.issued_on DESC
		`;
```

### createIssue

- **Purpose:** Creates a new book issue record.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.body` to contain `book_id`, `uid`, and optionally `due_date`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Checks if the book is already issued.
    - Handles reservation logic: if the user has a valid reservation, it's used; otherwise, checks for available copies.
    - Calls `updateQueue` to update the reservation queue after issuing the book.
- **Snippet:**

```javascript
const createIssue = async (req, res) => {
	try {
		const { book_id, uid, due_date } = req.body;
		
		if(!book_id || !uid) {
			return res.status(400).json({
				error: "Missing required fields: book_id, uid",
			})
		}
		
		await connectDB();
		
		const message = await sql.begin(async (sql) => {
			// Get book details for given book_id.
			const bookDetails = await sql`
				SELECT b.book_id, b.isbn_id, c.library_id, b.status
				FROM BOOKS b
				JOIN CATALOG C ON b.book_id = c.book_id
				WHERE b.book_id = ${book_id}
			`
```

### returnBook

- **Purpose:** Handles the return of a book.
- **Parameters:**
    - `req` (`object`): Express request object. Expects `req.params` to contain `book_id`.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Updates the book status to 'AVAILABLE' and issue status to 'RETURNED'.
    - Calls `updateQueue` to update the reservation queue after returning the book.
- **Snippet:**

```javascript
const returnBook = async (req, res) => {
	try {
		const { book_id } = req.params;
		
		if(!book_id) {
			return res.status(400).json({
				error: "Missing required fields: book_id"
			});
		}
		
		await connectDB();
		const message = await sql.begin(async (sql) => {
			// Get book details
			const bookDetails = await sql`
				SELECT
					b.isbn_id,
					c.library_id,
					b.status
				FROM BOOKS b
				JOIN CATALOG c ON b.book_id = c.book_id
				WHERE b.book_id = ${book_id}
			`;
```

### getTotalNumIssues

- **Purpose:** Retrieves total number of active and overdue issues.
- **Parameters:**
    - `req` (`object`): Express request object.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Counts active issues and overdue issues.
- **Snippet:**

```javascript
const getTotalNumIssues = async (req, res) => {
	try {
		await connectDB();
		const total_issues = await sql`
			SELECT COUNT(*)::int AS total_issues
			FROM ISSUES
			WHERE status = 'ACTIVE';
		`;

		const overdue_issues = await sql`
			SELECT COUNT(*)::int AS overdue_issues
			FROM ISSUES
			WHERE status = 'ACTIVE'
			AND due_date < CURRENT_DATE
		`;
		console.log("Total issues:", total_issues[0].total_issues);
		console.log("Overdue issues:", overdue_issues[0].overdue_issues);
		return res.status(200).json({
			data: {
				active_issues: total_issues[0].total_issues,
				overdue_issues: overdue_issues[0].overdue_issues
			}
		});
	}
```

### getIssueHistory

- **Purpose:** Retrieves recent issue history.
- **Parameters:**
    - `req` (`object`): Express request object.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Retrieves the latest 10 issue records.
- **Snippet:**

```javascript
const getIssueHistory = async (req, res) => {
	try {
		await connectDB();
		const issueHistory = await sql`
			SELECT
				i.uid,	
				b.book_id,
				i.issued_on,
				i.due_date,
				i.status
			FROM ISSUES i
			JOIN BOOKS b ON i.book_id = b.book_id
			ORDER BY i.issued_on DESC
			LIMIT 10
		`;
```

## members.js

This module handles member-related operations.

- **Dependencies:**
    - `express`: although imported, express is unused in the function.
    - `../db/dbconn.js`: Provides the SQL connection.

### getNumMembers

- **Purpose:** Retrieves the total number of members (users with role 'ISSUER') in the system.
- **Parameters:**
    - `req` (`object`): Express request object.
    - `res` (`object`): Express response object.
- **Return Type:** `Promise<void>`
- **Inline Comments:**
    - Counts users with the role 'ISSUER'.
- **Snippet:**

```javascript
const getNumMembers = async (req, res) => {
  try {
    await connectDB();
    const result = await sql`
        SELECT COUNT(*)::int AS total_members
        FROM USERS
        WHERE role = 'ISSUER'
    `;
    console.log("Total members fetched:", result[0].total_members);
    res.status(200).json({data : result[0].total_members});
  } catch (error) {
    console.error("Error fetching number of members:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
```

## reservations.js

This module handles book reservation functionalities.

- **Dependencies:**
    - `../db/dbconn.js`: Provides the SQL connection.

### createReservation

- **Purpose:** Creates a new book reservation.
- **Parameters:**
    - `req` (`object