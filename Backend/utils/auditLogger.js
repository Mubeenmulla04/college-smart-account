import AuditLog from '../models/AuditLog.js';
import logger from './logger.js';

export const createAuditLog = async ({ action, performedBy, targetId, targetModel, details, req }) => {
  try {
    const log = new AuditLog({
      action,
      performedBy,
      targetId,
      targetModel,
      details,
      ipAddress: req ? req.ip : 'unknown'
    });
    await log.save();
    logger.info(`Audit Log: ${action} by ${performedBy}`);
  } catch (error) {
    logger.error('Error creating audit log:', error);
  }
};
