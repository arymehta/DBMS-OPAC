import sql, { connectDB } from "../db/dbconn.js";

// Creates a new reservation for a given ISBN at a specific library for a user.
const createReservation = async (req, res) => {
  try {
    // Expect Book ISBN, Library ID, and User ID in the request body.
    const { isbn_id, library_id, uid } = req.body;

    if (!isbn_id || !library_id || !uid) {
      return res.status(400).json({
        error: "Missing required fields: isbn_id, library_id, uid",
      });
    }

    await connectDB();

    const result = await sql.begin(async (sql) => {

      // Ensure the user doesn't already have a reservation for this ISBN in this library.
      const existingReservations = await sql`
        SELECT *
        FROM RESERVATIONS
        WHERE isbn_id = ${isbn_id}
          AND library_id = ${library_id}
          AND uid = ${uid}
      `;

      if (existingReservations.length > 0) {
        throw new Error("Reservation already exists.");
      }

      // Count total AVAILABLE physical copies in this library for this ISBN.
      const availableCopies = await sql`
        SELECT COUNT(*) AS available
        FROM BOOKS
        WHERE isbn_id = ${isbn_id}
          AND library_id = ${library_id}
          AND status = 'AVAILABLE';
      `;

      // Count total RESERVED (active) reservations for this ISBN in this library.
      const activeReservations = await sql`
        SELECT COUNT(*) AS reserved
        FROM RESERVATIONS
        WHERE isbn_id = ${isbn_id}
          AND library_id = ${library_id}
          AND status = 'RESERVED';
      `;

      // Reservation lasts for 7 days once active.
      const EXPIRATION_DAYS = 7;
      
      // Check and assign reservation status.
      let status = 'WAITLISTED';
      let expires_at = null;
			
      if (availableCopies[0].available > activeReservations[0].reserved) {
        status = 'RESERVED';
        expires_at = new Date();
				expires_at.setDate(expires_at.getDate() + EXPIRATION_DAYS);
				expires_at.setHours(23, 59, 59, 999);
      }

      // Insert new reservation.
      const newReservation = await sql`
        INSERT INTO RESERVATIONS (isbn_id, library_id, uid, status, expires_at)
        VALUES (${isbn_id}, ${library_id}, ${uid}, ${status}, ${expires_at})
        RETURNING *;
      `;

      return {
        message: status === 'RESERVED'
          ? "Book reserved successfully. Please collect from the library within 7 days."
          : "All available copies are currently reserved. You have been added to the waitlist.",
        reservation: newReservation[0],
      };
    });

    res.status(200).json(result);

  } catch (error) {
    console.error("Error in createReservation:", error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch reservations made by a user.
const getReservationsByUid = async (req, res) => {
  try {
    await connectDB();
    const { uid } = req.params;
    console.log("Fetching reservations of User:", uid);
    
    // Fetch reservations for this user with book and library details.
    const reservationDetails = await sql`
      SELECT 
        r.reservation_id,
        r.isbn_id,
        i.title,
        l.name,
        r.reserved_at,
        r.expires_at,
        r.status
      FROM RESERVATIONS r
      JOIN ISBN i ON r.isbn_id = i.isbn_id
      JOIN LIBRARY l ON r.library_id = l.library_id
      WHERE r.uid = ${uid}
      ORDER BY r.reserved_at DESC
    `;
    
    if (!reservationDetails || reservationDetails.length === 0) {
      return res.status(404).json({ message: "No reservations found for this user" });
    }
    return res.status(200).json(reservationDetails);
  } catch (error) {
    console.error("Error fetching reservation details:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Updates the reservation queue for a given ISBN at a given library.
// Will be called during issues, returns, expiration/cancellation of
// active reservations and deletion of user.
const updateQueue = async (sql, isbn_id, library_id) => {
  // Count available physical copies.
  const availableCopies = await sql`
    SELECT COUNT(*)::int AS available
    FROM BOOKS
    WHERE isbn_id = ${isbn_id}
      AND library_id = ${library_id}
      AND status = 'AVAILABLE'
  `;

  // Count currently RESERVED (active) reservations.
  const activeReservations = await sql`
    SELECT COUNT(*)::int AS reserved
    FROM RESERVATIONS
    WHERE isbn_id = ${isbn_id}
      AND library_id = ${library_id}
      AND status = 'RESERVED'
  `;
  
  // Calculate how many copies are available to be reserved.
  const availableSlots = availableCopies[0].available - activeReservations[0].reserved;

	 // No copies available, nothing to update
  if (availableSlots <= 0) {
    return;
  }

  // Fetch the oldest waitlisted reservation (FIFO logic)
  const waitlistedReservations = await sql`
    SELECT *
    FROM RESERVATIONS
    WHERE isbn_id = ${isbn_id}
      AND library_id = ${library_id}
      AND status = 'WAITLISTED'
    ORDER BY reserved_at ASC
    LIMIT ${availableSlots}
  `;

	// No one in waitlist, no one to upgrade.
  if (waitlistedReservations.length === 0) {
    return;
  }

  // Promote waitlisted users to RESERVED status.
  const EXPIRATION_DAYS = 7;
  expires_at = new Date();
	expires_at.setDate(expires_at.getDate() + EXPIRATION_DAYS);
	expires_at.setHours(23, 59, 59, 999);
  
  const promotedIds = waitlistedReservations.map(r => r.reservation_id);
  
  await sql`
    UPDATE RESERVATIONS
    SET status = 'RESERVED',
        expires_at = ${expires_at}
    WHERE reservation_id = ANY(${promotedIds})
  `;

  // TODO: Send notifications to promoted users
};

// Cancels a reservation, updates the reservation queue.
const cancelReservation = async (req, res) => {
  try {
    const { reservation_id } = req.body;
    
    if (!reservation_id) {
      return res.status(400).json({
        error: "Missing required field: reservation_id",
      });
    }

    await connectDB();
    
    await sql.begin(async (sql) => {
      // Get necessary reservation details before deletion.
      const reservation = await sql`
        SELECT
        	isbn_id,
        	library_id,
        	status
        FROM RESERVATIONS
        WHERE reservation_id = ${reservation_id}
      `;
      
      if (reservation.length === 0) {
        throw new Error("Reservation not found");
      }
      
      // Delete the reservation
      await sql`
        DELETE FROM RESERVATIONS
        WHERE reservation_id = ${reservation_id}
      `;
      
      const { isbn_id, library_id, status } = reservation[0];
      
      // If the cancelled reservation was RESERVED, update queue
      if (status === 'RESERVED') {
        await updateQueue(sql, isbn_id, library_id);
      }
    });
    
    return res.status(200).json({
      message: "Reservation cancelled successfully"
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    
    if (error.message.includes("not found")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Cleanup expired reservations and update queues
// To be called by a cron job (Once a day, maybe at 00:00).
const cleanupExpiredReservations = async () => {
  try {
    await connectDB();
    
    await sql.begin(async (sql) => {
    
      // Find all expired reservations which are still marked active.
      const expiredReservations = await sql`
        SELECT DISTINCT isbn_id, library_id
        FROM RESERVATIONS
        WHERE status = 'RESERVED'
          AND expires_at < NOW()
      `;
			
			// If no expired reservations are there, nothing to do.
      if (expiredReservations.length === 0) {
        console.log("No expired reservations found");
        return;
      }
			
			// If expired reservations are found:
      console.log(`Found expired reservations for ${expiredReservations.length} books at various libraries`);

      // Delete all expired reservations
      await sql`
        DELETE FROM RESERVATIONS
        WHERE status = 'RESERVED'
          AND expires_at < NOW()
      `;

      console.log("Deleted expired reservations");

			// Call updateQueue() for each unique (isbn_id, library_id)
      for (const book of expiredReservations) {
        await updateQueue(sql, book.isbn_id, book.library_id);
      }

      console.log("Queue updated");
    });

    console.log("Cleanup job completed successfully");
  } catch (error) {
    console.error("Error in cleanup job:", error);
  }
};

export { 
	createReservation,
	getReservationsByUid,
	updateQueue,
	cancelReservation,
	cleanupExpiredReservations
};
