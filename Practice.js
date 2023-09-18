


      const aggregatePipeline = [];

      
      aggregatePipeline.push({
        $match: {
          _id: mongoose.Types.ObjectId(productId),
        },
      });


      // Add a $lookup stage to join the 'Author' collection
      aggregatePipeline.push({
        $lookup: {
          from: "authors",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      });

      // Add a $lookup stage to join the 'Category' collection
      aggregatePipeline.push({
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      });

      // Add a $lookup stage to join the 'Publication' collection
      aggregatePipeline.push({
        $lookup: {
          from: "publishers",
          localField: "publisher",
          foreignField: "_id",
          as: "publisherInfo",
        },
      });

      // Add a $lookup stage to join the 'Discount' collection
      aggregatePipeline.push({
        $lookup: {
          from: "discounts",
          localField: "_id",
          foreignField: "product",
          as: "discounts",
        },
      });

      aggregatePipeline.push({
        $lookup: {
          from: "reviews",
          localField: "_id", // Assuming that the product's _id is used in the 'Review' collection as the 'product' field.
          foreignField: "product",
          as: "reviews",
        },
      });
      
      // Add a $lookup stage to join the 'User' collection for review users
      aggregatePipeline.push({
        $lookup: {
          from: "users",
          localField: "reviews.user",
          foreignField: "_id",
          as: "reviewUsers",
        },
      });

      aggregatePipeline.push({
        $unwind: {
          path: "$discounts",
          preserveNullAndEmptyArrays: true,
        },
      });

      aggregatePipeline.push({
        $addFields: {
          reviews: {
            $map: {
              input: "$reviews",
              as: "reviewData",
              in: {
                review: "$$reviewData.review",
                // Include user info from the 'reviewUsers' array
                user: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$reviewUsers",
                        as: "user",
                        cond: { $eq: ["$$user._id", "$$reviewData.user"] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      });

      aggregatePipeline.push({
        $lookup: {
          from: "discounts", // Replace with the actual name of your discount collection
          localField: "_id",
          foreignField: "product",
          as: "discount",
        },
      });

      aggregatePipeline.push({
        $addFields: {
          discount: {
            $arrayElemAt: ["$discount", 0],
          },
        },
      });

      aggregatePipeline.push({
        $addFields: {
          currentDateTime: new Date(),
        },
      });

      aggregatePipeline.push({
        $addFields: {
          isValidDiscount: {
            $and: [
              {
                $gte: [
                  "$currentDateTime",
                  {
                    $ifNull: ["$discount.discountStartDateTime", new Date(0)],
                  },
                ],
              },
              {
                $lte: [
                  "$currentDateTime",
                  {
                    $add: [
                      {
                        $ifNull: [
                          "$discount.discountStartDateTime",
                          new Date(0),
                        ],
                      },
                      {
                        $multiply: [
                          {
                            $ifNull: ["$discount.discountDurationInMinutes", 0],
                          },
                          60000, // Convert duration to milliseconds
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      });

      aggregatePipeline.push({
        $addFields: {
          genericDiscount: {
            $cond: [
              "$isValidDiscount",
              {
                percentage: { $ifNull: ["$discount.generic", 0] },
                discountedPrice: {
                  $multiply: [
                    "$price",
                    { $ifNull: ["$discount.generic", 0] },
                    0.01,
                  ],
                },
              },
              {
                percentage: 0,
                discountedPrice: 0,
              },
            ],
          },
        },
      });

      aggregatePipeline.push({
        $addFields: {
          premiumDiscount: {
            $cond: [
              "$isValidDiscount",
              {
                percentage: { $ifNull: ["$discount.premium", 0] },
                discountedPrice: {
                  $multiply: [
                    "$price",
                    { $ifNull: ["$discount.premium", 0] },
                    0.01,
                  ],
                },
              },
              {
                percentage: 0,
                discountedPrice: 0,
              },
            ],
          },
        },
      });

      // Add a $project stage to calculate and show discounted prices
      aggregatePipeline.push({
        $project: {
          name: 1,
          price: 1,
          stock: 1,
          image: 1,
          description: 1,
          edition: 1,
          number_of_pages: 1,
          rating: 1,
          authorInfo: {
            $map: {
              input: "$authorInfo",
              as: "authorData",
              in: {
                firstName: "$$authorData.firstName",
                lastName: "$$authorData.lastName",
                biography: "$$authorData.biography",
                birthDate: "$$authorData.birthDate",
              },
            },
          },
          categoryInfo: {
            $map: {
              input: "$categoryInfo",
              as: "categoryData",
              in: {
                name: "$$categoryData.name",
                description: "$$categoryData.description",
              },
            },
          },
          publisherInfo: {
            $map: {
              input: "$publisherInfo",
              as: "publisherData",
              in: {
                name: "$$publisherData.name",
                location: "$$publisherData.location",
                foundingYear: "$$publisherData.foundingYear",
              },
            },
          },
          genericDiscount: 1,
          premiumDiscount: 1,
          isValidDiscount: 1,
        },
      });

  

      const results = await Product.aggregate(aggregatePipeline);

    

    


