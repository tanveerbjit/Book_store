const success = require("../helpers/success");
const failure = require("../helpers/failed");
const User = require("../model/User");
const Rating = require("../model/Rating");
const Auth = require("../model/Auth");
const Product = require("../model/Product");

class ReviewController {

  async store(req, res) {
    try {
      const { productId, rating } = req.body;

      // check for product availability
      const productExist = await Product.findById(productId);
      if (!productExist) {
        return res.status(404).json(failure("Product Does not found"));
      }

      const ratingExist = await Rating.findOne({
        product: productId,
        user: req.id,
      });


      if (ratingExist) {
        return res.status(404).json(failure("rating already exist"));
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
         return res
           .status(200)
           .json(success("Data Has been saved succesfully", data));
       } else {
         return res.status(404).json(failure("Data Does not found"));
       }
         
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async update(req, res) {
    try {
      const { productId, rating } = req.body;

      // check for product availability
      const productExist = await Product.findById(productId);
      if (!productExist) {
        return res.status(404).json(failure("Product Does not found"));
      }

      const ratingExist = await Rating.findOne({
        product: productId,
        user: req.id,
      });

      if (!ratingExist) {
        return res.status(404).json(failure("Rating Does not exist"));
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
          return res
            .status(200)
            .json(success("Data Has been saved succesfully", data));
        } else {
          return res.status(404).json(failure("Data Does not found"));
        }
      } else {
        return res.status(404).json(failure("Data Does not found"));
      }
    } catch (error) {
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

  async destroy(req, res) {
    try {

      const { id } = req.params;

      const ratingExist = await Rating.findOne({_id:id,user:req.id});

      if (!ratingExist) {
        return res.status(404).json(failure("Rating Does not found"));
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
             return res
               .status(200)
               .json({
                 success: true,
                 message:
                   "Rating deleted successfully",
               });
          } else {
            return res
              .status(200)
              .json({ success: true, message: "Rating deleted successfully but prodect update unsuccess" });
          }
        }

        return res
          .status(200)
          .json({ success: true, message: "Rating deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Rating not found" });
      }
    } catch (error) {
      console.log(error)
      return res.status(500).json(failure("Internal Server Error"));
    }
  }

}

module.exports = new ReviewController();
