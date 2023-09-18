const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const success = require("../helpers/success");
const failure = require("../helpers/failed");

const validateToken = asyncHandler(async (req, res, next) => {

  if (req.params.token) {
    jwt.verify(
      req.params.token,
      process.env.ACCESS_TOKEN_SECERT,
      (err, decoded) => {
        if (err) {
          return res.status(401).json(failure("User is not authorized"));
        }
        req.email = decoded.user.email;
        req.id = decoded.user.id;

        next();
      }
    );
  }else{
     res.status(401);
     throw new Error("User is not authorized or token is missing");
  }
});

module.exports = validateToken;
