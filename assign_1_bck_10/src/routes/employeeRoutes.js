const express = require("express");
const router = express.Router();

const authenticateToken = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const {
  createEmployeeValidator,
  updateEmployeeValidator,
  eidParamValidator,
  eidQueryValidator,
} = require("../validators/employeeValidator");
const employeeController = require("../controllers/employeeController");

router.use(authenticateToken);

router.get("/employees", employeeController.getEmployeesByOwner);

router.post(
  "/employees",
  createEmployeeValidator,
  validate,
  employeeController.createEmployee,
);

router.get(
  "/employees/:eid",
  eidParamValidator,
  validate,
  employeeController.getEmployee,
);
router.put(
  "/employees/:eid",
  updateEmployeeValidator,
  validate,
  employeeController.updateEmployee,
);
router.delete(
  "/employees",
  eidQueryValidator,
  validate,
  employeeController.deleteEmployee,
);

module.exports = router;
