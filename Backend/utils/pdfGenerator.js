import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateReceiptPDF = async (receipt, student, payment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `receipt_${receipt.receiptNumber}.pdf`;
      const filePath = path.join('temp', filename);

      if (!fs.existsSync('temp')) {
        fs.mkdirSync('temp');
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('COLLEGE SMART ACCOUNT', { align: 'center' });
      doc.fontSize(12).text('Fee Payment Receipt', { align: 'center' });
      doc.moveDown();

      // Horizontal Line
      doc.moveTo(50, 100).lineTo(550, 100).stroke();
      doc.moveDown();

      // Student Details
      doc.fontSize(12).text(`Receipt No: ${receipt.receiptNumber}`);
      doc.text(`Date: ${new Date(receipt.date).toLocaleDateString()}`);
      doc.moveDown();
      doc.text(`Student Name: ${student.name}`);
      doc.text(`Student ID: ${student.studentId}`);
      doc.text(`Department: ${student.department}`);
      doc.moveDown();

      // Payment Table
      doc.fontSize(14).text('Payment Details:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Amount Paid: ₹${receipt.amount}`);
      doc.text(`Payment Method: ${payment.method}`);
      doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
      doc.moveDown();

      // Totals
      doc.text(`Total Balanced Remaining: ₹${student.fees.pending}`);
      doc.moveDown(2);

      // Footer
      doc.fontSize(10).text('This is a computer-generated receipt and does not require a physical signature.', { align: 'center', color: 'grey' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });
    } catch (error) {
      reject(error);
    }
  });
};
