const { matchedData } = require("express-validator");
const logger = require("../config/logger");
const employeeService = require("../services/employeeService");
const AppError = require("../utils/AppError");

// Owner always comes from the verified token, never from the request

const getEmployee = async (req, res) => {
  const employee = await employeeService.getEmployeeById(
    req.params.eid,
    req.user.id,
  );
  res.status(200).json({ status: true, employee });
};

const getEmployeesByOwner = async (req, res) => {
  const employees = await employeeService.getAllEmployeesByOwner(req.user.id);
  res.status(200).json({ status: true, count: employees.length, employees });
};

const createEmployee = async (req, res) => {
  const employeeData = matchedData(req, { locations: ["body"] });
  const employee = await employeeService.createEmployee(
    req.user.id,
    employeeData,
  );
  logger.info(`Employee ${employee._id} created by user ${req.user.id}`);

  res.status(201).json({
    status: true,
    message: "Employee created successfully.",
    employee,
  });
};

const updateEmployee = async (req, res) => {
  // Only validated fields are applied
  const updates = matchedData(req, { locations: ["body"] });
  if (Object.keys(updates).length === 0) {
    throw new AppError(400, "No valid fields provided to update.");
  }

  const employee = await employeeService.updateEmployee(
    req.params.eid,
    req.user.id,
    updates,
  );
  logger.info(`Employee ${employee._id} updated by user ${req.user.id}`);

  res.status(200).json({
    status: true,
    message: "Employee details updated successfully.",
    employee,
  });
};

const deleteEmployee = async (req, res) => {
  await employeeService.deleteEmployee(req.query.eid, req.user.id);
  logger.info(`Employee ${req.query.eid} deleted by user ${req.user.id}`);

  res.status(204).send();
};

module.exports = {
  getEmployee,
  getEmployeesByOwner,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
