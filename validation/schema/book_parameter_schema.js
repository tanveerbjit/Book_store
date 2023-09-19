const { query } = require("express-validator");

module.exports = [
  query("price")
    .optional()
    .isFloat({min:0,max:100000000})
    .withMessage('price range is in between 0 to 100000000')
    .bail(),
 query("stock")
    .optional()
    .isInt({min:0,max:100000000})
    .withMessage('stock range is in between 0 to 100000000')
    .bail(),
 query("query")
    .optional()
    .isString()
    .withMessage('Query must be string')
    .bail()
    .isLength({max:50})
    .withMessage('Query can not exceed 50 character')
    .bail(),
 query("page_size")
    .optional()
    .isInt({min:1,max:25})
    .withMessage('page size  is in between 1 to 25')
    .bail(),
 query("page")
    .optional()
    .isInt({min:1,max:1000000000})
    .withMessage('page is in between 1 to 1000000000')
    .bail(),
 query("priceRange")
    .optional()
    .isIn(["lte", "gte"]) // Check if the input is either 'u' or 'p'
    .withMessage("range comparison must be either lte or gte")
    .bail(),
 query("stockRange")
    .optional()
    .isIn(["lte", "gte"]) // Check if the input is either 'u' or 'p'
    .withMessage("range comparison must be either lte or gte")
    .bail(),
 query("stockSort")
    .optional()
    .isIn(["asc", "dsc"]) // Check if the input is either 'u' or 'p'
    .withMessage("sort must be either asc or dsc")
    .bail(),
 query("priceSort")
    .optional()
    .isIn(["asc", "dsc"]) // Check if the input is either 'u' or 'p'
    .withMessage("sort must be either asc or dsc")
    .bail(),
 query("discountSort")
    .optional()
    .isIn(["asc", "dsc"]) // Check if the input is either 'u' or 'p'
    .withMessage("sort must be either asc or dsc")
    .bail(),
];


    