import sql, { connectDB } from "../db/dbconn.js";
import { getExpirationDate, updateQueue } from "./reservations.js"

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
				iss.isbn_id,
				i.title,
				i.author,
				l.name AS library_name,
				iss.issued_on,
				iss.due_date,
				COALESCE(f.amount, 0) AS fine_amount
			FROM ISSUES iss
			JOIN BOOKS b ON iss.book_id = b.book_id
			JOIN ISBN i ON b.book_id = i.book_id
			JOIN LIBRARY l ON b.library_id = l.library_id
			LEFT JOIN FINE f ON iss.issue_id = f.issue_id
			WHERE uid = ${uid}
				AND status = 'ISSUED'
			ORDER BY iss.issued_on DESC
		`;

		if (issues.length === 0) {
			return res.status(404).json({
				message: "No issues found for this user",
			});
		}
		return res.status(200).json(issues);
		
	} catch (error) {
		console.error("Error fetching issues:", error);
		return res.status(500).json({
			error: "Internal server error"
		});
	}
};


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
				iss.isbn_id,
				i.title,
				i.author,
				l.name AS library_name,
				iss.issued_on,
				iss.due_date,
				COALESCE(f.amount, 0) AS fine_amount
			FROM ISSUES iss
			JOIN BOOKS b ON iss.book_id = b.book_id
			JOIN ISBN i ON b.book_id = i.book_id
			JOIN LIBRARY l ON b.library_id = l.library_id
			LEFT JOIN FINE f ON iss.issue_id = f.issue_id
			WHERE uid = ${uid}
				AND status = 'RETURNED'
			ORDER BY iss.issued_on DESC
		`;

		if (issues.length === 0) {
			return res.status(404).json({
				message: "No issues found for this user",
			});
		}
		return res.status(200).json(issues);
		
	} catch (error) {
		console.error("Error fetching issues:", error);
		return res.status(500).json({
			error: "Internal server error"
		});
	}
};

const createIssue = async (req, res) => {
	try {
		const { book_id, uid } = req.body;
		
		if(!book_id || !uid) {
			return res.status(400).json({
				error: "Missing required fields: book_id, uid",
			})
		}
		
		await connectDB();
		
		await sql.begin(async (sql) => {
			// Get book details for given book_id.
			const bookDetails = await sql`
				SELECT book_id, isbn_id, library_id, status
				FROM BOOKS
				WHERE book_id = ${book_id}
			`
			
			if (bookDetails.length === 0) {
				throw new Error("Book not found");
			}
			
			if (bookDetails[0].status === 'ISSUED') {
				throw new Error("Book is already issued")
			}
			
			const { isbn_id, library_id } = bookDetails[0];
			
			// Check if user has an active reservation for this book at this library.
			const existingReservation = await sql`
				SELECT *
				FROM RESERVATIONS
				WHERE uid = ${uid}
					AND isbn_id = ${isbn_id}
					AND library_id = ${library_id}
			`;
			// Case 1: User has reserved the book before
			if(existingReservation.length > 0) {
				if(existingReservation[0].status === 'WAITLISTED') {
					throw new Error("User is in waitlist. Cannot issue book.")
				}
				
				// User has a valid reservation. Proceed with issue.
				// Delete the reservation
				await sql`
					DELETE FROM RESERVATIONS
					WHERE reservation_id = ${existingReservation[0].reservation_id}
				`;
				
				// Update reservation queue.
				await updateQueue(sql, isbn_id, library_id);
			}
			// Case 2: User hasn't reserved book (walk-in issual).
			// Count available copies left in the library.
			const remainingAvailableCopies = await sql`
				SELECT COUNT(*)::int AS count
				FROM BOOKS
				WHERE isbn_id = ${isbn_id}
				AND library_id = ${library_id}
				AND status = 'AVAILABLE'
				AND book_id != ${book_id}
			`;
			
			// Count number of reservations for this book.
			const totalReservations = await sql`
				SELECT COUNT(*)::int AS count
				FROM RESERVATIONS
				WHERE isbn_id = ${isbn_id}
					AND library_id = ${library_id}
			`;
			
			// Check if enough copies are available in the library for reserved users.
			if(remainingAvailableCopies[0].count < totalReservations[0].count) {
				throw new Error ("All copies of this book are reserved.");
			}
			
			// Walk-in issual allowed.
			const issued_on = new Date();
			// Can be conditionally assigned based on the issuer (student, faculty, etc.)
			// Default set to 30 days.
			const ISSUE_PERIOD = 30;
			const due_date = getExpirationDate(ISSUE_PERIOD);
			
			await sql`
				INSERT INTO ISSUES (book_id, library_id, uid, issued_on, due_date)
				VALUES (${book_id}, ${library_id}, ${uid}, ${issued_on}, ${due_date})
			`;
			
			// Update book status to ISSUED
			await sql`
				UPDATE BOOKS
				SET status = 'ISSUED'
				WHERE book_id = ${book_id}
			`;
		});
		
		return res.status(200).json({
			message: "Book issued successfully"
		});
	} catch (error) {
		console.error("Error issuing book:", error);
		
		if (error.message.includes("not found") || 
			error.message.includes("issued") ||
			error.message.includes("waitlisted") ||
			error.message.includes("reserved")) {
			
			return res.status(400).json({
				error: error.message
			});
		}
		
		return res.status(500).json({
			error: "internal server error"
		});
	}
}

// Return a boot at the library counter
const returnBook = async (req, res) => {
	try {
		const { book_id } = req.body;
		
		if(!book_id) {
			return res.status(400).json({
				error: "Missing required fields: book_id"
			});
		}
		
		await connectDB();
		await sql.begin(async (sql) => {
			// Get book details
			const bookDetails = await sql`
				SELECT
					isbn_id,
					library_id,
					status
				FROM BOOKS
				WHERE book_id = ${book_id}
			`;

			if (bookDetails.length === 0) {
				throw new Error("Book not found");
			}

			if(bookDetails[0].status === 'AVAILABLE') {
				throw new Error("Book is not currently issued");
			}

			const { isbn_id, library_id } = bookDetails[0];

			// Accept return and mark book as available.
			await sql`
				UPDATE BOOKS
				SET status = 'AVAILABLE'
				WHERE book_id = ${book_id}
			`;

			// TODO: Late fees handling

			// Update the issue record
			await sql`
				UPDATE ISSUES
				SET status = 'RETURNED'
				WHERE book_id = ${book_id}
			`;

			// Update the reservation queue.
			await updateQueue(sql, isbn_id, library_id);
		});

		return res.status(200).json({
			message: "Book returned successfully"
		});
	} catch (error) {
		console.error("Error returning book:", error);

		if(error.message.includes("not found") ||
		error.message.includes("not currently issued")) {
			return res.status(400).json({
				error: error.message
			});
		}

		return res.status(500).json({
			error: "Internal server error"
		});
	}
};

export {
	getActiveIssuesByUid,
	getPastIssuesByUid,
	createIssue,
	returnBook,
};
