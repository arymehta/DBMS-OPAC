import sql, { connectDB } from "../db/dbconn.js";

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

        return res.status(200).json(fines);
    } catch (error) {
        console.error("Error fetching fines:", error);
        return res.status(500).json({ message: error.message });
    }
};

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

        if (fineDetails.length === 0) {
            return res.status(404).json({ message: "Fine not found" });
        }

        return res.status(200).json(fineDetails[0]);
    } catch (error) {
        console.error("Error fetching fine details:", error);
        return res.status(500).json({ message: error.message });
    }
};

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

        if (result.length === 0) {
            return res.status(404).json({ message: "Fine not found" });
        }

        return res.status(200).json({ 
            message: "Fine paid successfully", 
            fine: result[0] 
        });
    } catch (error) {
        console.error("Error paying fine:", error);
        return res.status(500).json({ message: error.message });
    }
};

export { getFinesByUser, getFineDetails, payFine };
