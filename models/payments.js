const connection = require("../config/dbConnection");

/**
 * Fetch student payment history joined with session and term names
 * @param {number} studentId 
 * @returns {Promise<Array>}
 */
function getStudentPayments(studentId) {
  return new Promise((resolve, reject) => {
    connection.query(
      `
      SELECT 
        p.payment_id,
        p.student_id,
        p.title,
        p.amount_due,
        p.amount_paid,
        p.payment_date,
        p.payment_method,
        p.transaction_ref,
        p.status,
        s.session_name,
        t.term_name
      FROM student_payments p
      JOIN sessions s ON p.session_id = s.session_id
      JOIN terms t ON p.term_id = t.term_id
      WHERE p.student_id = ?
      ORDER BY p.session_id DESC, p.term_id DESC
      `,
      [studentId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
}

/**
 * Fetch overall payment summary and metrics for student
 * @param {number} studentId 
 * @returns {Promise<Object>}
 */
function getPaymentStatusSummary(studentId) {
  return new Promise((resolve, reject) => {
    getStudentPayments(studentId)
      .then(payments => {
        let totalDue = 0;
        let totalPaid = 0;
        let termsPaid = 0;
        let pendingCount = 0;

        payments.forEach(p => {
          totalDue += parseFloat(p.amount_due || 0);
          totalPaid += parseFloat(p.amount_paid || 0);
          if (p.status === 'Paid') termsPaid++;
          if (p.status === 'Pending' || p.status === 'Partial') pendingCount++;
        });

        const outstandingBalance = totalDue - totalPaid;
        const status = outstandingBalance <= 0 ? 'Up-to-Date' : 'Pending';

        resolve({
          status: status,
          outstandingBalance: outstandingBalance > 0 ? outstandingBalance : 0,
          termsPaidCount: termsPaid,
          onTimePercentage: payments.length > 0 ? Math.round((termsPaid / payments.length) * 100) : 100,
          pendingFees: outstandingBalance > 0 ? outstandingBalance : 0
        });
      })
      .catch(reject);
  });
}

module.exports = {
  getStudentPayments,
  getPaymentStatusSummary
};
