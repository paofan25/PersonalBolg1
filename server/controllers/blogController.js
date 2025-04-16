const { validationResult } = require('express-validator');
const Blog = require('../models/Blog');

// @desc    获取所有博客文章
exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    const query = {};

    // 添加分类筛选
    if (category) {
      query.category = category;
    }

    // 添加标签筛选
    if (tag) {
      query.tags = tag;
    }

    // 添加搜索功能
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      code: 200,
      data: {
        blogs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// @desc    获取单个博客文章
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('comments');

    if (!blog) {
      return res.status(404).json({
        code: 404,
        message: '博客文章不存在'
      });
    }

    // 增加浏览量
    blog.views += 1;
    await blog.save();

    res.json({
      code: 200,
      data: blog
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// @desc    创建博客文章
exports.createBlog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      errors: errors.array()
    });
  }

  try {
    const blog = new Blog({
      ...req.body,
      author: req.user.id
    });

    await blog.save();

    res.status(201).json({
      code: 200,
      data: blog
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// @desc    更新博客文章
exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        code: 404,
        message: '博客文章不存在'
      });
    }

    // 确保用户是文章作者
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '没有权限修改此文章'
      });
    }

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.json({
      code: 200,
      data: blog
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// @desc    删除博客文章
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        code: 404,
        message: '博客文章不存在'
      });
    }

    // 确保用户是文章作者
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '没有权限删除此文章'
      });
    }

    await blog.remove();

    res.json({
      code: 200,
      message: '博客文章已删除'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
}; 