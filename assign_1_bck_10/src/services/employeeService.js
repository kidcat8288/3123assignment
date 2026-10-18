const Employee = require("../models/Employee");
const AppError = require("../utils/AppError");
const logger = require("../config/logger");

// Every query also filters by owner, so other users' employees never match

// 403 if it belongs to another user, otherwise 404
async function throwNotFoundOrForbidden(eid, userId) {
  const exists = await Employee.exists({ _id: eid });
  if (exists) {
    logger.warn(
      `Authorization failure: user ${userId} tried to access employee ${eid}`,
    );
    throw new AppError(403, "You do not have access to this employee.");
  }
  throw new AppError(404, "Employee not found.");
}

async function getAllEmployeesByOwner(userId) {
  return Employee.find({ user: userId }).sort({ created_at: -1 });
}

async function getEmployeeById(eid, userId) {
  const employee = await Employee.findOne({ _id: eid, user: userId });
  if (!employee) await throwNotFoundOrForbidden(eid, userId);
  return employee;
}

async function createEmployee(userId, employeeData) {
  const employee = new Employee({ ...employeeData, user: userId });
  await employee.save();
  return employee;
}

async function updateEmployee(eid, userId, updates) {
  // Owner can never be changed
  delete updates.user;

  const employee = await Employee.findOneAndUpdate(
    { _id: eid, user: userId },
    updates,
    { returnDocument: "after", runValidators: true },
  );
  if (!employee) await throwNotFoundOrForbidden(eid, userId);
  return employee;
}

async function deleteEmployee(eid, userId) {
  const result = await Employee.deleteOne({ _id: eid, user: userId });
  if (result.deletedCount === 0) await throwNotFoundOrForbidden(eid, userId);
}

module.exports = {
  getAllEmployeesByOwner,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
