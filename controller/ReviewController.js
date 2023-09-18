const success = require("../helpers/success");
const failure = require("../helpers/failed");
const User = require("../model/User");
const Review = require("../model/Review");
const Auth = require("../model/Auth");
const Product = require("../model/Product");

class ReviewController {
  async store(req, res) {
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

  async update(req, res) {
    try {
      const { productId, review } = req.body;

      const reviewExist = await Review.findOne({product:productId,user:req.id});

      if (!reviewExist) {
        return res.status(404).json(failure("review Does not found"));
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
        res.status(200).json({
          success: true,
          message: "review updated successfully",
          review: updatedReview,
        });
      } else {
        res.status(404).json({ success: false, message: "review not found" });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;

      const reviewExist = await Review.findOne({id:_id,user:req.id});

      if (!reviewExist) {
        return res.status(404).json(failure("review Does not found"));
      }

      const deletedReview = await Review.findOneAndDelete({
        _id: id,
      });

      if (deletedReview) {
        res
          .status(200)
          .json({ success: true, message: "review deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "review not found" });
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }
}

module.exports = new ReviewController();
