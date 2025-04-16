const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { validationResult } = require('express-validator');

// @desc    获取所有文章
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Post.countDocuments();

    // 查询文章并根据创建时间降序排序
    const posts = await Post.find()
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // 添加分页结果
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: posts.length,
      pagination,
      data: posts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    获取单篇文章
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar');

    if (!post) {
      return res.status(404).json({ success: false, message: '文章不存在' });
    }

    // 增加浏览量
    post.views += 1;
    await post.save();

    // 获取文章评论
    const comments = await Comment.find({ post: post._id })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        ...post._doc,
        comments
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    创建文章
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, coverImage, tags } = req.body;

    const post = await Post.create({
      title,
      content,
      coverImage: coverImage || 'default-post.jpg',
      tags: tags || [],
      author: req.user.id
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    更新文章
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: '文章不存在' });
    }

    // 确保用户有权限更新
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限执行此操作' });
    }

    const { title, content, coverImage, tags } = req.body;

    // 更新文章
    const updateData = {
      title: title || post.title,
      content: content || post.content,
      tags: tags || post.tags,
      updatedAt: Date.now()
    };

    if (coverImage) {
      updateData.coverImage = coverImage;
    }

    post = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('author', 'username avatar');

    res.json({
      success: true,
      data: post
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    删除文章
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: '文章不存在' });
    }

    // 确保用户有权限删除
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限执行此操作' });
    }

    // 删除文章相关评论
    await Comment.deleteMany({ post: req.params.id });

    // 删除文章
    await post.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    点赞/取消点赞文章
// @route   PUT /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: '文章不存在' });
    }

    // 获取已点赞的用户列表
    let likedBy = [];
    if (post.likedBy) {
      likedBy = post.likedBy;
    } else {
      post.likedBy = [];
    }

    // 检查用户是否已点赞
    const userIndex = likedBy.indexOf(req.user.id);

    if (userIndex === -1) {
      // 用户未点赞，添加点赞
      post.likes += 1;
      post.likedBy.push(req.user.id);
    } else {
      // 用户已点赞，取消点赞
      post.likes -= 1;
      post.likedBy.splice(userIndex, 1);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        likes: post.likes,
        liked: userIndex === -1
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    添加评论
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: '文章不存在' });
    }

    const comment = await Comment.create({
      content: req.body.content,
      post: req.params.id,
      author: req.user.id
    });

    // 填充作者信息并返回
    await comment.populate('author', 'username avatar');

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};