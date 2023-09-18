const mongoose = require('mongoose');



const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name must not be emtpy"] },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    edition: { type: String, required: true },
    number_of_pages: { type: Number, required: true },
    rating: {
      type: Number,
      default: 0, // Set the default value to 0
    },
    num_of_people: {
      type: Number,
      default: 0, // Set the default value to 0
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category", // Reference to the User model
        required: [true, "Category must be specified"],
        _id: false,
      },
    ],
    // sub_category: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Subcategory", // Reference to the User model
    //     _id: false,
    //   },
    // ],
    author: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author", // Reference to the User model
        required: [true, "Author must be specified"],
        _id: false,
      },
    ],
    publisher: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Publisher", // Reference to the User model
        required: [true, "Publication must be specified"],
        _id: false,
      },
    ],
  },
  { timestamps: true }
);


ProductSchema.virtual('reviews', {
  ref: 'Review', // Reference to the Review model
  localField: '_id', // Field in the Product model that holds the reference
  foreignField: 'product', // Field in the Review model that references the product
});

ProductSchema.set('toObject', { virtuals: true });
ProductSchema.set('toJSON', { virtuals: true });



const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;

