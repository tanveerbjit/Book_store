const { body } = require("express-validator");

module.exports = [
  body("user_type")
    .notEmpty()
    .withMessage("must enter a user type")
    .bail()
    .isIn(["u", "p"]) // Check if the input is either 'u' or 'p'
    .withMessage('Input must be either "u" or "p"')
    .bail(),
  body("userId")
    .notEmpty()
    .withMessage("must be a valid id")
    .bail()
    .isMongoId() // Check if it's a valid MongoDB ObjectId
    .withMessage("Invalid id format"),
];


    