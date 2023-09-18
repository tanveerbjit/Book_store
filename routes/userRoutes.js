const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");
const CartController = require("../controller/CartController");
const CheckoutController = require("../controller/CheckoutController");
const ReviewController = require("../controller/ReviewController");
const RatingController = require("../controller/RatingController");
const cart_schema = require("../validation/schema/cart_schema");
const schema_validation = require("../validation/schema_validation");
const destroy_schema = require("../validation/schema/destroy_schema");
const rating_schema = require("../validation/schema/rating_schema");
const review_schema = require("../validation/schema/review_schema");
const amount_schema = require("../validation/schema/amount_schema");

router.get("/profile", UserController.profile);

router.get("/receipts", UserController.receipt);
/////////////////////////// review
router.post(
  "/review/store",
  review_schema,
  schema_validation,
  ReviewController.store
);
router.put(
  "/review/update",
  review_schema,
  schema_validation,
  ReviewController.update
);
router.delete("/review/destroy/:id", destroy_schema,schema_validation, ReviewController.destroy);


/////////////////////////// rating
router.post(
  "/rating/store",
  rating_schema,
  schema_validation,
  RatingController.store
);
router.put(
  "/rating/update",
  rating_schema,
  schema_validation,
  RatingController.update
);
router.delete(
  "/rating/destroy/:id",
  destroy_schema,
  schema_validation,
  RatingController.destroy
);



router.get("/get-cart", CartController.getCart);

router.get("/voucher", CheckoutController.voucher);
router.post("/checkout", CheckoutController.checkout);

router.post("/cart", cart_schema, schema_validation, CartController.cart);
router.patch(
  "/cart-remove",
  cart_schema,
  schema_validation,
  CartController.cart_remove
);
// router.post("/checkout", CartController.checkout);

router.put(
  "/amount/update",
  amount_schema,
  schema_validation,
  UserController.amount
);

module.exports = router;
