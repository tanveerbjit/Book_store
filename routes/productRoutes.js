const express = require("express");
const router = express.Router();
const ProductController = require("../controller/ProductController");
const paging = require("../middleware/paging");
const book_parameter_schema = require("../validation/schema/book_parameter_schema");
const schema_validation = require("../validation/schema_validation");
const mongo_id_schema = require("../validation/schema/mongo_id_schema");



///////////// CRUD OPERATION

router.get("/all",book_parameter_schema,schema_validation,paging, ProductController.index);
router.get("/show/:id",mongo_id_schema,schema_validation, ProductController.show);



module.exports = router;