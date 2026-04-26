import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  deptId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  totalStudents: { type: Number, default: 0 },
  headOfDepartment: String
}, { timestamps: true });

departmentSchema.set('toJSON', { virtuals: true });
departmentSchema.set('toObject', { virtuals: true });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
