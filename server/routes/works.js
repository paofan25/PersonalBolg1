const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const worksController = require('../controllers/worksController');

// @route   GET /api/works
// @desc    获取所有作品
// @access  Public
router.get('/', worksController.getWorks);

// @route   GET /api/works/:id
// @desc    获取单个作品
// @access  Public
router.get('/:id', worksController.getWorkById);

// @route   POST /api/works
// @desc    创建作品
// @access  Private
router.post('/', [
  auth,
  [
    check('title', '标题不能为空').not().isEmpty(),
    check('description', '描述不能为空').not().isEmpty(),
    check('cover', '请上传作品封面').not().isEmpty(),
    check('link', '请提供作品链接').not().isEmpty(),
    check('category', '请选择作品分类').not().isEmpty()
  ]
], worksController.createWork);

// @route   PUT /api/works/:id
// @desc    更新作品
// @access  Private
router.put('/:id', auth, worksController.updateWork);

// @route   DELETE /api/works/:id
// @desc    删除作品
// @access  Private
router.delete('/:id', auth, worksController.deleteWork);

module.exports = router; 