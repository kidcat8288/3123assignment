const { body, param, query } = require("express-validator");

const employeeFields = (optional) => {
  const field = (name) => (optional ? body(name).optional() : body(name));

  // isString runs before trim to reject non string payloads
  const textField = (name, label, max) =>
    field(name)
      .isString()
      .withMessage(`${label} must be a string`)
      .bail()
      .trim()
      .notEmpty()
      .withMessage(`${label} is required`)
      .isLength({ max })
      .withMessage(`${label} is too long`);

  return [
    textField("first_name", "First name", 50),
    textField("last_name", "Last name", 50),
    textField("email", "Email", 100)
      .isEmail()
      .withMessage("Invalid email format"),
    textField("position", "Position", 100),
    field("salary")
      .notEmpty()
      .withMessage("Salary is required")
      .isFloat({ gt: 0 })
      .withMessage("Salary must be a positive number")
      .toFloat(),
    field("date_of_joining")
      .notEmpty()
      .withMessage("Date of joining is required")
      .isISO8601()
      .withMessage("Date of joining must be a valid date (YYYY-MM-DD)")
      .toDate(),
    textField("department", "Department", 100),
  ];
};

const eidParamValidator = [
  param("eid").isMongoId().withMessage("Invalid employee ID"),
];

const createEmployeeValidator = employeeFields(false);

const updateEmployeeValidator = [...eidParamValidator, ...employeeFields(true)];

const eidQueryValidator = [
  query("eid")
    .notEmpty()
    .withMessage("Employee ID (eid) query parameter is required")
    .isMongoId()
    .withMessage("Invalid employee ID"),
];

module.exports = {
  createEmployeeValidator,
  updateEmployeeValidator,
  eidParamValidator,
  eidQueryValidator,
};
