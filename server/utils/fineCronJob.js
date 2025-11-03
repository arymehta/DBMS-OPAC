import cron from "node-cron";
import sql, { connectDB } from "../db/dbconn.js";

const scheduleFineJob = () => {
  cron.schedule("0 0 * * *", async () => { /* this runs everyday at midnight */
    console.log(`[CRON] Running fine check at ${new Date().toISOString()}`);

    try {
      await connectDB();

      const overdueIssues = await sql`
        SELECT i.issue_id, i.uid, i.due_date, idet.penalty_rate
        FROM ISSUES i
        JOIN ISSUER_DETAILS idet ON i.uid = idet.uid
        WHERE i.due_date < CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1 FROM FINE f WHERE f.issue_id = i.issue_id
        );
      `;

      if (overdueIssues.length === 0) {
        console.log("[CRON] No new overdue issues found.");
        return;
      }

      console.log(`[CRON] Found ${overdueIssues.length} overdue issues.`);

      for (const issue of overdueIssues) {
        const daysLate =
          Math.floor((new Date() - new Date(issue.due_date)) / (1000 * 60 * 60 * 24)) || 1;
        const fineAmount = (issue.penalty_rate || 2.0) * daysLate;

        await sql`
          INSERT INTO FINE (issue_id, amount, paid_status, reason)
          VALUES (${issue.issue_id}, ${fineAmount}, FALSE, 'Overdue by ${daysLate} days');
        `;

        console.log(
          `[CRON] Added fine for issue ${issue.issue_id} — Rs. ${fineAmount.toFixed(
            2
          )} (${daysLate} days late)`
        );
      }

      console.log("[CRON] Fine generation completed successfully.");
    } catch (error) {
      console.error("[CRON] Error during fine generation:", error);
    }
  });
};

export default scheduleFineJob;
