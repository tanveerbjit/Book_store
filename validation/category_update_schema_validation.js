const { validationResult } = require("express-validator");

const category_update_schema_validation = function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      failure: true,
      errors: errors.array(),
    });
  }
  next();
};

module.exports = category_update_schema_validation;
