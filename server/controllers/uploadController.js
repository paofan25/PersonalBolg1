const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/'
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型'), false)
  }
}

// 创建 multer 实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制文件大小为 5MB
  }
})

// 处理单个文件上传
exports.uploadFile = (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: '文件大小不能超过 5MB'
          })
        }
      }
      return res.status(400).json({
        success: false,
        message: err.message || '文件上传失败'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      })
    }

    // 返回文件URL
    const fileUrl = `/uploads/${req.file.filename}`
    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename
      }
    })
  })
}

// 删除文件
exports.deleteFile = (req, res) => {
  const { filename } = req.params
  const filePath = path.join(__dirname, '../uploads', filename)

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: '删除文件失败'
      })
    }

    res.json({
      success: true,
      message: '文件删除成功'
    })
  })
}