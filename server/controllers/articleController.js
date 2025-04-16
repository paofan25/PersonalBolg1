const Article = require('../models/Article');
const Like = require('../models/Like');
const Favorite = require('../models/Favorite');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    创建文章
// @route   POST /api/articles
// @access  Private
exports.createArticle = asyncHandler(async (req, res, next) => {
    // 添加作者信息
    req.body.author = req.user.id;

    const article = await Article.create(req.body);
    res.status(201).json({
        success: true,
        data: article
    });
});

// @desc    获取所有文章
// @route   GET /api/articles
// @access  Public
exports.getArticles = asyncHandler(async (req, res, next) => {
    let query = Article.find().populate('author', 'username avatar');

    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    query = query.skip(startIndex).limit(limit);

    // 排序
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    const articles = await query;
    const total = await Article.countDocuments();

    res.status(200).json({
        success: true,
        count: articles.length,
        total,
        data: articles
    });
});

// @desc    获取单个文章
// @route   GET /api/articles/:id
// @access  Public
exports.getArticle = asyncHandler(async (req, res, next) => {
    const article = await Article.findById(req.params.id)
        .populate('author', 'username avatar');

    if (!article) {
        return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的文章`, 404));
    }

    // 增加浏览量
    article.viewCount += 1;
    await article.save();

    res.status(200).json({
        success: true,
        data: article
    });
});

// @desc    更新文章
// @route   PUT /api/articles/:id
// @access  Private
exports.updateArticle = asyncHandler(async (req, res, next) => {
    let article = await Article.findById(req.params.id);

    if (!article) {
        return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的文章`, 404));
    }

    // 确保用户是文章作者
    if (article.author.toString() !== req.user.id) {
        return next(new ErrorResponse('未经授权的操作', 401));
    }

    article = await Article.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: article
    });
});

// @desc    删除文章
// @route   DELETE /api/articles/:id
// @access  Private
exports.deleteArticle = asyncHandler(async (req, res, next) => {
    const article = await Article.findById(req.params.id);

    if (!article) {
        return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的文章`, 404));
    }

    // 确保用户是文章作者
    if (article.author.toString() !== req.user.id) {
        return next(new ErrorResponse('未经授权的操作', 401));
    }

    await article.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    点赞文章
// @route   POST /api/articles/:id/like
// @access  Private
exports.likeArticle = asyncHandler(async (req, res, next) => {
    const article = await Article.findById(req.params.id);

    if (!article) {
        return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的文章`, 404));
    }

    // 检查是否已经点赞
    const existingLike = await Like.findOne({
        user: req.user.id,
        article: req.params.id
    });

    if (existingLike) {
        return next(new ErrorResponse('您已经点赞过这篇文章了', 400));
    }

    // 创建点赞记录
    await Like.create({
        user: req.user.id,
        article: req.params.id
    });

    // 更新文章点赞数
    article.likeCount += 1;
    await article.save();

    res.status(200).json({
        success: true,
        data: article
    });
});

// @desc    取消点赞
// @route   DELETE /api/articles/:id/like
// @access  Private
exports.unlikeArticle = asyncHandler(async (req, res, next) => {
    const article = await Article.findById(req.params.id);

    if (!article) {
        return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的文章`, 404));
    }

    // 删除点赞记录
    const result = await Like.findOneAndDelete({
        user: req.user.id,
        article: req.params.id
    });

    if (!result) {
        return next(new ErrorResponse('您还没有点赞这篇文章', 400));
    }

    // 更新文章点赞数
    article.likeCount = Math.max(0, article.likeCount - 1);
    await article.save();

    res.status(200).json({
        success: true,
        data: article
    });
});

// @desc    收藏文章
// @route   POST /api/articles/:id/favorite
// @access  Private
exports.favoriteArticle = asyncHandler(async (req, res, next) => {
    const article = await Article.findById(req.params.id);

    if (!article) {
        return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的文章`, 404));
    }

    // 检查是否已经收藏
    const existingFavorite = await Favorite.findOne({
        user: req.user.id,
        article: req.params.id
    });

    if (existingFavorite) {
        return next(new ErrorResponse('您已经收藏过这篇文章了', 400));
    }

    // 创建收藏记录
    await Favorite.create({
        user: req.user.id,
        article: req.params.id
    });

    // 更新文章收藏数
    article.favoriteCount += 1;
    await article.save();

    res.status(200).json({
        success: true,
        data: article
    });
});

// @desc    取消收藏
// @route   DELETE /api/articles/:id/favorite
// @access  Private
exports.unfavoriteArticle = asyncHandler(async (req, res, next) => {
    const article = await Article.findById(req.params.id);

    if (!article) {
        return next(new ErrorResponse(`未找到ID为 ${req.params.id} 的文章`, 404));
    }

    // 删除收藏记录
    const result = await Favorite.findOneAndDelete({
        user: req.user.id,
        article: req.params.id
    });

    if (!result) {
        return next(new ErrorResponse('您还没有收藏这篇文章', 400));
    }

    // 更新文章收藏数
    article.favoriteCount = Math.max(0, article.favoriteCount - 1);
    await article.save();

    res.status(200).json({
        success: true,
        data: article
    });
}); 