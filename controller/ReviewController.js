const success = require("../helpers/success");
const failure = require("../helpers/failed");
const User = require("../model/User");
const Review = require("../model/Review");
const Auth = require("../model/Auth");
const Product = require("../model/Product");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");

class ReviewController {
  async store(req, res) {
    try {
      const { productId, review } = req.body;

      const auth = await Auth.findById(req.id);

      // check for product availability
      const productExist = await Product.findById(productId);
      if (!productExist) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Product Does not found",
          true
        );
       
      }

      const reviewExist = await Review.findOne({
        product: productId,
        user: req.id,
      });

      if (reviewExist) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "review already exist",
          true
        );
       
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
        return sendResponse(res, HTTP_STATUS.OK, "Data Has been saved succesfully", data);
        
      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
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

  async update(req, res) {
    try {
      const { productId, review } = req.body;

      const reviewExist = await Review.findOne({product:productId,user:req.id});

      if (!reviewExist) {

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "review Does not found",
          true
        );
        
      }

      reviewExist.review = review;


      const updatedReview = await reviewExist.save();


      // const updatedReview = await Review.findOneAndUpdate(
      //   { _id: productId },
      //   {$set:{review}},
      //   { new: true }
      // );

      console.log(updatedReview);

      if (updatedReview) {
        return sendResponse(res, HTTP_STATUS.OK, "review updated successfully", updatedReview);
      } else {

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "review not found",
          true
        );
        
      }
    } catch (err) {
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal server error",
        true
      );
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;

      const reviewExist = await Review.findOne({_id:id,user:req.id});

      if (!reviewExist) {

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "review not found",
          true
        );
        
      }

      const deletedReview = await Review.findOneAndDelete({
        _id: id,
      });

      if (deletedReview) {

        return sendResponse(res, HTTP_STATUS.OK, "review deleted successfully", deletedReview);
        
      } else {

        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "review not found",
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
}

module.exports = new ReviewController();
