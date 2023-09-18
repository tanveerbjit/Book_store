const ProductListDto = require("../dtos/responses/products.dto");
const AppResponseDto = require("../dtos/responses/app_response.dto");

const Comment = require('../models/comment.model');
const Product = require('../models/product.model');
const Tag = require('../models/tag.model');
const FileUpload = require('../models/file_upload.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const _ = require('lodash');

exports.index = async function (req, res, next) {
    try {
        const [products, productsCount, commentsCountArray] = await Promise.all([
            Product.find({})
                .limit(Number(req.pageSize))
                .skip(Number((req.page - 1) * req.pageSize))
                .sort({createdAt: 'desc'})
                .populate('tags', 'name')
                .populate('categories', 'name')
                .populate('images', 'filePath')
                .exec(),
            Product.count().exec(),
            Product.aggregate().project({
                comments: {
                    $size: "$comments"
                }
            })
        ]);

        let commentsCountArray = results[2];
        const offset = (req.page - 1) * req.pageSize;
        commentsCountArray = commentsCountArray.reverse().slice(offset, req.pageSize);

        const response = await ProductListDto.buildPagedList(products, commentsCountArray, req.page, req.pageSize, productsCount, req.baseUrl);
        res.json(response);
    } catch (err) {
        const errorResponse = AppResponseDto.buildWithErrorMessages(err);
        res.json(errorResponse);
    }
};

exports.getByTagId = async function (req, res, next) {
    const query = { tags: { "$in": [req.params.tag_name] } };
    const pageSize = parseInt(req.query.page_size) || 5;
    const page = parseInt(req.query.page) || 1;

    try {
        const [products, productsCount] = await Promise.all([
            Product.find(query)
                .limit(Number(pageSize))
                .skip(Number(pageSize * (page - 1)))
                .sort({ created_at: 'desc' })
                .populate('user')
                .populate('tags', 'name')
                .populate('categories', 'name')
                .exec(),
            Product.count(query).exec()
        ]);

        const response = await ProductListDto.buildPagedList(products, page, pageSize, productsCount, '');
        res.json(response);
    } catch (err) {
        next(err);
    }
};

exports.getByTag = async function (req, res, next) {
    try {
        const tag = await Tag.findOne({ name: req.params.tag_name });
        const query = { tags: { "$in": [tag.id] } };
        const pageSize = parseInt(req.query.page_size) || 5;
        const page = parseInt(req.query.page) || 1;

        const [products, productsCount] = await Promise.all([
            Product.find(query)
                .limit(Number(pageSize))
                .skip(Number(pageSize * (page - 1)))
                .sort({ created_at: 'desc' })
                .populate('user')
                .populate('tags', 'name')
                .populate('categories', 'name')
                .exec(),
            Product.count(query).exec()
        ]);

        const response = await ProductListDto.buildPagedList(products, page, pageSize, productsCount, '');
        res.json(response);
    } catch (err) {
        const errorResponse = AppResponseDto.buildWithErrorMessages('something went wrong ' + err);
        res.json(errorResponse);
    }
};

exports.getByCategoryId = async function (req, res, next) {
    const query = { categories: { "$in": [req.params.category_name] } };
    const pageSize = parseInt(req.query.page_size) || 5;
    const page = parseInt(req.query.page) || 1;

    try {
        const [products, productsCount] = await Promise.all([
            Product.find(query)
                .limit(Number(req.pageSize))
                .skip(Number(pageSize * (page - 1)))
                .sort({ created_at: 'desc' })
                .populate('user')
                .populate('tags')
                .populate('categories')
                .exec(),
            Product.count(query).exec()
        ]);

        const response = await ProductListDto.buildPagedList(products, page, pageSize, productsCount, '');
        res.json(response);
    } catch (err) {
        next(err);
    }
};

exports.getByCategory = async function (req, res, next) {
    try {
        const category = await Category.findOne({ name: req.params.category_name });
        const query = { categories: { "$in": [category.id] } };
        const pageSize = parseInt(req.query.page_size) || 5;
        const page = parseInt(req.query.page) || 1;

        const [products, productsCount] = await Promise.all([
            Product.find(query)
                .limit(Number(req.pageSize))
                .skip(Number(pageSize * (page - 1)))
                .sort({ created_at: 'desc' })
                .populate('user')
                .populate('tags')
                .populate('categories')
                .exec(),
            Product.count(query).exec()
        ]);

        const response = await ProductListDto.buildPagedList(products, page, pageSize, productsCount, '');
        res.json(response);
    } catch (err) {
        const errorResponse = AppResponseDto.buildWithErrorMessages('Something is wrong' + err);
        res.json(errorResponse);
    }
};

exports.getByIdOrSlug = async function (req, res, next) {
    try {
        const [productResult, comments] = await Promise.all([
            req.product
                .populate('tags', 'name')
                .populate('categories', 'name')
                .populate('comments')
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'user',
                        model: 'User'
                    }
                })
                .execPopulate(),
            Comment.find({ product: req.product }).populate('user').exec()
        ]);

        const product = productResult[0];
        product.comments = comments;
        const response = await ProductListDto.buildDetails(product, true);
        res.json(response);
    } catch (err) {
        const errorResponse = AppResponseDto.buildWithErrorMessages(err);
        res.json(errorResponse);
    }
};

