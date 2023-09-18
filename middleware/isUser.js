const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const isUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  jwt.verify(token, process.env.ACCESS_TOKEN_SECERT, (err, decoded) => {
    if (err) {
      res.status(401);
      throw new Error("User is not authorized");
    }
    if (decoded.user_data.role !== "u") {
      res.status(401);
      throw new Error("User is not authorized");
    }else{
      req.email = decoded.user_data.email;
      req.id = decoded.user_data._id;
      req.user_id = decoded.user_data.user;
    }

    next();
  });
});

module.exports = isUser;
