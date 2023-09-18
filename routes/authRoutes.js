const express = require("express");
const router = express.Router();
const AuthController = require("../controller/AuthController");
const roleAttacher = require("../middleware/roleAttacher");
const reg_schema = require("../validation/schema/reg_schema");
const login_schema = require("../validation/schema/login_schema");
const validateToken = require("../middleware/validateToken");
const shcema_validation = require("../validation/schema_validation");
const forget_schema = require("../validation/schema/forget_schema");
const reset_schema = require("../validation/schema/reset_schema");




router.post(
  "/admin/registration",
  reg_schema,
  shcema_validation,
  roleAttacher,
  AuthController.registration
);

router.post(
  "/user/registration",
  reg_schema,
  shcema_validation,
  roleAttacher,
  AuthController.registration
);


router.post("/forget", forget_schema, shcema_validation, AuthController.otp);

router.post("/reset", reset_schema, shcema_validation, AuthController.reset);

router.get("/verification/:token", validateToken, AuthController.verification);


router.post("/login", login_schema, shcema_validation, AuthController.login);

router.get("/logout", AuthController.logout);


module.exports = router;
