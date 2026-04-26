import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'ADD_STUDENT', 'UPDATE_FEE'
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetModel: { type: String }, // e.g., 'Student', 'Payment'
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
  ipAddress: String
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
