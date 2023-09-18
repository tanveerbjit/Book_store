const Discount = require("../model/Discount"); 
const Product = require("../model/Product");

class DiscountController {

  async discount_add(req, res) {
    try {
      const {
        product,
        premium,
        generic,
        discountStartDateTime,
        discountDurationInMinutes,
      } = req.body;
  
      const existingProducts = await Product.find({ _id: { $in: product } });
  
      if (existingProducts.length !== product.length) {
        return res
          .status(404)
          .json({ success: false, message: "Product does not exist" });
      }
  
      // Define an array of product IDs to upsert discounts for
  
      // Create an array of `updateOne` operations for each product
      const upsertOperations = product.map((productId) => {
        const update = {
          discountStartDateTime: new Date(discountStartDateTime),
          discountDurationInMinutes: discountDurationInMinutes,
        };
  
        if (premium !== undefined) {
          update.premium = premium;
        }
  
        if (generic !== undefined) {
          update.generic = generic;
        }
  
        return {
          updateOne: {
            filter: { product: productId }, // Query to find the document by product ID
            update: { $set: update },
            upsert: true, // Perform an upsert operation
          },
        };
      });
  
      // Use bulkWrite to execute the upsert operations
      const discountDocs = await Discount.bulkWrite(upsertOperations);
  
      if (discountDocs) {
        return res
          .status(200)
          .json({ success: true, message: "Discount announced successfully" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Not updated" });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async discount_destroy(req, res) {
    try {
      const { product } = req.body;
  
      const existingProducts = await Product.find({ _id: { $in: product } });
  
      if (existingProducts.length !== product.length) {
        return res
          .status(404)
          .json({ success: false, message: "Product does not exist" });
      }
  
      // Define an array of product IDs to delete discounts for
      const deleteOperations = product.map((productId) => ({
        deleteOne: {
          filter: { product: productId }, // Query to find the document by product ID
        },
      }));
  
      // Use bulkWrite to execute the delete operations
      const result = await Discount.bulkWrite(deleteOperations);
  
      if (result.deletedCount > 0) {
        return res
          .status(200)
          .json({ success: true, message: "Discounts deleted successfully" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "No discounts were deleted" });
      }
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
  



}

module.exports = new DiscountController();


