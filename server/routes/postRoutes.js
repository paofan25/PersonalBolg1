const express = require('express');
const { check } = require('express-validator');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 公共路由
router.get('/', getPosts);
router.get('/:id', getPost);

// 受保护的路由
router.post(
  '/',
  [
    protect,
    check('title', '标题不能为空').not().isEmpty(),
    check('content', '内容不能为空').not().isEmpty()
  ],
  createPost
);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.post(
  '/:id/comments',
  [
    protect,
    check('content', '评论内容不能为空').not().isEmpty()
  ],
  addComment
);

module.exports = router;