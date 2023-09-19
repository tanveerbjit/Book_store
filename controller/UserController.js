const success = require("../helpers/success");
const failure = require("../helpers/failed");
const User = require("../model/User");
const Review = require("../model/Review");
const Auth = require("../model/Auth")
const Order = require("../model/Order")
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");

class UserController {

  async profile(req, res) {
    try {
      const data = await User.findOne(
        { email: req.email },
        "-_id -__v -createdAt -updatedAt"
      );
      if (data) {
        return sendResponse(res, HTTP_STATUS.OK, "Data Has Found", data);
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "User Does not found",
          true
        );
      }
    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }

  async add_review(req, res) {
    try {
      const { productId, review } = req.body;

      const auth = await Auth.findById(req.id);

      // check for product availability
      const productExist = await Product.findById(productId);
      if (!productExist) {
        return res.status(404).json(failure("Product Does not found"));
      }

      const reviewExist = await Review.findOne({
        product: productId,
        user: req.id,
      });

      if (reviewExist) {
        return res.status(404).json(failure("review already exist"));
      }

      // Assume you have the productId and userId available
      const newReview = new Review({
        product: productId,
        user: req.id,
        review,
      });

      // Save the new review document to the database
      const data = await newReview.save();

      if (data) {
        return res
          .status(200)
          .json(success("Data Has been saved succesfully", data));
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async amount(req, res) {

    try {


      const { amount } = req.body;

      const userExist = await User.findOne({_id:req.user_id});
      
      if (!userExist) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "User Does not found",
          true
        );
        
      }

      const accAmount = userExist.amount + amount ;
      if(accAmount > 100000){

        return sendResponse(
          res,
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          `your existing amount is ${userExist.amount} your max limit of credit is 100000 try to input less amount`,
          true
        );
       
      }

      userExist.amount = userExist.amount + amount;
      const result = userExist.save();

      if(result){
        return sendResponse(res, HTTP_STATUS.OK, `credited by ${amount}`);
      }else{
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "unsuccess transaction try try again",
          true
        );
        
      }








      // check for product availability
  

      

      
    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }

  // async order(req, res) {
  //   try {
  //     const data = await Order.find(
  //       { email: req.email },
  //       "-_id -__v -createdAt -updatedAt"
  //     );
  //     if (data) {
  //       return res.status(200).json(success("Data Has Found", data));
  //     } else {
  //       return res.status(404).json(failure("Data Does not found"));
  //     }
  //   } catch (error) {
  //     return res.status(500).json(failure("Internal Server Error"));
  //   }
  // }


  async receipt(req, res) {
    try {
    
      const data = await Order.find({ user: req.user_id }).populate("user");
      if (data.length < 1) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
      } else {
        return sendResponse(res, HTTP_STATUS.OK, "data found",data);
      }
    } catch (error) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }
  
}

module.exports = new UserController();
