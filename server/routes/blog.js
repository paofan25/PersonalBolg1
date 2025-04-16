const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const blogController = require('../controllers/blogController');

// @route   GET /api/blog
// @desc    获取所有博客文章
// @access  Public
router.get('/', blogController.getBlogs);

// @route   GET /api/blog/:id
// @desc    获取单个博客文章
// @access  Public
router.get('/:id', blogController.getBlogById);

// @route   POST /api/blog
// @desc    创建博客文章
// @access  Private
router.post('/', [
  auth,
  [
    check('title', '标题不能为空').not().isEmpty(),
    check('content', '内容不能为空').not().isEmpty(),
  ]
], blogController.createBlog);

// @route   PUT /api/blog/:id
// @desc    更新博客文章
// @access  Private
router.put('/:id', auth, blogController.updateBlog);

// @route   DELETE /api/blog/:id
// @desc    删除博客文章
// @access  Private
router.delete('/:id', auth, blogController.deleteBlog);

module.exports = router; 