const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const isAdmin = asyncHandler(async (req, res, next) => {

    const token = req.cookies.token;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECERT, (err, decoded) => {

      if (err) {

        if(err instanceof jwt.TokenExpiredError){
            res.status(401);
            throw new Error("Time expired please login again");
        }else if(err instanceof jwt.JsonWebTokenError){
            res.status(401);
            throw new Error("token is invalid");
        }else{
          res.status(401);
            throw new Error("token is invalid");
        }
       
      }


      if (decoded.user_data.role !== "a") {
        res.status(401);
        throw new Error("User is not authorized");
      } else {
        req.email = decoded.user_data.email;
        req.id = decoded.user_data._id;
        req.user_id = decoded.user_data.user;
      }
    
      next();
      

    });

});

module.exports = isAdmin;
