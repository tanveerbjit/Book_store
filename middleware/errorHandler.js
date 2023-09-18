const { constants } = require("../helpers/errorConstants");
const errorMessage = require("../helpers/errosMessages");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  switch (statusCode) {

    case constants.VALIDATION_ERROR.code:
      res.json(errorMessage(constants.VALIDATION_ERROR.msg,err));
      break;

    case constants.NOT_FOUND.code:
      res.json(errorMessage(constants.NOT_FOUND.msg, err));
      break;
     
    case constants.UNAUTHORIZED.code:
      res.json(errorMessage(constants.UNAUTHORIZED.msg, err));
      break;
    
    case constants.FORBIDDEN.code:
      res.json(errorMessage(constants.FORBIDDEN.msg, err));
      break;
     
    case constants.SERVER_ERROR.code:
      res.json(errorMessage(constants.SERVER_ERROR.msg, err));
      break;
     
    default:
      console.log("No Error, All good !");
      break;
  }
};

module.exports = errorHandler;


