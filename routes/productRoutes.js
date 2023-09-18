const express = require("express");
const router = express.Router();
const ProductController = require("../controller/ProductController");
const paging = require("../middleware/paging");



///////////// CRUD OPERATION

router.get("/all",paging, ProductController.index);
router.get("/show/:id", ProductController.show);



module.exports = router;