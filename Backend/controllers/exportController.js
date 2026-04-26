import xlsx from 'xlsx';
import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import path from 'path';
import fs from 'fs';

export const exportStudentsToExcel = async (req, res, next) => {
  try {
    const students = await Student.find().select('-password -otp');
    
    const data = students.map(s => ({
      'Student ID': s.studentId,
      'Name': s.name,
      'Email': s.email,
      'Department': s.department,
      'Year': s.year,
      'Total Fees': s.fees.total,
      'Paid Fees': s.fees.paid,
      'Pending Fees': s.fees.pending
    }));

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

    const filePath = path.join('temp', `students_export_${Date.now()}.xlsx`);
    if (!fs.existsSync('temp')) fs.mkdirSync('temp');

    xlsx.writeFile(workbook, filePath);

    res.download(filePath, 'students_report.xlsx', (err) => {
      if (err) next(err);
      fs.unlinkSync(filePath); // Delete file after download
    });
  } catch (error) {
    next(error);
  }
};
