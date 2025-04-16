const { validationResult } = require('express-validator');
const Work = require('../models/Work');

// @desc    获取所有作品
exports.getWorks = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (featured) {
      query.featured = featured === 'true';
    }

    const works = await Work.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Work.countDocuments(query);

    res.json({
      code: 200,
      data: {
        works,
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

// @desc    获取单个作品
exports.getWorkById = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id)
      .populate('author', 'username avatar');

    if (!work) {
      return res.status(404).json({
        code: 404,
        message: '作品不存在'
      });
    }

    res.json({
      code: 200,
      data: work
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// @desc    创建作品
exports.createWork = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      errors: errors.array()
    });
  }

  try {
    const work = new Work({
      ...req.body,
      author: req.user.id
    });

    await work.save();

    res.status(201).json({
      code: 200,
      data: work
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// @desc    更新作品
exports.updateWork = async (req, res) => {
  try {
    let work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({
        code: 404,
        message: '作品不存在'
      });
    }

    // 确保用户是作品作者
    if (work.author.toString() !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '没有权限修改此作品'
      });
    }

    work = await Work.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.json({
      code: 200,
      data: work
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
};

// @desc    删除作品
exports.deleteWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({
        code: 404,
        message: '作品不存在'
      });
    }

    // 确保用户是作品作者
    if (work.author.toString() !== req.user.id) {
      return res.status(403).json({
        code: 403,
        message: '没有权限删除此作品'
      });
    }

    await work.remove();

    res.json({
      code: 200,
      message: '作品已删除'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    });
  }
}; 