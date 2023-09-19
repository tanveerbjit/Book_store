const success = require("../helpers/success");
const failure = require("../helpers/failed");
const User = require("../model/User");
const Rating = require("../model/Rating");
const Auth = require("../model/Auth");
const Product = require("../model/Product");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse } = require("../util/common");

class ReviewController {

  async store(req, res) {
    try {
      const { productId, rating } = req.body;

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

      const ratingExist = await Rating.findOne({
        product: productId,
        user: req.id,
      });


      if (ratingExist) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "you already add rating please edit it",
          true
        );
      }

      // Assume you have the productId and userId available
      const newRating = new Rating({
        product: productId,
        user: req.id,
        rating,
      });

      // Save the new review document to the database
      const data = await newRating.save();



      if (data) {
        console.log(data);

       let ratings = productExist.rating * productExist.num_of_people ;
       ratings = ratings + rating ;
       ratings = ratings / (productExist.num_of_people + 1);

       productExist.num_of_people = productExist.num_of_people + 1;
       productExist.rating = ratings;
       const productSave = await productExist.save();

       if (productSave) {

        return sendResponse(res, HTTP_STATUS.OK, "Data Has been saved succesfully", data);
         
       } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Data Does not found",
          true
        );
        
       }
         
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
      const { productId, rating } = req.body;

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

      const ratingExist = await Rating.findOne({
        product: productId,
        user: req.id,
      });

      if (!ratingExist) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Rating Does not exist",
          true
        );
       
      }
      let previousRating = ratingExist.rating;
      // Assume you have the productId and userId available
      ratingExist.rating = rating;
      // Save the new review document to the database
      const data = await ratingExist.save();

      if (data) {

        let ratings = productExist.rating * productExist.num_of_people;
        ratings = ratings - previousRating;
        ratings = ratings + rating;
        ratings = ratings / (productExist.num_of_people);
        productExist.rating = ratings;
        const productSave = await productExist.save();

        if (productSave) {
          return sendResponse(res, HTTP_STATUS.OK, "Data Has been saved succesfully", data);
          
        } else {
          return sendResponse(
            res,
            HTTP_STATUS.NOT_FOUND,
            "Data Does not found",
            true
          );
        
        }
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

  async destroy(req, res) {
    try {

      const { id } = req.params;

      const ratingExist = await Rating.findOne({_id:id,user:req.id});
      console.log(req.id)

      if (!ratingExist) {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Rating Does not found",
          true
        );
     
      }

      const deletedRating = await Rating.findOneAndDelete({
        _id: id,
      });

      if (deletedRating) {

        const productExist = await Product.findById(ratingExist.product);

        if (productExist) {
          let ratings = productExist.rating * productExist.num_of_people;
          ratings = ratings - ratingExist.rating;
          ratings = ratings / (productExist.num_of_people - 1);
          productExist.rating = ratings;
          productExist.num_of_people = productExist.num_of_people - 1;
          const productSave = await productExist.save();
          if (productSave) {
            return sendResponse(res, HTTP_STATUS.OK, "Rating deleted successfully");
             
          } else {
            return sendResponse(res, HTTP_STATUS.OK, "Rating deleted successfully but prodect update unsuccess");
          
          }
        }
        return sendResponse(res, HTTP_STATUS.OK, "Rating deleted successfully");

      } else {
        return sendResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "Rating not found",
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
