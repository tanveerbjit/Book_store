const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const success = require("../helpers/success");
const failure = require("../helpers/failed");

const { sendResponse } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

const validateToken = asyncHandler(async (req, res, next) => {

  if (req.params.token) {
    jwt.verify(
      req.params.token,
      process.env.ACCESS_TOKEN_SECERT,
      (err, decoded) => {
        if (err) {
          return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "User is not authorized or token is missin",true);
        }
        req.email = decoded.user.email;
        req.id = decoded.user.id;
        next();
      }
    );
  }else{
    return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "User is not authorized or token is missin",true)
  }
});

module.exports = validateToken;
